const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile);

module.exports = router;
