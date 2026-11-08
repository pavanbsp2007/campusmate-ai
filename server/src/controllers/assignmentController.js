const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    let sql = `
      SELECT a.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (priority && priority !== 'all') {
      sql += ' AND a.priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY a.status ASC, a.due_date ASC';

    const assignments = await db.query(sql, params);

    const now = new Date();
    const enriched = assignments.map((a) => {
      const due = new Date(a.due_date);
      const diffMs = due - now;
      const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...a,
        hoursLeft,
        daysLeft,
        isOverdue: diffMs < 0 && a.status !== 'completed',
        isDueSoon: hoursLeft <= 48 && hoursLeft > 0 && a.status !== 'completed'
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments.', error: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectId, description, dueDate, priority, submissionLink } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required.' });
    }

    const id = 'asn_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO assignments (id, user_id, subject_id, title, description, due_date, priority, status, submission_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        subjectId || null,
        title.trim(),
        description || '',
        dueDate,
        priority || 'medium',
        'pending',
        submissionLink || ''
      ]
    );

    // Create deadline notification
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + uuidv4().substring(0, 8),
        userId,
        'assignment',
        `New Assignment Added: ${title}`,
        `Due on ${new Date(dueDate).toLocaleDateString()}. Priority set to ${priority || 'medium'}.`,
        0,
        '/assignments'
      ]
    );

    return res.status(201).json({ success: true, message: 'Assignment created successfully!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create assignment.', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // 'pending', 'in_progress', 'completed'

    await db.query('UPDATE assignments SET status = ? WHERE id = ? AND user_id = ?', [status, id, userId]);
    return res.json({ success: true, message: `Assignment updated to ${status}!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update assignment.', error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM assignments WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete assignment.', error: error.message });
  }
};
