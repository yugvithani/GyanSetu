const express = require('express');
const { getProfile,getUserId,getUserById, updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

// for file upload 
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, path.join(__dirname, '../uploads/')); // Use path.join and __dirname
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname)); // File naming
//     }
//   });
// const upload = multer({ storage: storage });
const upload = multer();

const router = express.Router();

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/getId', verifyToken,getUserId);
router.get("/:userId", verifyToken, getUserById);

router.put("/profile", upload.single('profilePicture'), verifyToken, updateProfile);

module.exports = router;
