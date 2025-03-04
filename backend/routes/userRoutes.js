const express = require('express');
const { getProfile, getUserId, getUserById, updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer();

const router = express.Router();

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/getId', verifyToken, getUserId);
router.get("/:userId", verifyToken, getUserById);

router.put("/profile", verifyToken, upload.single('profilePicture'), updateProfile);

module.exports = router;
