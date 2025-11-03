/**
 * Upload API Service
 * 
 * API calls for file uploads to Cloudinary
 * @module services/uploadApi
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Upload a single file
 * 
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * 
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

