const express = require('express');
const router = express.Router();
const studyPlannerController = require('../controllers/studyPlannerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', studyPlannerController.getStudyPlannerData);
router.post('/goal', studyPlannerController.addGoal);
router.put('/goal/:id', studyPlannerController.toggleGoal);
router.post('/session', studyPlannerController.logSession);
router.get('/ai-recommendation', studyPlannerController.getAiRecommendation);

module.exports = router;
