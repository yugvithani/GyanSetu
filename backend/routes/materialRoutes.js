const express = require("express");
const {  getMaterials, deleteMaterial } = require("../controllers/materialController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:groupId", verifyToken, getMaterials);
router.delete("/:id", verifyToken, deleteMaterial);

module.exports = router;
