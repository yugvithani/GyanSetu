// Only Azure-related logic here, making migration easy
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");
require("dotenv").config();
const sharp = require("sharp");
// const multer = require("multer");

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "profile-pictures"; // Azure container name

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection string not found.");
}

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// Upload and compress image to Azure Blob Storage
const uploadCompressedImage = async (file) => {
  try {
    // file.originalname=file.name;
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

const AZURE_IMAGE_STORAGE_ACCOUNT_NAME = process.env.AZURE_IMAGE_STORAGE_ACCOUNT_NAME;
const AZURE_IMAGE_STORAGE_ACCOUNT_KEY = process.env.AZURE_IMAGE_STORAGE_ACCOUNT_KEY;

const blobServiceClientSAS = new BlobServiceClient(
  `https://${AZURE_IMAGE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_IMAGE_STORAGE_ACCOUNT_NAME, AZURE_IMAGE_STORAGE_ACCOUNT_KEY)
);

// Generate a SAS URL for secure access by temp url from the main url
const generateSasUrl = async (blobName) => {
  try {
    const containerClient = blobServiceClientSAS.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 6);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: CONTAINER_NAME,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("r"), //read permission
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

// Delete old image form the azure storage
const deleteImageFromAzure = async (blobName) => {
  try {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();
    console.log(`Deleted old profile picture: ${blobName}`);
  } catch (error) {
    console.error("Error deleting old image from Azure:", error);
  }
};

module.exports = { uploadCompressedImage, generateSasUrl, deleteImageFromAzure };