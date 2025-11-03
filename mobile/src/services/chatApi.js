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
    const conversation = response.data;
    return normalizeConversationDates(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
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
const getEmployeeNameFromId = (employeeId) => {
  if (!employeeId || !employeeId.startsWith('emp_')) {
    return '';
  }
  
  return employeeId
    .substring(4) // Remove 'emp_' prefix
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate employee ID from name
 * Helper function to convert name to employee ID format
 * 
 * @param {string} name - Employee name
 * @returns {string} Employee ID (e.g., 'emp_alice_johnson')
 */
const generateEmployeeId = (name) => {
  if (!name) return '';
  
  return 'emp_' + name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Derives senderId from a participant name
 * Maps participantNames[0] (HR) → 'hr_sconnor'
 * Maps participantNames[1] (Employee) → employee ID format
 * 
 * @param {string} participantName - Participant name from participantNames array
 * @returns {string} Sender ID (e.g., 'hr_sconnor' or 'emp_alice_johnson')
 */
export const getSenderIdFromParticipantName = (participantName) => {
  if (!participantName) return '';
  
  // Check if it's HR name (matches HR_USER.NAME)
  if (participantName.includes('(HR)') || participantName.toLowerCase().includes('sarah connor')) {
    return 'hr_sconnor'; // HR User ID
  }
  
  // Otherwise, derive employee ID from name
  return generateEmployeeId(participantName);
};

/**
 * Checks if a senderId corresponds to a participant name
 * Used to determine if a message is "my message" based on participantNames index
 * 
 * @param {string} senderId - Message senderId (e.g., 'hr_sconnor' or 'emp_alice_johnson')
 * @param {string} participantName - Participant name from participantNames array
 * @returns {boolean} True if senderId matches the participant name
 */
export const doesSenderIdMatchParticipantName = (senderId, participantName) => {
  if (!senderId || !participantName) return false;
  
  // Derive expected senderId from participant name
  const expectedSenderId = getSenderIdFromParticipantName(participantName);
  
  return senderId === expectedSenderId;
};

/**
 * Get conversation (read-only, no creation)
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Conversation object
 */
export const getConversation = async (employeeId) => {
  try {
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }

    const response = await get(`/conversations/${employeeId}`);
    
    if (!response.data) {
      throw new Error('Conversation not found');
    }
    
    const conversation = response.data;
    return normalizeConversationDates(conversation);
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
 * @param {Array} attachments - Array of attachment objects with { url, type, name, size?, publicId? }
 * @returns {Promise<string>} ID of created message
 */
export const sendMessage = async (conversationIdOrEmployeeId, senderId, messageText, attachments = []) => {
  try {
    const response = await post('/messages', {
      conversationId: conversationIdOrEmployeeId,
      senderId,
      text: messageText || '',
      attachments: attachments || [],
    });
    return response.data._id || response.data.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

