const express = require("express");
const { getTasks, createTask, updateTaskStatus, deleteTask } = require("../controllers/taskController");
const verifyToken = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validate");

const router = express.Router();

router.get("/:groupId", verifyToken, getTasks);
router.post("/:groupId", verifyToken, validateBody(['title']), createTask);
router.put("/:taskId/status", verifyToken, validateBody(['status']), updateTaskStatus);
router.delete("/:taskId", verifyToken, deleteTask);

module.exports = router;
