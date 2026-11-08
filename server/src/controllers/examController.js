const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getExams = async (req, res) => {
  try {
    const userId = req.user.id;
    const exams = await db.query(
      `SELECT e.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
       FROM examinations e
       LEFT JOIN subjects s ON e.subject_id = s.id
       WHERE e.user_id = ?
       ORDER BY e.exam_date ASC`,
      [userId]
    );

    const now = new Date();
    const enriched = exams.map((ex) => {
      const examDate = new Date(ex.exam_date);
      const diffTime = examDate - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...ex,
        daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
        isPast: daysRemaining < 0,
        isUrgent: daysRemaining <= 7 && daysRemaining >= 0
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exams.', error: error.message });
  }
};

exports.addExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, examName, examDate, startTime, durationMinutes, roomNumber, syllabusTopics, targetScore } = req.body;

    if (!subjectId || !examName || !examDate) {
      return res.status(400).json({ success: false, message: 'Subject, exam name, and exam date are required.' });
    }

    const id = 'ex_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO examinations (id, user_id, subject_id, exam_name, exam_date, start_time, duration_minutes, room_number, syllabus_topics, target_score, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        userId,
        subjectId,
        examName.trim(),
        examDate,
        startTime || '09:30',
        durationMinutes || 180,
        roomNumber || '',
        syllabusTopics || '',
        targetScore || 85
      ]
    );

    // Create notification
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + uuidv4().substring(0, 8),
        userId,
        'exam',
        `Exam Added: ${examName}`,
        `Scheduled on ${examDate}. Prepare your revision timetable using AI Exam Prep Mode!`,
        0,
        '/exams'
      ]
    );

    return res.status(201).json({ success: true, message: 'Examination scheduled!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to schedule exam.', error: error.message });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { isCompleted } = req.body;

    await db.query('UPDATE examinations SET is_completed = ? WHERE id = ? AND user_id = ?', [
      isCompleted ? 1 : 0,
      id,
      userId
    ]);

    return res.json({ success: true, message: 'Exam status updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update exam.', error: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM examinations WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Exam deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete exam.', error: error.message });
  }
};
