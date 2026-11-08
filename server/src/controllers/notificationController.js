const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // First, dynamically generate alerts if conditions are met
    await checkAndGenerateDynamicAlerts(userId);

    const notifications = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === 'all') {
      await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.', error: error.message });
  }
};

// Internal dynamic generator
async function checkAndGenerateDynamicAlerts(userId) {
  try {
    // 1. Check attendance warnings (< 75%)
    const attendanceAlerts = await db.query(
      `SELECT s.name, a.total_classes, a.attended_classes 
       FROM attendance a 
       JOIN subjects s ON a.subject_id = s.id 
       WHERE a.user_id = ? AND a.total_classes > 0 AND (CAST(a.attended_classes as REAL)/a.total_classes) < 0.75`,
      [userId]
    );

    for (const item of attendanceAlerts) {
      const pct = Math.round((item.attended_classes / item.total_classes) * 100);
      const existing = await db.query(
        `SELECT id FROM notifications WHERE user_id = ? AND title LIKE ? AND created_at >= date('now', '-2 days')`,
        [userId, `%${item.name}%`]
      );
      if (existing.length === 0) {
        await db.query(
          `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
           VALUES (?, ?, ?, ?, ?, 0, ?)`,
          [
            'notif_' + uuidv4().substring(0, 8),
            userId,
            'attendance',
            `Low Attendance Warning: ${item.name}`,
            `Current attendance is ${pct}%. Attend upcoming lectures to prevent exam debarment.`,
            '/attendance'
          ]
        );
      }
    }
  } catch (e) {
    // ignore background alert issues
  }
}
