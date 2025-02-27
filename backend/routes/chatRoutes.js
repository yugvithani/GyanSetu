const express = require('express');
const { getGroupMessages, sendMessage,uploadMiddleware,sendAttachment } = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:groupId/messages', verifyToken, getGroupMessages);
router.post('/:groupId/send', verifyToken, sendMessage);
router.post('/:groupId/attachment',verifyToken ,uploadMiddleware,sendAttachment);

module.exports = router;
