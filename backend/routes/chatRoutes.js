const express = require('express');
const { getGroupMessages, sendMessage,uploadFile } = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer();

router.get('/:groupId/messages', verifyToken, getGroupMessages);
router.post('/:groupId/send', verifyToken, sendMessage);
router.post('/:groupId/upload', verifyToken,upload.single('file'), uploadFile);

module.exports = router;
