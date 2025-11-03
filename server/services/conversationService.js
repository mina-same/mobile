/**
 * Conversation Service
 * 
 * Business logic for conversation operations
 * @module services/conversationService
 */

import Conversation from '../models/Conversation.js';

/**
 * Get all conversations
 * 
 * @returns {Promise<Array>} Array of conversations sorted by last message timestamp
 */
export const getAllConversations = async () => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastMessageTimestamp: -1 });

    return conversations;
  } catch (error) {
    console.error('Error in getAllConversations:', error);
    throw error;
  }
};

/**
 * Get conversation by employee ID
 * 
 * @param {string} employeeId - Employee ID (e.g., 'emp_alice_johnson')
 * @returns {Promise<Object|null>} Conversation or null
 */
export const getConversationByEmployeeId = async (employeeId) => {
  try {
    const conversation = await Conversation.findOne({ employeeId });
    return conversation;
  } catch (error) {
    console.error('Error in getConversationByEmployeeId:', error);
    throw error;
  }
};

/**
 * Get conversation for an employee (read-only, no creation)
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object|null>} Conversation or null if not found
 */
export const getConversation = async (employeeId) => {
  try {
    const conversation = await Conversation.findOne({ employeeId });
    
    if (!conversation) {
      return null;
    }

    return conversation;
  } catch (error) {
    console.error('Error in getConversation:', error);
    throw error;
  }
};

/**
 * Update conversation metadata
 * 
 * @param {string} employeeId - Employee ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated conversation or null
 */
export const updateConversation = async (employeeId, updateData) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { employeeId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return conversation;
  } catch (error) {
    console.error('Error in updateConversation:', error);
    throw error;
  }
};

/**
 * Update conversation last message
 * 
 * @param {string} employeeId - Employee ID
 * @param {string} messageText - Last message text
 * @returns {Promise<Object|null>} Updated conversation or null
 */
export const updateConversationLastMessage = async (employeeId, messageText) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          lastMessage: messageText.substring(0, 100), // First 100 chars
          lastMessageTimestamp: new Date(),
        },
      },
      { new: true }
    );

    return conversation;
  } catch (error) {
    console.error('Error in updateConversationLastMessage:', error);
    throw error;
  }
};

