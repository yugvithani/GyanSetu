const express = require("express");
const { createSession, getSessionByGroupId, deleteSession } = require("../controllers/sessionController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:groupId", verifyToken, getSessionByGroupId);
router.post("/create", verifyToken, createSession);
router.delete("/:meetingId", verifyToken, deleteSession);

module.exports = router;
