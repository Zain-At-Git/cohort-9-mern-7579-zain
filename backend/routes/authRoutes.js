const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login } = require('../controllers/authController');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

module.exports = router;