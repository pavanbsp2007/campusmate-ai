const express = require('express');
const router = express.Router();
const cgpaController = require('../controllers/cgpaController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cgpaController.getGradesAndCGPA);
router.post('/grade', cgpaController.addGrade);
router.delete('/grade/:id', cgpaController.deleteGrade);
router.post('/target-calculator', cgpaController.calculateTarget);

module.exports = router;
