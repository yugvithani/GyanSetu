const Group = require('../models/Group');
const Item = require('../models/Item');
const { generateSasUrl, uploadCompressedImage,uploadMaterial } = require("../services/azureService");
// Send Message to Group
exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, type , name} = req.body;
        const senderId = req.user.id;

        if (!content || !type) {
            return res.status(400).json({ error: 'Content and type are required' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const item = new Item({
            type,
            name,
            content,
            sender: senderId,
        });
        console.log(item);

        await item.save();
        group.items.push(item._id);
        await group.save();

        res.status(201).json(item);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get All Messages & Attachments for a Group
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate({
            path: 'items',
            match: { type: { $in: ['message', 'image', 'material'] } },
            populate: { path: 'sender', select: 'name' },
        });

        if (!group) return res.status(404).json({ error: 'Group not found' });

        const updatedItems = await Promise.all(group.items.map(async (item) => {
            if ((item.type[0] === 'image' || item.type[0] === 'material') && item.content) {
                try {
                    const blobName = (item.content).split("/").pop().split('?')[0];
                    const containerName = item.type[0] === 'material' ? 'materials' : 'profile-pictures';
                    const sasUrl = await generateSasUrl(blobName, containerName);
                    return { ...item.toObject(), content: sasUrl };
                } catch (error) {
                    console.error("SAS URL generation failed:", error);
                    return item;
                }
            }
            return item;
        }));

        res.status(200).json(updatedItems);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }
        
        const fileType = req.body.type; // 'image' or 'material'
        // console.log(fileType);
        if (!fileType || !['image', 'material'].includes(fileType)) {
            return res.status(400).json({ error: "Invalid file type" });
        }
        // const originalName = req.file.originalname;
        const fileUrl = fileType === 'image' ? await uploadCompressedImage(req.file) : await uploadMaterial(req.file);
        if (!fileUrl) {
            return res.status(500).json({ error: "File upload failed" });
        }

        res.status(201).json({ url: fileUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
