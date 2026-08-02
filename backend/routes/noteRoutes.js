// routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createNote, getNotes, getNoteById, updateNote, deleteNote  , togglePin} = require('../controllers/noteController');

router.use(protect); // sab routes protected hain (login zaroori)

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);

module.exports = router;