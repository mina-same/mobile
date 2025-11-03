/**
 * Upload Controller
 * 
 * Handles file uploads to Cloudinary
 * @module controllers/uploadController
 */

import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Upload a file
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'hr-feedback/chat',
      resource_type: resourceType,
    });

    // Determine attachment type for client
    const attachmentType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    res.status(200).json({
      success: true,
      data: {
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        type: attachmentType,
        name: req.file.originalname,
        size: req.file.size,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error.message,
    });
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      // Determine resource type
      let resourceType = 'auto';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw';
      }

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file.buffer, {
        folder: 'hr-feedback/chat',
        resource_type: resourceType,
      });

      // Determine attachment type
      const attachmentType = file.mimetype.startsWith('image/') ? 'image' : 'file';

      return {
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        type: attachmentType,
        name: file.originalname,
        size: file.size,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: uploadResults,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
      details: error.message,
    });
  }
};

