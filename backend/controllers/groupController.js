const Group = require('../models/Group');
const User = require('../models/User');
const Item = require('../models/Item');
const Session = require('../models/Session');
const crypto = require("crypto");
// Create a new group
exports.createGroup = async (req, res) => {
    const userId = req.user.id;
    const { name, description, isPrivate } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Group name is required" });
    }

    const groupCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates an 8-character random code

    try {
        const newGroup = new Group({
            name,
            description,
            groupCode,
            admin: userId,
            members: [userId], // The creator is automatically a member
            items: [],
            isPrivate,
        });

        await newGroup.save();

        // Add the group to the user's adminGroups only (not memberGroups)
        await User.findByIdAndUpdate(userId, {
            $push: { adminGroups: newGroup._id }
        });

        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: "Error creating group" });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    const userId = req.user.id;
    const { groupCode } = req.body;
    
    try {
        const group = await Group.findOne({ groupCode });
        if (!group) return res.status(400).json({ error: "Invalid group code" });
  
        if (group.members.includes(userId)) return res.status(400).json({ error: "Already a member" });
  
        // Add user to the group's members array
        group.members.push(userId);
        
        // Add the group to the user's memberGroups array
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: "User not found" });

        user.memberGroups.push(group._id);
        
        // Save both the group and user
        await group.save();
        await user.save();

        res.json(group);
    } catch (error) {
        cosnole.log(error);
        res.status(500).json({ error: "Error joining group" });
    }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate([
            { path: 'adminGroups', select: '_id name description isPrivate' },
            { path: 'memberGroups', select: '_id name description isPrivate' }
        ]);

        if (!user) return res.status(404).json({ error: "User not found" });

        const groups = [
            ...user.adminGroups,
            ...user.memberGroups
        ];

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: "Error fetching groups" });
    }
};

    

// Get a single group by ID
exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        res.status(200).json({
            _id:req.params.id,
            name: group.name,
            description: group.description,
            groupCode: group.groupCode,
            admin: group.admin,
            members: group.members
        });

        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update group details (Only Admin Can Update)
exports.updateGroup = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const userId = req.user.id;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (group.admin.toString() !== userId) {
            return res.status(403).json({ error: 'Only admin can update this group' });
        }

        group.name = name || group.name;
        group.description = description || group.description;
        group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;
        group.updatedAt = Date.now();

        await group.save();
        console.log("Group updated successfully")
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: "Error updating group" });
    }
};

// Remove a member from a group (Only Admin Can Remove)
exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.user.id;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ error: 'Only admin can remove members' });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ error: 'User is not a member of this group' });
        }

        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();

        await User.findByIdAndUpdate(userId, {
            $pull: { memberGroups: group._id }
        });

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ error: "Error removing member" });
    }
};

// Delete a group (Only Admin Can Delete)
exports.deleteGroup = async (req, res) => {
    try {
        const adminId = req.user.id;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ error: 'Only admin can delete this group' });
        }

        await Group.findByIdAndDelete(req.params.id);

        await User.updateMany(
            { $or: [{ adminGroups: group._id }, { memberGroups: group._id }] },
            { $pull: { adminGroups: group._id, memberGroups: group._id } }
        );

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Error deleting group" });
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


exports.exitGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        // If user is the admin, prevent them from exiting directly
        if (group.admin.toString() === userId) {
            return res.status(403).json({ error: 'Admin cannot exit the group. Try deleting it instead.' });
        }

        // Remove user from members list
        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();

        // Remove group reference from user's memberGroups list
        await User.findByIdAndUpdate(userId, { $pull: { memberGroups: group._id } });

        res.status(200).json({ message: 'Exited the group successfully' });
    } catch (error) {
        res.status(500).json({ error: "Error exiting group" });
    }
};


exports.searchPublicGroups = async (req, res) => {
    
    const query  = req.query.query;
    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const groups = await Group.find({
            name: { $regex: query, $options: "i" }, // Case-insensitive search
            isPrivate: false, // Only search public groups
        }).select("_id name description groupCode");  // Include groupCode

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: "Error searching groups" });
    }
};
