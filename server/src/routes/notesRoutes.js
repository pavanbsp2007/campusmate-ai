const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
