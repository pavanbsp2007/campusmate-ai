const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getTimetable = async (req, res) => {
  try {
    const userId = req.user.id;
    const { day } = req.query;

    let sql = `
      SELECT t.*, s.name as subject_name, s.code as subject_code, s.color as subject_color, s.professor
      FROM timetables t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (day) {
      sql += ' AND t.day_of_week = ?';
      params.push(day);
    }

    sql += ' ORDER BY CASE t.day_of_week WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 ELSE 7 END, t.start_time ASC';

    const slots = await db.query(sql, params);

    // Group by day of week for weekly matrix
    const weeklyMap = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    slots.forEach((s) => {
      if (weeklyMap[s.day_of_week]) {
        weeklyMap[s.day_of_week].push(s);
      }
    });

    return res.json({
      success: true,
      data: {
        raw: slots,
        weekly: weeklyMap
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch timetable.', error: error.message });
  }
};

exports.addSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, dayOfWeek, startTime, endTime, roomNumber, building, instructor } = req.body;

    if (!subjectId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Subject, day of week, and times are required.' });
    }

    const id = 'tt_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO timetables (id, user_id, subject_id, day_of_week, start_time, end_time, room_number, building, instructor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, subjectId, dayOfWeek, startTime, endTime, roomNumber || '', building || '', instructor || '']
    );

    return res.status(201).json({ success: true, message: 'Class slot added to timetable!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add timetable slot.', error: error.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM timetables WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Class slot removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete slot.', error: error.message });
  }
};
