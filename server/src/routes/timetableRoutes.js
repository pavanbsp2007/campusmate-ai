const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', timetableController.getTimetable);
router.post('/', timetableController.addSlot);
router.delete('/:id', timetableController.deleteSlot);

module.exports = router;
