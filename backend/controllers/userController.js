const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { uploadCompressedImage, generateSasUrl, deleteFileFromAzure } = require("../services/azureService");

exports.getUserId = async (req, res) => {
  res.status(200).json(req.user.id);
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name bio email profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePictureUrl = user.profilePicture;

    // If the user has a profile picture, generate a temporary SAS URL 
    if (profilePictureUrl) {
      const blobName = profilePictureUrl.split("/").pop().split('?')[0]; // Extract file name from the URL
      profilePictureUrl = await generateSasUrl(blobName);
      console.log("SAS URL:", profilePictureUrl);
    }

    res.status(200).json({ name: user.name, bio: user.bio, email: user.email, profilePicture: profilePictureUrl });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    var { name, bio } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select("profilePicture");
    let profilePictureUrl = user.profilePicture;

    if (req.file) {
      const newProfilePictureUrl = await uploadCompressedImage(req.file);

      if (user.profilePicture && newProfilePictureUrl !== user.profilePicture) {
        // Extract old image file name and delete from Azure
        const oldBlobName = user.profilePicture.split("/").pop().split("?")[0];
        await deleteFileFromAzure(oldBlobName);
      }

      profilePictureUrl = newProfilePictureUrl;
    }

    // Update the user with the provided fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio, profilePicture: profilePictureUrl || undefined },
      { new: true }
    ).select('name bio profilePicture');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};