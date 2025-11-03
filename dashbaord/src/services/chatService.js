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
  
  // Fetch initial data first
  chatApi.getAllConversations()
    .then((conversations) => {
      callback(conversations);
    })
    .catch((error) => {
      console.error('Error fetching initial conversations:', error);
      // Still set up listeners even if initial fetch fails
    });
  
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
  
  // Fetch initial data first
  chatApi.getMessages(conversationIdOrEmployeeId)
    .then((messages) => {
      callback(messages);
    })
    .catch((error) => {
      console.error('Error fetching initial messages:', error);
      // Still set up listeners even if initial fetch fails
    });
  
  // Subscribe to messages for this conversation
  socket.emit('subscribe:messages', conversationIdOrEmployeeId);
  
  // Listen for message events
  const onNewMessage = (data) => {
    try {
      // Since we're subscribed to the correct room on the server,
      // any message:new event should be for this conversation
      // Refresh messages from the API
      console.log('Received message:new event, refreshing messages...');
      chatApi.getMessages(conversationIdOrEmployeeId)
        .then((messages) => {
          console.log('Messages refreshed after new message:', messages.length);
          callback(messages);
        })
        .catch((error) => console.error('Error refreshing messages:', error));
    } catch (error) {
      console.error('Error handling new message event:', error);
      // On error, still try to refresh messages as fallback
      chatApi.getMessages(conversationIdOrEmployeeId)
        .then((messages) => callback(messages))
        .catch((err) => console.error('Error refreshing messages:', err));
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
  sendMessageFromHR,
  getEmployeeNameFromId,
} from './chatApi.js';
