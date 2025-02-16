const express = require('express');
const { getGroupMessages, sendMessage } = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:groupId/messages', verifyToken, getGroupMessages);
router.post('/:groupId/send', verifyToken, sendMessage);

module.exports = router;
