const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { validateBody } = require('../middlewares/validate');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5, // 5 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts, lock-out engaged for 15 minutes.' }
});

// Public routes
router.post('/register', authLimiter, validateBody(['name', 'email', 'password']), register);
router.post('/login', authLimiter, validateBody(['email', 'password']), login);
router.post('/logout', logout);

module.exports = router;
