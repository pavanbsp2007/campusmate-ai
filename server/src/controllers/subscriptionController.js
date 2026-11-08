const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const TIERS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    priceLabel: 'Free Forever',
    dailyAiLimit: 10,
    features: [
      'Attendance Calculator & Bunk Predictor',
      'CGPA & SGPA Calculator',
      'Interactive Timetable & Assignment Manager',
      'Peer Resource Hub',
      'Daily 10 AI Study Queries'
    ]
  },
  plus: {
    id: 'plus',
    name: 'Student Plus',
    price: 199,
    priceLabel: '₹199 / month',
    dailyAiLimit: 50,
    features: [
      'Everything in Free Plan',
      'AI Academic Tutor (Step-by-step)',
      'PDF Document Summarizer & Revision Notes',
      'AI MCQ Quiz Generator with Explanations',
      'Smart Flashcard Generator',
      'Daily 50 AI Queries'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Student Pro',
    price: 399,
    priceLabel: '₹399 / month',
    dailyAiLimit: 500,
    features: [
      'Everything in Student Plus',
      'AI Exam Prep Mode (Custom Timetable & Hot Topics)',
      'University Answer Generator (2/5/10 mark rubrics)',
      'Personalized AI Study Recommendations',
      'High Priority LLM Queue & Unlimited Access (500/day)',
      'Advanced CGPA Analytics & Target Projector'
    ]
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subs = await db.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    const currentSub = subs[0] || { plan_tier: 'free', ai_queries_used_today: 0, ai_queries_limit: 10 };

    return res.json({
      success: true,
      currentTier: currentSub.plan_tier || 'free',
      subscription: currentSub,
      plans: TIERS
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription.', error: error.message });
  }
};

exports.upgradePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetTier, paymentId } = req.body;

    if (!TIERS[targetTier]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan tier.' });
    }

    const tierInfo = TIERS[targetTier];
    const generatedPaymentId = paymentId || `pay_mock_${uuidv4().substring(0, 10)}`;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30 days validity

    await db.query(
      `UPDATE subscriptions SET
        plan_tier = ?,
        status = 'active',
        ai_queries_limit = ?,
        razorpay_payment_id = ?,
        expiry_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [targetTier, tierInfo.dailyAiLimit, generatedPaymentId, expiry.toISOString(), userId]
    );

    // Add confirmation notification
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        'notif_' + uuidv4().substring(0, 8),
        userId,
        'system',
        `Upgraded to ${tierInfo.name}! 🚀`,
        `Enjoy unlocked AI features and a daily limit of ${tierInfo.dailyAiLimit} AI queries.`,
        '/subscription'
      ]
    );

    return res.json({
      success: true,
      message: `Successfully upgraded to ${tierInfo.name}!`,
      planTier: targetTier,
      aiQueriesLimit: tierInfo.dailyAiLimit,
      paymentId: generatedPaymentId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to upgrade plan.', error: error.message });
  }
};
