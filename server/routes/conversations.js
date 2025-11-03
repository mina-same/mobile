/**
 * Conversations Routes
 * 
 * API routes for conversation operations
 * @module routes/conversations
 */

import express from 'express';
import * as conversationController from '../controllers/conversationController.js';

const router = express.Router();

// Get all conversations
router.get('/', conversationController.getAllConversations);

// Get conversation by employee ID
router.get('/:employeeId', conversationController.getConversationByEmployeeId);

// Get conversation (read-only, no creation)
// POST endpoint removed - conversations cannot be created via API
// Use GET /:employeeId or GET /?employeeId=... instead

export default router;

