const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'campusmate_jwt_secret_dev_key_2026_super_secure';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = await db.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

const checkAiUsageLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subs = await db.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    const sub = subs && subs.length > 0 ? subs[0] : { plan_tier: 'free', ai_queries_used_today: 0, ai_queries_limit: 5 };

    // Reset count if new day
    const today = new Date().toISOString().split('T')[0];
    if (sub.last_reset_date !== today) {
      await db.query('UPDATE subscriptions SET ai_queries_used_today = 0, last_reset_date = ? WHERE user_id = ?', [today, userId]);
      sub.ai_queries_used_today = 0;
    }

    if (sub.ai_queries_used_today >= sub.ai_queries_limit) {
      return res.status(429).json({
        success: false,
        message: `Daily AI query limit of ${sub.ai_queries_limit} reached for your ${sub.plan_tier.toUpperCase()} plan. Upgrade to Student Plus or Pro for unlimited access!`,
        limitReached: true,
        currentTier: sub.plan_tier
      });
    }

    req.userSubscription = sub;
    next();
  } catch (err) {
    next(); // Fall through if error
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  checkAiUsageLimit,
  JWT_SECRET
};
