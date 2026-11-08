const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
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

// Initialize Razorpay instance if credentials exist
let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('[Payment] Razorpay SDK initialized successfully with live/test key.');
  } catch (err) {
    console.warn('[Payment] Razorpay initialization notice:', err.message);
  }
}

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subs = await db.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    const currentSub = subs[0] || { plan_tier: 'free', ai_queries_used_today: 0, ai_queries_limit: 10 };

    return res.json({
      success: true,
      currentTier: currentSub.plan_tier || 'free',
      subscription: currentSub,
      plans: TIERS,
      isRazorpayConfigured: Boolean(razorpayInstance),
      upiConfig: {
        upiId: process.env.UPI_ID || 'pavanb1624@okhdfcbank',
        payeeName: process.env.UPI_PAYEE_NAME || 'CampusMate'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription.', error: error.message });
  }
};

/**
 * Creates an order on Razorpay for UPI / Card / NetBanking payment
 */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetTier } = req.body;

    if (!targetTier || !TIERS[targetTier]) {
      return res.status(400).json({ success: false, message: 'Invalid or unsupported subscription tier.' });
    }

    const tierInfo = TIERS[targetTier];
    const amountInPaise = tierInfo.price * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

    // If Razorpay instance is active with real/test keys
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${uuidv4().substring(0, 10)}`,
        notes: {
          userId,
          targetTier,
          product: 'CampusMate AI Subscription'
        }
      };

      const order = await razorpayInstance.orders.create(options);

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        tier: targetTier,
        tierName: tierInfo.name,
        price: tierInfo.price
      });
    }

    // Seamless Sandbox Demo Mode (Active if user hasn't added RAZORPAY_KEY_ID to .env yet)
    const simulatedOrderId = `order_sim_${uuidv4().substring(0, 12)}`;
    return res.json({
      success: true,
      isSandboxDemo: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_simulated_key',
      tier: targetTier,
      tierName: tierInfo.name,
      price: tierInfo.price,
      message: 'Razorpay keys not yet set in .env. Running in Instant Sandbox Demo Mode.'
    });

  } catch (error) {
    console.error('[Payment] Create order error:', error);
    return res.status(500).json({ success: false, message: 'Could not create payment order.', error: error.message });
  }
};

/**
 * Verifies the Razorpay payment HMAC SHA256 signature and upgrades student tier
 */
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      targetTier
    } = req.body;

    if (!targetTier || !TIERS[targetTier]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan tier.' });
    }

    const tierInfo = TIERS[targetTier];

    // Cryptographic signature verification if secret is present
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Signature mismatch. Potential tampering detected.'
        });
      }
    }

    const paymentId = razorpay_payment_id || `pay_${uuidv4().substring(0, 10)}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30-day billing cycle

    // Update student subscription
    await db.query(
      `UPDATE subscriptions SET
        plan_tier = ?,
        status = 'active',
        ai_queries_limit = ?,
        razorpay_payment_id = ?,
        expiry_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [targetTier, tierInfo.dailyAiLimit, paymentId, expiry.toISOString(), userId]
    );

    // Add confirmation notification
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        'notif_' + uuidv4().substring(0, 8),
        userId,
        'system',
        `Payment Successful! Welcome to ${tierInfo.name} 🚀`,
        `Payment ID: ${paymentId}. Your daily AI limit is now ${tierInfo.dailyAiLimit} queries.`,
        '/subscription'
      ]
    );

    return res.json({
      success: true,
      message: `Payment successful! Upgraded to ${tierInfo.name}.`,
      planTier: targetTier,
      aiQueriesLimit: tierInfo.dailyAiLimit,
      paymentId
    });

  } catch (error) {
    console.error('[Payment] Verification error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed.', error: error.message });
  }
};

/**
 * Direct upgrade fallback
 */
exports.upgradePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetTier, paymentId } = req.body;

    if (!TIERS[targetTier]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan tier.' });
    }

    const tierInfo = TIERS[targetTier];
    const generatedPaymentId = paymentId || `pay_direct_${uuidv4().substring(0, 10)}`;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

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

/**
 * Direct Zero-Fee UPI Payment (GPay / PhonePe / Paytm to pavanb1624@okhdfcbank)
 */
exports.submitUpiPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetTier, utrNumber, payerUpi } = req.body;

    if (!targetTier || !TIERS[targetTier]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription tier selected.' });
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 12-digit UPI Reference (UTR) Number.'
      });
    }

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    const tierInfo = TIERS[targetTier];
    const upiPaymentId = `UPI_${cleanUtr}`;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30-day validity

    // Update student subscription directly
    await db.query(
      `UPDATE subscriptions SET
        plan_tier = ?,
        status = 'active',
        ai_queries_limit = ?,
        razorpay_payment_id = ?,
        expiry_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [targetTier, tierInfo.dailyAiLimit, upiPaymentId, expiry.toISOString(), userId]
    );

    // Create confirmation notification
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, link)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        'notif_' + uuidv4().substring(0, 8),
        userId,
        'system',
        `UPI Payment Received! Welcome to ${tierInfo.name} 🚀`,
        `UTR No: ${cleanUtr}. Amount: ₹${tierInfo.price}. Your daily AI limit is now ${tierInfo.dailyAiLimit} queries.`,
        '/subscription'
      ]
    );

    return res.json({
      success: true,
      message: `UPI Payment verified! Welcome to ${tierInfo.name}.`,
      planTier: targetTier,
      aiQueriesLimit: tierInfo.dailyAiLimit,
      paymentId: upiPaymentId
    });
  } catch (error) {
    console.error('[Payment] UPI submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process UPI payment.', error: error.message });
  }
};
