/**
 * Chat API Service
 * 
 * API calls for chat operations (conversations and messages)
 * @module services/chatApi
 */

import { get, post } from './api.js';
import { normalizeConversationDates, normalizeMessageDates } from '../utils/dateNormalizer.js';

/**
 * Get all conversations
 * 
 * @returns {Promise<Array>} Array of conversations
 */
export const getAllConversations = async () => {
  try {
    const response = await get('/conversations');
    const conversations = response.data || [];
    return normalizeConversationDates(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation by employee ID
 * 
 * @param {string} employeeId - Employee ID (e.g., 'emp_alice_johnson')
 * @returns {Promise<Object>} Conversation object
 */
export const getConversationByEmployeeId = async (employeeId) => {
  try {
    const response = await get(`/conversations/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Get conversation (read-only, no creation)
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Conversation object
 */
export const getConversation = async (employeeId) => {
  try {
    // Validate inputs
    if (!employeeId) {
      console.error('getConversation called with invalid params:', { employeeId });
      throw new Error('Missing required field: employeeId');
    }
    
    const response = await get(`/conversations/${employeeId}`);
    
    if (!response.data) {
      throw new Error('Conversation not found');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Get all messages for a conversation
 * 
 * @param {string} conversationIdOrEmployeeId - Conversation ID or Employee ID
 * @returns {Promise<Array>} Array of messages
 */
export const getMessages = async (conversationIdOrEmployeeId) => {
  try {
    const response = await get(`/messages/${conversationIdOrEmployeeId}`);
    const messages = response.data || [];
    return normalizeMessageDates(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message
 * 
 * @param {string} conversationIdOrEmployeeId - Conversation ID or Employee ID
 * @param {string} senderId - Sender ID (e.g., 'hr_sconnor' or 'emp_alice_johnson')
 * @param {string} messageText - Message text
 * @param {Array} attachments - Array of attachment objects with url, type, name, size, publicId
 * @returns {Promise<string>} ID of created message
 */
export const sendMessage = async (conversationIdOrEmployeeId, senderId, messageText, attachments = []) => {
  try {
    const response = await post('/messages', {
      conversationId: conversationIdOrEmployeeId,
      senderId,
      text: messageText,
      attachments: attachments || [],
    });
    return response.data._id || response.data.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Send message from HR to an employee
 * 
 * @param {string} employeeName - Employee name
 * @param {string} messageText - Message text
 * @param {Array} attachments - Array of attachment objects with url, type, name, size, publicId
 * @returns {Promise<string>} ID of created message
 */
export const sendMessageFromHR = async (employeeName, messageText, attachments = []) => {
  try {
    const { generateEmployeeId } = await import('../utils/helpers.js');
    const { HR_USER } = await import('../config/constants.js');
    
    const employeeId = generateEmployeeId(employeeName);
    
    // Verify conversation exists (read-only, no creation)
    await getConversation(employeeId);
    
    // Send message
    return await sendMessage(employeeId, HR_USER.ID, messageText, attachments);
  } catch (error) {
    console.error('Error sending message from HR:', error);
    throw error;
  }
};

/**
 * Get employee name from ID
 * Helper function to extract name from employee ID
 * 
 * @param {string} employeeId - Employee ID (e.g., 'emp_alice_johnson')
 * @returns {string} Employee name
 */
export const getEmployeeNameFromId = (employeeId) => {
  if (!employeeId || !employeeId.startsWith('emp_')) {
    return '';
  }
  
  return employeeId
    .substring(4) // Remove 'emp_' prefix
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

