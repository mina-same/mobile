/**
 * Messages Routes
 * 
 * API routes for message operations
 * @module routes/messages
 */

import express from 'express';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

// Get all messages for a conversation
router.get('/:conversationId', messageController.getMessagesByConversationId);

// Create a new message
router.post('/', messageController.createMessage);

export default router;

