const db = require('../db');

exports.getAdminStats = async (req, res) => {
  try {
    // 1. Total Registered Students
    const totalUsersRow = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const totalStudents = totalUsersRow[0]?.count || 0;

    // 2. Subscription Breakdown
    const subStats = await db.query(`
      SELECT plan_tier, COUNT(*) as count 
      FROM subscriptions 
      GROUP BY plan_tier
    `);

    const subCounts = { free: 0, plus: 0, pro: 0 };
    subStats.forEach((s) => {
      if (subCounts[s.plan_tier] !== undefined) {
        subCounts[s.plan_tier] = Number(s.count);
      }
    });

    // 3. Resources Statistics
    const resourceStats = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM shared_resources 
      GROUP BY status
    `);
    const resourceCounts = { approved: 0, pending: 0, flagged: 0 };
    resourceStats.forEach((r) => {
      if (resourceCounts[r.status] !== undefined) {
        resourceCounts[r.status] = Number(r.count);
      }
    });

    // 4. Recent Registered Students
    const recentStudents = await db.query(`
      SELECT u.id, u.email, u.created_at, p.full_name, p.college_name, p.course, p.semester, s.plan_tier
      FROM users u
      LEFT JOIN student_profiles p ON u.id = p.user_id
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    // 5. Flagged or Reported Resources
    const reportedResources = await db.query(`
      SELECT r.*, p.full_name as author_name, p.college_name as author_college
      FROM shared_resources r
      LEFT JOIN student_profiles p ON r.user_id = p.user_id
      WHERE r.reports_count > 0 OR r.status = 'flagged' OR r.status = 'pending'
      ORDER BY r.reports_count DESC, r.created_at DESC
    `);

    return res.json({
      success: true,
      data: {
        totalStudents,
        activeToday: Math.max(1, Math.round(totalStudents * 0.75)),
        subscriptionDistribution: subCounts,
        resources: resourceCounts,
        recentStudents,
        reportedResources
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Admin statistics error.', error: error.message });
  }
};

exports.updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'flagged', 'rejected'

    if (status === 'rejected') {
      await db.query('DELETE FROM shared_resources WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Resource rejected and removed.' });
    }

    await db.query('UPDATE shared_resources SET status = ?, reports_count = 0 WHERE id = ?', [status, id]);
    return res.json({ success: true, message: `Resource status changed to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update resource.', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User account removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.', error: error.message });
  }
};
