const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getResources = async (req, res) => {
  try {
    const { category, subject, search } = req.query;

    let sql = `
      SELECT r.*, p.full_name as author_name, p.college_name as author_college
      FROM shared_resources r
      LEFT JOIN student_profiles p ON r.user_id = p.user_id
      WHERE r.status = 'approved'
    `;
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND r.category = ?';
      params.push(category);
    }
    if (subject && subject !== 'all') {
      sql += ' AND r.subject_name LIKE ?';
      params.push(`%${subject}%`);
    }
    if (search) {
      sql += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.subject_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.upvotes DESC, r.created_at DESC';

    const resources = await db.query(sql, params);
    return res.json({ success: true, data: resources });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resources.', error: error.message });
  }
};

exports.uploadResource = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectName, category, description, fileUrl, fileSize } = req.body;

    if (!title || !subjectName || !category) {
      return res.status(400).json({ success: false, message: 'Title, subject name, and category are required.' });
    }

    // Moderation check: keywords
    const lowerTitle = title.toLowerCase();
    const isSuspicious = ['hack', 'malware', 'crack', 'cheat_engine'].some((w) => lowerTitle.includes(w));
    const status = isSuspicious ? 'pending' : 'approved';

    const id = 'res_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO shared_resources (id, user_id, subject_name, title, category, file_url, file_size, description, upvotes, reports_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
      [
        id,
        userId,
        subjectName.trim(),
        title.trim(),
        category,
        fileUrl || 'https://campusmate.ai/cdn/docs/sample.pdf',
        fileSize || '1.8 MB',
        description || '',
        status
      ]
    );

    return res.status(201).json({
      success: true,
      message: isSuspicious
        ? 'Resource uploaded and submitted for moderation review.'
        : 'Resource published to the Student Hub successfully!',
      id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to upload resource.', error: error.message });
  }
};

exports.upvoteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE shared_resources SET upvotes = upvotes + 1 WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Upvoted!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to upvote.', error: error.message });
  }
};

exports.reportResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await db.query(
      `UPDATE shared_resources SET reports_count = reports_count + 1 WHERE id = ?`,
      [id]
    );

    // If report count reaches 3, set status to flagged
    const rows = await db.query('SELECT reports_count FROM shared_resources WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].reports_count >= 3) {
      await db.query(`UPDATE shared_resources SET status = 'flagged' WHERE id = ?`, [id]);
    }

    return res.json({
      success: true,
      message: 'Report submitted. Our moderation team has been alerted.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to report resource.', error: error.message });
  }
};
