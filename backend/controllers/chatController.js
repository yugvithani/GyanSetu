const Group = require('../models/Group');
const Item = require('../models/Item');
const {generateSasUrl,uploadCompressedImage}=require("../services/azureService");
// Send Message to Group
exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, type } = req.body;
        const senderId = req.user.id;

        if (!content || !type) {
            return res.status(400).json({ error: 'Content and type are required' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const item = new Item({
            type,
            content,
            sender: senderId,
        });

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
            match: { type: { $in: ['message', 'image'] } },
            populate: { path: 'sender', select: 'name' },
        });

        if (!group) return res.status(404).json({ error: 'Group not found' });

        const updatedItems = await Promise.all(group.items.map(async (item) => {
            if (item.type[0] === 'image' && item.content) {
                try {
                    const blobName = (item.content).split("/").pop().split('?')[0];
                    console.log("file url: \n",blobName);
                    const sasUrl = await generateSasUrl(blobName);
                    console.log(sasUrl);
                    return { ...item.toObject(), content: sasUrl };
                } catch (error) {
                    console.error("SAS URL generation failed:", error);
                    return item; // Return original item if SAS fails
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

        console.log("Uploading file:", req.file.originalname);

        // Upload the file and get the URL
        const fileUrl = await uploadCompressedImage(req.file);
        console.log("Uploading file:", fileUrl);
        if (!fileUrl) {
            return res.status(500).json({ error: "File upload failed" });
        }

        // Return URL in expected format
        res.status(201).json({ url: fileUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};