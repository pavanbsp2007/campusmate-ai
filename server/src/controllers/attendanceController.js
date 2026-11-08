const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function calculateAttendanceMetrics(total, attended, targetPct = 75) {
  const percentage = total > 0 ? Math.round((attended / total) * 100 * 10) / 10 : 100;
  let canBunk = 0;
  let mustAttend = 0;

  if (percentage >= targetPct) {
    canBunk = Math.max(0, Math.floor(attended / (targetPct / 100) - total));
  } else {
    mustAttend = Math.max(0, Math.ceil((targetPct * total - 100 * attended) / (100 - targetPct)));
  }

  let status = 'safe';
  if (percentage < targetPct) status = 'critical';
  else if (percentage - targetPct < 5) status = 'warning';

  return { percentage, canBunk, mustAttend, status };
}

exports.getAttendanceList = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = await db.query(
      `SELECT 
        s.*,
        COALESCE(a.id, '') as attendance_id,
        COALESCE(a.total_classes, 0) as total_classes,
        COALESCE(a.attended_classes, 0) as attended_classes,
        a.last_updated
       FROM subjects s
       LEFT JOIN attendance a ON s.id = a.subject_id AND a.user_id = ?
       WHERE s.user_id = ?
       ORDER BY s.name ASC`,
      [userId, userId]
    );

    let overallTotal = 0;
    let overallAttended = 0;

    const list = subjects.map((sub) => {
      const total = Number(sub.total_classes);
      const attended = Number(sub.attended_classes);
      overallTotal += total;
      overallAttended += attended;
      const metrics = calculateAttendanceMetrics(total, attended, sub.target_attendance_pct || 75);

      return {
        ...sub,
        total_classes: total,
        attended_classes: attended,
        ...metrics
      };
    });

    const overallMetrics = calculateAttendanceMetrics(overallTotal, overallAttended, 75);

    return res.json({
      success: true,
      data: {
        subjects: list,
        summary: {
          overallTotal,
          overallAttended,
          ...overallMetrics,
          warningCount: list.filter((s) => s.status === 'critical').length
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance.', error: error.message });
  }
};

exports.addSubjectWithAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, code, credits, professor, color, semester, targetAttendancePct, totalClasses, attendedClasses } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const subjectId = 'sub_' + uuidv4().substring(0, 8);
    const attendanceId = 'att_' + uuidv4().substring(0, 8);

    await db.query(
      `INSERT INTO subjects (id, user_id, code, name, credits, professor, color, semester, target_attendance_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subjectId,
        userId,
        code || 'CS' + Math.floor(100 + Math.random() * 900),
        name.trim(),
        credits || 3,
        professor || 'Course Instructor',
        color || '#6366F1',
        semester || 1,
        targetAttendancePct || 75
      ]
    );

    await db.query(
      `INSERT INTO attendance (id, user_id, subject_id, total_classes, attended_classes)
       VALUES (?, ?, ?, ?, ?)`,
      [attendanceId, userId, subjectId, totalClasses || 0, attendedClasses || 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Subject and attendance initialized!',
      subjectId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create subject.', error: error.message });
  }
};

exports.updateAttendanceCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.params;
    const { totalClasses, attendedClasses, targetAttendancePct } = req.body;

    const existing = await db.query(
      'SELECT id FROM attendance WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );

    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE attendance SET total_classes = ?, attended_classes = ?, last_updated = CURRENT_TIMESTAMP WHERE user_id = ? AND subject_id = ?',
        [totalClasses, attendedClasses, userId, subjectId]
      );
    } else {
      await db.query(
        'INSERT INTO attendance (id, user_id, subject_id, total_classes, attended_classes) VALUES (?, ?, ?, ?, ?)',
        ['att_' + uuidv4().substring(0, 8), userId, subjectId, totalClasses, attendedClasses]
      );
    }

    if (targetAttendancePct) {
      await db.query('UPDATE subjects SET target_attendance_pct = ? WHERE id = ? AND user_id = ?', [
        targetAttendancePct,
        subjectId,
        userId
      ]);
    }

    return res.json({ success: true, message: 'Attendance records updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update attendance.', error: error.message });
  }
};

exports.logDailyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, status, notes } = req.body; // status: 'present', 'absent', 'cancelled'
    const today = new Date().toISOString().split('T')[0];

    // Record log
    await db.query(
      `INSERT INTO attendance_logs (id, user_id, subject_id, log_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['attlog_' + uuidv4().substring(0, 8), userId, subjectId, today, status, notes || '']
    );

    // Update aggregate
    if (status === 'present') {
      await db.query(
        'UPDATE attendance SET total_classes = total_classes + 1, attended_classes = attended_classes + 1 WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
    } else if (status === 'absent') {
      await db.query(
        'UPDATE attendance SET total_classes = total_classes + 1 WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
    }

    return res.json({ success: true, message: `Class recorded as ${status}!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to log class.', error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.params;

    await db.query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [subjectId, userId]);
    return res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete subject.', error: error.message });
  }
};
