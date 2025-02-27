const Group = require('../models/Group');
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Send Message to Group
exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content) return res.status(400).json({ error: 'Message content is required' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const message = new Item({
            type: ['message'],
            content,
            sender: senderId,
        });

        await message.save();
        group.items.push(message._id);
        await group.save();

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Upload & Send Attachment
exports.sendAttachment = async (req, res) => {
    try {
        const { groupId } = req.params;
        const senderId = req.user.id;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const attachment = new Item({
            type: ['attachment'],
            content: `/uploads/${file.filename}`,
            sender: senderId,
        });

        await attachment.save();
        group.items.push(attachment._id);
        await group.save();

        res.status(201).json(attachment);
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware for handling file uploads
exports.uploadMiddleware = upload.single('file');

// Get All Messages & Attachments for a Group
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate({
            path: 'items',
            match: { type: { $in: ['message', 'attachment'] } },
            populate: { path: 'sender', select: 'name' },
        });

        if (!group) return res.status(404).json({ error: 'Group not found' });

        res.status(200).json(group.items);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
