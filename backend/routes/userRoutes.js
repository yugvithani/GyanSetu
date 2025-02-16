const express = require('express');
const { getProfile,getUserId } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/getId', verifyToken,getUserId);

module.exports = router;
