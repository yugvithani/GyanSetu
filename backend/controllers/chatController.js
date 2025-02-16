const Group = require('../models/Group');
const Item = require('../models/Item');

// Save message to the database
exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id; // Extracted from JWT

        // Validate input
        if (!content) return res.status(400).json({ error: 'Message content is required' });

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Create a new message item
        const message = new Item({
            type: ['message'],
            content,
            sender: senderId,
        });

        await message.save();

        // Add the message to the group's items array
        group.items.push(message._id);
        await group.save();

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all messages for a group
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate({
            path: 'items',
            match: { type: 'message' },
            populate: { path: 'sender', select: 'name' },
        });

        if (!group) return res.status(404).json({ error: 'Group not found' });

        res.status(200).json(group.items);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
