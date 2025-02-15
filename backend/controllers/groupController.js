const Group = require('../models/Group');
const User = require('../models/User');
const Item = require('../models/Item');
const Session = require('../models/Session');

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        const { name, description, groupCode, adminId, isPrivate } = req.body;
        const newGroup = new Group({
            name,
            description,
            groupCode,
            admin: adminId,
            members: [adminId],
            isPrivate
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    try {
        const { groupCode, userId } = req.body;
        const group = await Group.findOne({ groupCode });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('admin members');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('admin members items');
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update group details
exports.updateGroup = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const group = await Group.findByIdAndUpdate(req.params.id, { name, description, isPrivate }, { new: true });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove a member from a group
exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all messages in a group
exports.getGroupMessages = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate({ path: 'items', match: { type: 'message' }, populate: { path: 'sender' } });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group.items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send a message in a group
exports.sendMessage = async (req, res) => {
    try {
        const { groupId, senderId, content } = req.body;
        const message = new Item({ type: ['message'], content, sender: senderId });
        await message.save();

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        group.items.push(message._id);
        await group.save();

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all members of a group
exports.getGroupMembers = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('members');
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group.members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
