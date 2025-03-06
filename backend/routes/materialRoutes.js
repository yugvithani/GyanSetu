const express = require("express");
const { uploadMaterial, getMaterials, deleteMaterial } = require("../controllers/materialController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/upload", verifyToken, uploadMaterial);
router.get("/all", verifyToken, getMaterials);
router.delete("/:id", verifyToken, deleteMaterial);

module.exports = router;
