const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, search } = req.query;

    let sql = `
      SELECT n.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
      FROM notes n
      LEFT JOIN subjects s ON n.subject_id = s.id
      WHERE n.user_id = ?
    `;
    const params = [userId];

    if (subjectId && subjectId !== 'all') {
      sql += ' AND n.subject_id = ?';
      params.push(subjectId);
    }
    if (search) {
      sql += ' AND (n.title LIKE ? OR n.content LIKE ? OR n.tags LIKE ?)';
      const queryStr = `%${search}%`;
      params.push(queryStr, queryStr, queryStr);
    }

    sql += ' ORDER BY n.is_favorite DESC, n.updated_at DESC';

    const notes = await db.query(sql, params);
    return res.json({ success: true, data: notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notes.', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectId, content, tags, isFavorite } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const id = 'note_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO notes (id, user_id, subject_id, title, content, tags, is_favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, subjectId || null, title.trim(), content, tags || '', isFavorite ? 1 : 0]
    );

    return res.status(201).json({ success: true, message: 'Note created successfully!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create note.', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, subjectId, content, tags, isFavorite } = req.body;

    await db.query(
      `UPDATE notes SET
        title = COALESCE(?, title),
        subject_id = COALESCE(?, subject_id),
        content = COALESCE(?, content),
        tags = COALESCE(?, tags),
        is_favorite = COALESCE(?, is_favorite),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, subjectId, content, tags, isFavorite !== undefined ? (isFavorite ? 1 : 0) : undefined, id, userId]
    );

    return res.json({ success: true, message: 'Note updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update note.', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete note.', error: error.message });
  }
};
