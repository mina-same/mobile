/**
 * Chat Service
 * 
 * Updated service using REST API and Socket.io for real-time updates
 * Replaces Firebase/Firestore operations
 * @module services/chatService
 */

import * as chatApi from './chatApi.js';
import { getSocket } from './socket.js';

/**
 * Subscribe to conversations list updates via Socket.io
 * 
 * @param {Function} callback - Callback function called with updated conversations
 * @returns {Function} Unsubscribe function
 */
export const subscribeConversations = (callback) => {
  const socket = getSocket();
  
  // Subscribe to conversations updates
  socket.emit('subscribe:conversations');
  
  // Listen for conversation events
  const onUpdated = (data) => {
    // Refresh conversations list
    chatApi.getAllConversations()
      .then((conversations) => callback(conversations))
      .catch((error) => console.error('Error refreshing conversations:', error));
  };
  
  socket.on('conversation:updated', onUpdated);
  
  // Return unsubscribe function
  return () => {
    socket.off('conversation:updated', onUpdated);
    socket.emit('unsubscribe:conversations');
  };
};

/**
 * Subscribe to messages updates for a conversation via Socket.io
 * 
 * @param {string} conversationIdOrEmployeeId - Conversation ID or Employee ID
 * @param {Function} callback - Callback function called with updated messages
 * @returns {Function} Unsubscribe function
 */
export const subscribeMessages = (conversationIdOrEmployeeId, callback) => {
  const socket = getSocket();
  
  // Subscribe to messages for this conversation
  socket.emit('subscribe:messages', conversationIdOrEmployeeId);
  
  // Listen for message events
  const onNewMessage = (data) => {
    // Check if message belongs to this conversation
    const messageConversationId = data.conversationId?._id || data.conversationId;
    const conversationId = typeof conversationIdOrEmployeeId === 'string' 
      ? conversationIdOrEmployeeId 
      : conversationIdOrEmployeeId.toString();
    
    // If conversation matches, refresh messages
    if (messageConversationId === conversationId || 
        data.conversationId?.employeeId === conversationId) {
      chatApi.getMessages(conversationIdOrEmployeeId)
        .then((messages) => callback(messages))
        .catch((error) => console.error('Error refreshing messages:', error));
    }
  };
  
  socket.on('message:new', onNewMessage);
  
  // Return unsubscribe function
  return () => {
    socket.off('message:new', onNewMessage);
    socket.emit('unsubscribe:messages', conversationIdOrEmployeeId);
  };
};

// Re-export API functions
export {
  getAllConversations,
  getConversationByEmployeeId,
  getConversation,
  getMessages,
  sendMessage,
} from './chatApi.js';
