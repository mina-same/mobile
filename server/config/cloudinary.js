/**
 * Cloudinary Configuration
 * 
 * Configures Cloudinary for file uploads
 * @module config/cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * 
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder name in Cloudinary
 * @param {string} options.public_id - Public ID for the file
 * @param {string} options.resource_type - Resource type (auto, image, video, raw)
 * @returns {Promise<Object>} Upload result with URL and other metadata
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'hr-feedback/chat',
      resource_type: options.resource_type || 'auto',
      ...options,
    };

    // If file is a buffer, use upload_stream
    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                resource_type: result.resource_type,
              });
            }
          }
        );

        uploadStream.end(file);
      });
    }

    // If file is a path string, use upload
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * 
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;

