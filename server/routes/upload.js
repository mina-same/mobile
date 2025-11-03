/**
 * Upload Routes
 * 
 * API routes for file uploads
 * @module routes/upload
 */

import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for memory storage (to pass buffer to Cloudinary)
const storage = multer.memoryStorage();

// File filter to accept images and documents
const fileFilter = (req, file, cb) => {
  // Accept images and common document types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    // React Native might send these variations
    'image/*',
    'application/*',
  ];

  // Check if mimetype matches allowed types or starts with allowed prefix
  const isAllowed = allowedMimeTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.replace('/*', '');
      return file.mimetype.startsWith(prefix);
    }
    return file.mimetype === type || file.mimetype.includes(type);
  });

  // Also allow files that start with image/ or application/ (more lenient for React Native)
  if (isAllowed || file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/')) {
    cb(null, true);
  } else {
    console.warn(`⚠️ File upload rejected - unsupported MIME type: ${file.mimetype}`);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDF, Word documents, and text files are allowed.`), false);
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Single file upload
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Multiple files upload
router.post('/multiple', upload.array('files', 10), uploadController.uploadFiles);

export default router;

