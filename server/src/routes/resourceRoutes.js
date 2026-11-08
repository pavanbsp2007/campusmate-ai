const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', resourceController.getResources);
router.post('/', resourceController.uploadResource);
router.post('/:id/upvote', resourceController.upvoteResource);
router.post('/:id/report', resourceController.reportResource);

module.exports = router;
