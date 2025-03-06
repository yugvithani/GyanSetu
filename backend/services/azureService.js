require("dotenv").config();
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");
const sharp = require("sharp");

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_IMAGE_STORAGE_ACCOUNT_NAME = process.env.AZURE_IMAGE_STORAGE_ACCOUNT_NAME;
const AZURE_IMAGE_STORAGE_ACCOUNT_KEY = process.env.AZURE_IMAGE_STORAGE_ACCOUNT_KEY;
const MATERIAL_CONTAINER_NAME = "materials"; // Default material container
const PROFILE_PICTURE_CONTAINER_NAME = "profile-pictures"; // Default profile picture container

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection string not found.");
}

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(PROFILE_PICTURE_CONTAINER_NAME);

// Upload and compress image to Azure Blob Storage
const uploadCompressedImage = async (file) => {
  try {
    let imageBuffer = file.buffer;
    console.log(file.originalname);
    const originalSize = file.size / (1024 * 1024);

    if (originalSize > 3) {
      imageBuffer = await sharp(file.buffer).resize(600, 600).jpeg({ quality: 60 }).toBuffer();
    } else if (originalSize > 1) {
      imageBuffer = await sharp(file.buffer).jpeg({ quality: 60 }).toBuffer();
    }

    const sanitizedFileName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const blobName = `${Date.now()}-${sanitizedFileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(imageBuffer, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' },
    });

    return await generateSasUrl(blobName);
  } catch (error) {
    console.error("Azure Upload Error:", error);
    throw new Error("Image upload failed.");
  }
};

// Initialize BlobServiceClient for SAS token generation
const blobServiceClientSAS = new BlobServiceClient(
  `https://${AZURE_IMAGE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_IMAGE_STORAGE_ACCOUNT_NAME, AZURE_IMAGE_STORAGE_ACCOUNT_KEY)
);

// Generate a SAS URL for secure access
const generateSasUrl = async (blobName, containerName = PROFILE_PICTURE_CONTAINER_NAME) => {
  try {
    const containerClient = blobServiceClientSAS.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 6);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // Read-only access
        expiresOn: expiryTime,
      },
      new StorageSharedKeyCredential(AZURE_IMAGE_STORAGE_ACCOUNT_NAME, AZURE_IMAGE_STORAGE_ACCOUNT_KEY)
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  } catch (error) {
    console.error("Error generating SAS URL:", error);
    throw new Error("Failed to generate SAS token.");
  }
};

// Delete file from Azure Blob Storage
const deleteFileFromAzure = async (blobName, containerName = PROFILE_PICTURE_CONTAINER_NAME) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();
    console.log(`Deleted file: ${blobName} from ${containerName}`);
  } catch (error) {
    console.error("Error deleting file from Azure:", error);
  }
};

// Upload a general file (e.g., materials)
const uploadMaterial = async (file) => {
  try {
    const sanitizedFileName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const blobName = `${Date.now()}-${sanitizedFileName}`;
    const materialContainerClient = blobServiceClient.getContainerClient(MATERIAL_CONTAINER_NAME);
    const blockBlobClient = materialContainerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    return await generateSasUrl(blobName, MATERIAL_CONTAINER_NAME);
  } catch (error) {
    console.error("Azure Material Upload Error:", error);
    throw new Error("Material upload failed.");
  }
};

// Export functions
module.exports = { uploadCompressedImage, generateSasUrl, deleteFileFromAzure, uploadMaterial };
