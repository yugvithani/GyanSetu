const Item = require('../models/Item');
const { uploadCompressedImage, deleteImageFromAzure } = require("../services/azureService");

// Upload material
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { groupId } = req.params;
    const uploadedBy = req.user.id;

    const fileUrl = await uploadCompressedImage(req.file);
    if (!fileUrl) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const material = new Item({
      type: "material",
      content: fileUrl,
      sender: uploadedBy,
      groupId,
    });

    await material.save();
    res.status(201).json(material);
  } catch (error) {
    console.error("Error uploading material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all materials for a group
exports.getMaterials = async (req, res) => {
  try {
    const { groupId } = req.params;
    const materials = await Item.find({ groupId, type: "material" })
      .sort({ createdAt: -1 })
      .populate("sender", "name");

    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await Item.findById(materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Extract blob name and delete from Azure
    const blobName = material.content.split('/').pop().split('?')[0];
    await deleteImageFromAzure(blobName);

    await material.deleteOne();
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
