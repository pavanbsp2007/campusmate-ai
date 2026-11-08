const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', subscriptionController.getSubscription);
router.post('/upgrade', subscriptionController.upgradePlan);

module.exports = router;
