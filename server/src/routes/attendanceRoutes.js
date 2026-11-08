const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', attendanceController.getAttendanceList);
router.post('/subject', attendanceController.addSubjectWithAttendance);
router.put('/subject/:subjectId', attendanceController.updateAttendanceCount);
router.post('/log', attendanceController.logDailyAttendance);
router.delete('/subject/:subjectId', attendanceController.deleteSubject);

module.exports = router;
