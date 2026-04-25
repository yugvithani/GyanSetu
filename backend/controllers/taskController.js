const Task = require("../models/Task");
const Group = require("../models/Group");

exports.getTasks = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if user is in group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.includes(req.user.id) && String(group.admin) !== req.user.id) {
       return res.status(403).json({ error: "Not a member of this group" });
    }

    const tasks = await Task.find({ groupId })
      .populate("assignedTo", "name profilePicture email")
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 });
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;

    // Check if user is in group
    const group = await Group.findById(groupId);
    if (!group.members.includes(req.user.id) && String(group.admin) !== req.user.id) {
       return res.status(403).json({ error: "Not a member of this group" });
    }

    if (!title) return res.status(400).json({ error: "Title is required" });

    const newTask = new Task({
      groupId,
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user.id
    });

    await newTask.save();
    
    // Return populated task
    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name profilePicture email")
      .populate("createdBy", "name profilePicture");

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Ensure status is valid
    if (!["todo", "in_progress", "done"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    task.status = status;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task status" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Only creator or admin can delete
    const group = await Group.findById(task.groupId);
    if (String(task.createdBy) !== req.user.id && String(group.admin) !== req.user.id) {
       return res.status(403).json({ error: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
