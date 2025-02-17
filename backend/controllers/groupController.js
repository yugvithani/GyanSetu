const Group = require('../models/Group');
const User = require('../models/User');
const Item = require('../models/Item');
const Session = require('../models/Session');
const crypto = require("crypto");
// Create a new group
exports.createGroup = async (req, res) => {
    const userId = req.user.id;
    const { name, description, isPrivate } = req.body;
    // console.log(name, description, isPrivate)
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
  
      group.members.push(userId);
      await group.save();
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Error joining group" });
    }
  };
// Get all groups
exports.getAllGroups = async (req, res) => {
    const userId = req.user.id;
      try {
        const groups = await Group.find({ admin: userId })
      .select("_id name description isPrivate"); 
    
        res.status(200).json(groups);
      } catch (error) {
        res.status(500).json({ error: "Error fetching groups" });
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