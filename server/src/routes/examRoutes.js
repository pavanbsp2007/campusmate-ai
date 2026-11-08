const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', examController.getExams);
router.post('/', examController.addExam);
router.put('/:id/complete', examController.toggleComplete);
router.delete('/:id', examController.deleteExam);

module.exports = router;
