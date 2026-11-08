const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.put('/:id/status', assignmentController.updateStatus);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
