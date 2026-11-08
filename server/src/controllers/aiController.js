const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const db = require('../db');
const { callAiService } = require('../services/aiService');

// A. AI Tutor
exports.askTutor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, level, subject } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Question or concept query is required.' });
    }

    const result = await callAiService(
      'tutor',
      { query, level: level || 'Undergraduate', subject: subject || 'General' },
      userId
    );

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI Tutor service error.', error: error.message });
  }
};

// B. PDF Summarizer
exports.summarizeDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    let extractedText = req.body.text || '';
    let docTitle = req.body.title || 'Uploaded Document';

    // If PDF file was uploaded via multer
    if (req.file) {
      docTitle = req.file.originalname;
      try {
        const dataBuffer = req.file.buffer;
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text;
      } catch (pdfErr) {
        console.warn('PDF parse fallback, using simulated text if buffer unreadable:', pdfErr.message);
      }
    }

    if (!extractedText && !req.body.topic) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or enter text/topic to summarize.' });
    }

    const result = await callAiService(
      'summarize',
      {
        topic: req.body.topic || docTitle,
        textContent: extractedText.substring(0, 5000)
      },
      userId
    );

    return res.json({ success: true, documentTitle: docTitle, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Document Summarizer error.', error: error.message });
  }
};

// C. AI MCQ Generator
exports.generateMCQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, subjectId, count } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const result = await callAiService('mcq', { topic, count: count || 4 }, userId);

    // Optionally save quiz to database
    let savedQuizId = null;
    if (result.data && result.data.questions) {
      savedQuizId = 'quiz_' + uuidv4().substring(0, 8);
      await db.query(
        `INSERT INTO quizzes (id, user_id, subject_id, title, topic) VALUES (?, ?, ?, ?, ?)`,
        [savedQuizId, userId, subjectId || null, `${topic} Practice Quiz`, topic]
      );

      for (const q of result.data.questions) {
        await db.query(
          `INSERT INTO quiz_questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'qq_' + uuidv4().substring(0, 8),
            savedQuizId,
            q.question,
            q.options.A,
            q.options.B,
            q.options.C,
            q.options.D,
            q.correctAnswer,
            q.explanation
          ]
        );
      }
    }

    return res.json({
      success: true,
      quizId: savedQuizId,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'MCQ Generator error.', error: error.message });
  }
};

// Save Quiz Score
exports.submitQuizScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, score, totalQuestions } = req.body;

    const resultId = 'qr_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO quiz_results (id, user_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?, ?)`,
      [resultId, userId, quizId, score, totalQuestions]
    );

    return res.json({ success: true, message: 'Quiz score recorded!', resultId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record quiz score.', error: error.message });
  }
};

// D. Flashcard Generator
exports.generateFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, subjectId } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const result = await callAiService('flashcards', { topic }, userId);

    // Save Deck & Cards to DB
    let savedDeckId = null;
    if (result.data && result.data.cards) {
      savedDeckId = 'deck_' + uuidv4().substring(0, 8);
      await db.query(
        `INSERT INTO flashcard_decks (id, user_id, subject_id, title, description) VALUES (?, ?, ?, ?, ?)`,
        [savedDeckId, userId, subjectId || null, `${topic} Flashcards`, `AI-generated flashcards for ${topic}`]
      );

      for (const card of result.data.cards) {
        await db.query(
          `INSERT INTO flashcards (id, deck_id, question, answer, difficulty, review_count) VALUES (?, ?, ?, ?, ?, ?)`,
          ['fc_' + uuidv4().substring(0, 8), savedDeckId, card.question, card.answer, card.difficulty || 'medium', 0]
        );
      }
    }

    return res.json({
      success: true,
      deckId: savedDeckId,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Flashcard Generator error.', error: error.message });
  }
};

// Get Flashcard Decks for user
exports.getFlashcardDecks = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await db.query(
      `SELECT d.*, s.name as subject_name,
        (SELECT COUNT(*) FROM flashcards WHERE deck_id = d.id) as card_count
       FROM flashcard_decks d
       LEFT JOIN subjects s ON d.subject_id = s.id
       WHERE d.user_id = ?
       ORDER BY d.created_at DESC`,
      [userId]
    );

    return res.json({ success: true, data: decks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch flashcard decks.', error: error.message });
  }
};

// Get Flashcards in a deck
exports.getDeckCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await db.query('SELECT * FROM flashcards WHERE deck_id = ?', [deckId]);
    return res.json({ success: true, data: cards });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cards.', error: error.message });
  }
};

// E. Exam Preparation Mode
exports.examPrepMode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, topics, examDate, availableHours } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const result = await callAiService(
      'exam-prep',
      {
        subject,
        topics,
        examDate,
        hoursAvailable: availableHours || 20
      },
      userId
    );

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Exam Prep service error.', error: error.message });
  }
};

// F. Answer Generator
exports.generateAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, marks, subject } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Question prompt is required.' });
    }

    const result = await callAiService(
      'answer-generator',
      {
        query,
        marks: marks || '5-mark',
        subject: subject || 'General'
      },
      userId
    );

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Answer Generator error.', error: error.message });
  }
};
