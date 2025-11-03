/**
 * Message Controller
 * 
 * Handles HTTP requests for message operations
 * @module controllers/messageController
 */

import * as messageService from '../services/messageService.js';
import * as conversationService from '../services/conversationService.js';

/**
 * Get all messages for a conversation
 */
export const getMessagesByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await messageService.getMessagesByConversationId(conversationId);

    res.status(200).json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error in getMessagesByConversationId controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      details: error.message,
    });
  }
};

/**
 * Create a new message
 */
export const createMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text, attachments } = req.body;

    // Validation
    if (!conversationId || !senderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conversationId, senderId',
      });
    }

    // Message must have either text or attachments
    const hasText = text && typeof text === 'string' && text.trim().length > 0;
    const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;
    
    if (!hasText && !hasAttachments) {
      return res.status(400).json({
        success: false,
        error: 'Message must have either text or attachments',
      });
    }

    // Validate text if provided
    if (text && typeof text === 'string') {
      if (text.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Message text cannot exceed 1000 characters',
        });
      }
    }

    // Validate attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (!attachment.url || !attachment.type || !attachment.name) {
          return res.status(400).json({
            success: false,
            error: 'Invalid attachment format. Each attachment must have url, type, and name',
          });
        }
        if (!['image', 'file'].includes(attachment.type)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid attachment type. Must be "image" or "file"',
          });
        }
      }
    }

    const message = await messageService.createMessage({
      conversationId,
      senderId,
      text: text || '',
      attachments: attachments || [],
    });

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error in createMessage controller:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

