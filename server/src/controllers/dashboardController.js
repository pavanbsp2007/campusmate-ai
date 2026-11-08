const db = require('../db');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Student Profile
    const profiles = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    const profile = profiles[0] || {};

    // 2. Day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    // 3. Today's Timetable
    const todayTimetable = await db.query(
      `SELECT t.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
       FROM timetables t
       LEFT JOIN subjects s ON t.subject_id = s.id
       WHERE t.user_id = ? AND t.day_of_week = ?
       ORDER BY t.start_time ASC`,
      [userId, currentDay]
    );

    // 4. Attendance Overview
    const attendanceStats = await db.query(
      `SELECT 
        s.id as subject_id,
        s.name as subject_name,
        s.code as subject_code,
        s.color as subject_color,
        s.target_attendance_pct,
        COALESCE(a.total_classes, 0) as total_classes,
        COALESCE(a.attended_classes, 0) as attended_classes
       FROM subjects s
       LEFT JOIN attendance a ON s.id = a.subject_id AND a.user_id = ?
       WHERE s.user_id = ?`,
      [userId, userId]
    );

    let totalClassesSum = 0;
    let attendedClassesSum = 0;
    let warningCount = 0;

    const formattedAttendance = attendanceStats.map((item) => {
      const total = Number(item.total_classes);
      const attended = Number(item.attended_classes);
      totalClassesSum += total;
      attendedClassesSum += attended;
      const pct = total > 0 ? Math.round((attended / total) * 100 * 10) / 10 : 100;
      const target = item.target_attendance_pct || 75;

      let canBunk = 0;
      let mustAttend = 0;

      if (pct >= target) {
        canBunk = Math.max(0, Math.floor(attended / (target / 100) - total));
      } else {
        mustAttend = Math.max(0, Math.ceil((target * total - 100 * attended) / (100 - target)));
        warningCount++;
      }

      return {
        ...item,
        percentage: pct,
        canBunk,
        mustAttend,
        isWarning: pct < target
      };
    });

    const overallAttendancePct =
      totalClassesSum > 0 ? Math.round((attendedClassesSum / totalClassesSum) * 100 * 10) / 10 : 85;

    // 5. Upcoming Examinations (sorted by date)
    const upcomingExams = await db.query(
      `SELECT e.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
       FROM examinations e
       LEFT JOIN subjects s ON e.subject_id = s.id
       WHERE e.user_id = ? AND e.is_completed = 0
       ORDER BY e.exam_date ASC
       LIMIT 4`,
      [userId]
    );

    const examsWithCountdown = upcomingExams.map((ex) => {
      const examDate = new Date(ex.exam_date);
      const today = new Date();
      const diffTime = examDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...ex,
        daysLeft: daysLeft < 0 ? 0 : daysLeft
      };
    });

    // 6. Pending Assignments
    const pendingAssignments = await db.query(
      `SELECT a.*, s.name as subject_name, s.color as subject_color
       FROM assignments a
       LEFT JOIN subjects s ON a.subject_id = s.id
       WHERE a.user_id = ? AND a.status != 'completed'
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [userId]
    );

    // 7. Daily Study Goals
    const todayStr = new Date().toISOString().split('T')[0];
    const studyGoals = await db.query(
      `SELECT g.*, s.name as subject_name, s.color as subject_color
       FROM study_goals g
       LEFT JOIN subjects s ON g.subject_id = s.id
       WHERE g.user_id = ? AND (g.target_date >= ? OR g.is_completed = 0)
       ORDER BY g.is_completed ASC, g.target_date ASC
       LIMIT 5`,
      [userId, todayStr]
    );

    // 8. Recent Study Activity
    const recentActivity = await db.query(
      `SELECT ss.*, s.name as subject_name, s.color as subject_color
       FROM study_sessions ss
       LEFT JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.user_id = ?
       ORDER BY ss.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // 9. Academic Progress / CGPA Summary
    const semesterGrades = await db.query(
      `SELECT semester, SUM(credits * grade_points) as total_points, SUM(credits) as total_credits
       FROM semester_grades
       WHERE user_id = ?
       GROUP BY semester
       ORDER BY semester ASC`,
      [userId]
    );

    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const semesterTrends = semesterGrades.map((sem) => {
      const points = Number(sem.total_points);
      const credits = Number(sem.total_credits);
      cumulativePoints += points;
      cumulativeCredits += credits;
      const sgpa = credits > 0 ? Math.round((points / credits) * 100) / 100 : 0;
      return {
        semester: `Sem ${sem.semester}`,
        sgpa
      };
    });

    const currentCGPA =
      cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 : 8.85;

    // 10. Unread Notifications Count
    const unreadNotifications = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    // 11. Subscription Info
    const subs = await db.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    const subscription = subs[0] || { plan_tier: 'free', ai_queries_used_today: 0, ai_queries_limit: 10 };

    return res.json({
      success: true,
      data: {
        profile,
        dayOfWeek: currentDay,
        timetable: todayTimetable,
        attendance: {
          overallPercentage: overallAttendancePct,
          totalClasses: totalClassesSum,
          attendedClasses: attendedClassesSum,
          warningCount,
          subjects: formattedAttendance
        },
        exams: examsWithCountdown,
        assignments: pendingAssignments,
        studyGoals,
        recentActivity,
        academicProgress: {
          cgpa: currentCGPA,
          semesterTrends: semesterTrends.length > 0 ? semesterTrends : [
            { semester: 'Sem 1', sgpa: 8.6 },
            { semester: 'Sem 2', sgpa: 8.9 },
            { semester: 'Sem 3', sgpa: 9.1 },
            { semester: 'Sem 4', sgpa: 8.8 }
          ]
        },
        unreadNotificationsCount: unreadNotifications[0]?.count || 0,
        subscription
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.', error: error.message });
  }
};
