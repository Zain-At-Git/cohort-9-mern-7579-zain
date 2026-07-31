// controllers/noteController.js
const db = require('../config/db');
const logger = require('../config/logger');

// CREATE note
const createNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId; // authMiddleware se aata hai

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const [result] = await db.query(
            'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, content || '']
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
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
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
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?',
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

const updateNote = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;
        const { title, content } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const [result] = await db.query(
            'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
            [title, content || '', noteId, userId]
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

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };