/**
 * Conversation Controller
 * 
 * Handles HTTP requests for conversation operations
 * @module controllers/conversationController
 */

import * as conversationService from '../services/conversationService.js';

/**
 * Get all conversations
 */
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getAllConversations();

    res.status(200).json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Error in getAllConversations controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      details: error.message,
    });
  }
};

/**
 * Get conversation by employee ID
 */
export const getConversationByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const conversation = await conversationService.getConversationByEmployeeId(employeeId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error in getConversationByEmployeeId controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      details: error.message,
    });
  }
};

/**
 * Get conversation (read-only, no creation allowed)
 * Conversations can only be created via seed scripts or admin tools
 */
export const getConversation = async (req, res) => {
  try {
    const { employeeId } = req.body || req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: employeeId',
      });
    }

    const conversation = await conversationService.getConversation(employeeId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
      message: 'Conversation retrieved',
    });
  } catch (error) {
    console.error('Error in getConversation controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation',
      details: error.message,
    });
  }
};

