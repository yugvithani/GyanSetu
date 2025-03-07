const Item = require('../models/Item');
const { deleteFileFromAzure } = require("../services/azureService");
const Group = require('../models/Group');

// Get all materials for a group
exports.getMaterials = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate({
        path: "items",
        match: { type: "material" }, 
        select: "name content timestamp sender", // Fetch only required fields
        populate: { path: "sender", select: "name" }, // Get sender name
        options: { sort: { timestamp: -1 } } 
      });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const formattedMaterials = group.items.map((material) => ({
      _id: material._id,
      name: material.name || "Unnamed Material",
      fileUrl: material.content || null, // Assuming 'content' holds the file URL
      createdAt: material.timestamp,
      senderName: material.sender ? material.sender.name : "Unknown"
    }));

    res.status(200).json(formattedMaterials);
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
    // console.log(blobName)
    await deleteFileFromAzure(blobName,'materials');

    // Remove material from related groups
    await Group.updateMany(
      { materials: materialId },
      { $pull: { materials: materialId } }
    );

    // Delete material from Items collection
    await material.deleteOne();

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

