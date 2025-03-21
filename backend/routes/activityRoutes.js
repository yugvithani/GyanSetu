const express = require('express');
const {
    addActivity,
    getUserActivities
} = require('../controllers/activityController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to add a new activity
router.post('/add', verifyToken, addActivity);

// Route to get all activities of the logged-in user
router.get('/all', verifyToken, getUserActivities);

module.exports = router;
