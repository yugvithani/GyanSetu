const express = require('express');
const {
    createGroup,
    joinGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    removeMember,
    deleteGroup,
    getGroupMembers,
    searchPublicGroups,
    exitGroup,
} = require('../controllers/groupController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search',verifyToken,searchPublicGroups);
router.post('/create', verifyToken, createGroup);
router.post('/join', verifyToken, joinGroup);
router.get('/all', verifyToken, getAllGroups);
router.get('/:id', verifyToken, getGroupById);
router.put('/:id', verifyToken, updateGroup);
router.delete('/:id', verifyToken, deleteGroup);
router.delete('/:id/member', verifyToken, removeMember);
router.get('/:id/members', verifyToken, getGroupMembers);
router.delete('/:id/exit', verifyToken, exitGroup); 

module.exports = router;
