const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', adminController.getAdminStats);
router.put('/resource/:id/status', adminController.updateResourceStatus);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
