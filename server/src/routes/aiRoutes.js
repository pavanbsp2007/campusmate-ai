const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { authenticate, checkAiUsageLimit } = require('../middleware/auth');
const { secureFileFilter, uploadLimiter } = require('../middleware/security');

// Multer upload for PDF Summarizer with secure file filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: secureFileFilter
});

router.use(authenticate);

// A. AI Tutor
router.post('/tutor', checkAiUsageLimit, aiController.askTutor);

// B. PDF Summarizer with upload limiter
router.post('/summarize', uploadLimiter, upload.single('file'), checkAiUsageLimit, aiController.summarizeDocument);

// C. MCQ Generator & Scoring
router.post('/mcq-generator', checkAiUsageLimit, aiController.generateMCQ);
router.post('/mcq/score', aiController.submitQuizScore);

// D. Flashcards
router.post('/flashcards', checkAiUsageLimit, aiController.generateFlashcards);
router.get('/flashcards/decks', aiController.getFlashcardDecks);
router.get('/flashcards/decks/:deckId', aiController.getDeckCards);

// E. Exam Prep Mode
router.post('/exam-prep', checkAiUsageLimit, aiController.examPrepMode);

// F. Answer Generator
router.post('/answer-generator', checkAiUsageLimit, aiController.generateAnswer);

module.exports = router;
