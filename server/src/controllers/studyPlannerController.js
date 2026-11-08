const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { callAiService } = require('../services/aiService');

exports.getStudyPlannerData = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Study Goals
    const goals = await db.query(
      `SELECT g.*, s.name as subject_name, s.color as subject_color
       FROM study_goals g
       LEFT JOIN subjects s ON g.subject_id = s.id
       WHERE g.user_id = ?
       ORDER BY g.is_completed ASC, g.target_date ASC`,
      [userId]
    );

    // Study Sessions
    const sessions = await db.query(
      `SELECT ss.*, s.name as subject_name, s.color as subject_color
       FROM study_sessions ss
       LEFT JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.user_id = ?
       ORDER BY ss.session_date DESC, ss.created_at DESC
       LIMIT 10`,
      [userId]
    );

    // Total study minutes logged
    const totalMinutesLogged = sessions.reduce((acc, curr) => acc + Number(curr.duration_minutes), 0);

    // Subject-wise distribution
    const subjectDistributionMap = {};
    sessions.forEach((s) => {
      const name = s.subject_name || 'General Study';
      subjectDistributionMap[name] = (subjectDistributionMap[name] || 0) + Number(s.duration_minutes);
    });

    const subjectDistribution = Object.keys(subjectDistributionMap).map((k) => ({
      subject: k,
      minutes: subjectDistributionMap[k],
      hours: Math.round((subjectDistributionMap[k] / 60) * 10) / 10
    }));

    return res.json({
      success: true,
      data: {
        goals,
        sessions,
        totalMinutesLogged,
        totalHoursLogged: Math.round((totalMinutesLogged / 60) * 10) / 10,
        subjectDistribution
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch study planner data.', error: error.message });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectId, targetDate, targetHours } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ success: false, message: 'Title and target date are required.' });
    }

    const id = 'sg_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO study_goals (id, user_id, subject_id, title, target_date, target_hours, completed_hours, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
      [id, userId, subjectId || null, title.trim(), targetDate, Number(targetHours) || 2.0]
    );

    return res.status(201).json({ success: true, message: 'Study goal added!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add study goal.', error: error.message });
  }
};

exports.toggleGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { isCompleted, completedHours } = req.body;

    await db.query(
      `UPDATE study_goals SET
        is_completed = COALESCE(?, is_completed),
        completed_hours = COALESCE(?, completed_hours)
       WHERE id = ? AND user_id = ?`,
      [isCompleted !== undefined ? (isCompleted ? 1 : 0) : undefined, completedHours, id, userId]
    );

    return res.json({ success: true, message: 'Goal updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle goal.', error: error.message });
  }
};

exports.logSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, sessionType, durationMinutes, notes } = req.body;

    if (!durationMinutes) {
      return res.status(400).json({ success: false, message: 'Duration in minutes is required.' });
    }

    const id = 'sess_' + uuidv4().substring(0, 8);
    const today = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO study_sessions (id, user_id, subject_id, session_type, duration_minutes, notes, session_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, subjectId || null, sessionType || 'pomodoro', Number(durationMinutes), notes || '', today]
    );

    return res.status(201).json({ success: true, message: 'Study session logged!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to log session.', error: error.message });
  }
};

exports.getAiRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get upcoming exams
    const exams = await db.query(
      `SELECT e.*, s.name as subject_name FROM examinations e LEFT JOIN subjects s ON e.subject_id = s.id WHERE e.user_id = ? AND e.is_completed = 0 ORDER BY e.exam_date ASC LIMIT 2`,
      [userId]
    );

    const nearestExam = exams[0] || { subject_name: 'Core Subjects', exam_date: '2026-11-20' };

    const aiResult = await callAiService(
      'exam-prep',
      {
        subject: nearestExam.subject_name,
        examDate: nearestExam.exam_date,
        hoursAvailable: 15
      },
      userId
    );

    return res.json({ success: true, recommendation: aiResult.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI recommendation error.', error: error.message });
  }
};
