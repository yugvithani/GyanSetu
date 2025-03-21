const User = require('../models/User');
const Activity = require('../models/Activity');

// Add an activity to a group
exports.addActivity = async (req, res) => {
    try {
        const {  type, content } = req.body;
        const userId = req.user.id;

        if (!type || !content) {
            return res.status(400).json({ error: " type and content are required" });
        }

        
        const newActivity = new Activity({
            user: userId,
            type,
            content,
        });

        await newActivity.save();
        
        await User.findByIdAndUpdate(userId, {
            $push: { activities: newActivity._id }
        });

        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ error: "Error adding activity" });
    }
};

// Get all activities for a group
exports.getUserActivities = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the authenticated request

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const activityIds = user.activities; // Extract activity IDs

        const activities = await Activity.find({ _id: { $in: activityIds } }).sort({ timestamp: -1 });

        res.status(200).json(activities); // Return full activity details
    } catch (error) {
        res.status(500).json({ error: "Error fetching activities" });
    }
};
