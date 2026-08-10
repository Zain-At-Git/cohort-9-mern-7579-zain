const sanitizeHtml = require('sanitize-html');
const db = require('../config/db');
const logger = require('../config/logger');

const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt'],
    },
};

// CREATE note
const createNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const cleanContent = sanitizeHtml(content || '', sanitizeOptions);

        const [result] = await db.query(
            'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, cleanContent]
        );

        logger.info(`Note created: noteId=${result.insertId}, userId=${userId}`);
        res.status(201).json({ success: true, message: 'Note created', noteId: result.insertId });

    } catch (error) {
        next(error);
    }
};

// GET all notes (sirf logged-in user ki)
const getNotes = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const [notes] = await db.query(
            'SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC',
            [userId]
        );

        res.status(200).json({ success: true, notes });

    } catch (error) {
        next(error);
    }
};

// GET single note
const getNoteById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;

        const [notes] = await db.query(
            'SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?',
            [noteId, userId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        res.status(200).json({ success: true, note: notes[0] });

    } catch (error) {
        next(error);
    }
};

// UPDATE note
const updateNote = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;
        const { title, content } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const cleanContent = sanitizeHtml(content || '', sanitizeOptions);

        const [result] = await db.query(
            'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
            [title, cleanContent, noteId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        logger.info(`Note updated: noteId=${noteId}, userId=${userId}`);
        res.status(200).json({ success: true, message: 'Note updated' });

    } catch (error) {
        next(error);
    }
};

// DELETE note
const deleteNote = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;

        const [result] = await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        logger.info(`Note deleted: noteId=${noteId}, userId=${userId}`);
        res.status(200).json({ success: true, message: 'Note deleted' });

    } catch (error) {
        next(error);
    }
};

// TOGGLE PIN — ab ek hi atomic query mein
const togglePin = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;

        const [result] = await db.query(
            'UPDATE notes SET is_pinned = NOT is_pinned WHERE id = ? AND user_id = ?',
            [noteId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        const [updated] = await db.query('SELECT is_pinned FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
        const newPinStatus = Boolean(updated[0].is_pinned);

        logger.info(`Note pin toggled: noteId=${noteId}, userId=${userId}, pinned=${newPinStatus}`);
        res.status(200).json({ success: true, message: newPinStatus ? 'Note pinned' : 'Note unpinned', isPinned: newPinStatus });

    } catch (error) {
        next(error);
    }
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, togglePin };