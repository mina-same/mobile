/**
 * useChat Hook
 * Manages: Messages, sending messages, real-time updates
 * Used in: Chat Screen
 * 
 * @module hooks/useChat
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMessages,
  sendMessage,
  subscribeMessages,
  getConversation,
  getConversationByEmployeeId,
} from '../services/chatService';
import { doesSenderIdMatchParticipantName, getSenderIdFromParticipantName } from '../services/chatApi';
import { LOADING_STATES, HR_USER, MESSAGE_TYPES } from '../config/constants';
import { generateEmployeeId } from '../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Custom hook for managing chat
 * 
 * Provides:
 * - Messages list for a conversation
 * - Sending messages
 * - Real-time message updates
 * - Loading and error states
 * - Helper functions for message handling
 * 
 * @param {Object} options - Hook options
 * @param {string} options.employeeId - Employee ID (conversation ID)
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch on mount (default: true)
 * @returns {Object} Chat state and methods
 * 
 * @example
 * const {
 *   messages,
 *   loading,
 *   sendChatMessage,
 *   isHRMessage,
 * } = useChat({
 *   employeeId: 'emp_alice_johnson',
 *   realtime: true
 * });
 */
const useChat = (options = {}) => {
  const { employeeId, employeeName, realtime = true, autoFetch = true } = options;
  
  // State management
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null); // Store current conversation with participantNames
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  /**
   * Gets the current employee ID from AsyncStorage
   * 
   * The employee ID tells us which employee is using the app.
   * This is stored locally so we know who's sending messages.
   * 
   * @returns {Promise<string|null>} Employee ID or null
   */
  const getCurrentEmployeeId = useCallback(async () => {
    try {
      const storedId = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_ID);
      
      // If we have a stored ID, use it
      if (storedId) {
        setCurrentEmployeeId(storedId);
        return storedId;
      }
      
      // If no ID stored and we have employeeId prop, use that
      if (employeeId) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_ID, employeeId);
        setCurrentEmployeeId(employeeId);
        return employeeId;
      }
      
      return null;
    } catch (err) {
      console.error('❌ Error getting employee ID:', err);
      return null;
    }
  }, [employeeId]);
  
  /**
   * Fetches messages from Firestore (one-time)
   * 
   * Used when realtime is disabled or for initial fetch.
   * 
   * @param {string} empId - Employee ID to fetch messages for
   * @param {string} empName - Employee name (optional, used for creating conversation)
   */
  const fetchMessages = useCallback(async (empId, empName = null) => {
    if (!empId) return;
    
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      // Get existing conversation (read-only, no creation)
      const conversation = await getConversation(empId);
      
      if (!conversation) {
        throw new Error(`Conversation not found for employee: ${empId}. Please ensure the conversation exists.`);
      }
      
      // Store conversation with participantNames for checking messages
      setCurrentConversation(conversation);
      
      // Fetch messages
      const data = await getMessages(empId);
      
      // Debug: Log messages to see if attachments are present
      if (__DEV__) {
        console.log('📥 useChat - Fetched messages:', {
          count: data.length,
          messagesWithAttachments: data.filter(m => m.attachments && m.attachments.length > 0).length,
          sampleMessage: data.find(m => m.attachments && m.attachments.length > 0),
        });
        // Log first message with attachments if any
        const messageWithAttachment = data.find(m => m.attachments && m.attachments.length > 0);
        if (messageWithAttachment) {
          console.log('📎 useChat - Sample message with attachment:', {
            messageId: messageWithAttachment._id || messageWithAttachment.id,
            attachments: messageWithAttachment.attachments,
            text: messageWithAttachment.text,
          });
        }
      }
      
      setMessages(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, [employeeName]);
  
  /**
   * Sends a message from the employee to HR
   * Uses participantNames[1] (Employee name) to derive senderId
   * 
   * @param {string} messageText - Text content of the message
   * @param {Array} attachments - Array of attachment objects with { url, type, name, size?, publicId? }
   * @returns {Promise<string>} ID of the sent message
   */
  const sendChatMessage = useCallback(async (messageText = '', attachments = []) => {
    // Get conversationId (employeeId) for the conversation
    const conversationEmpId = employeeId;
    
    if (!conversationEmpId) {
      throw new Error('No conversation selected');
    }
    
    // Get current conversation to access participantNames
    if (!currentConversation || !currentConversation.participantNames) {
      // Try to fetch conversation if not stored
      const conversation = await getConversationByEmployeeId(conversationEmpId);
      if (conversation) {
        setCurrentConversation(conversation);
      } else {
        throw new Error('Conversation not found');
      }
    }
    
    // Validate that message has either text or attachments
    const hasText = messageText && messageText.trim().length > 0;
    const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;
    
    if (!hasText && !hasAttachments) {
      throw new Error('Message must have either text or attachments');
    }
    
    // Use participantNames[1] (Employee name) to derive senderId
    const empName = currentConversation?.participantNames?.[1];
    if (!empName) {
      throw new Error('Employee name not found in conversation');
    }
    
    const senderId = getSenderIdFromParticipantName(empName);
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Send message using derived senderId from participantNames[1]
      const messageId = await sendMessage(conversationEmpId, senderId, messageText, attachments);
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [employeeId, currentConversation]);
  
  /**
   * Sets up real-time listener for messages
   * 
   * Uses the employeeId prop directly (from route params) if provided,
   * otherwise falls back to getCurrentEmployeeId().
   * This ensures clicking different conversations loads different chats.
   */
  useEffect(() => {
    // Use the employeeId prop directly (from route params), not from AsyncStorage
    // This ensures clicking different conversations loads different chats
    const conversationEmpId = employeeId;
    
    if (!conversationEmpId) {
      // If no employeeId prop, try to get from AsyncStorage (for backward compatibility)
      getCurrentEmployeeId().then((empId) => {
        if (!empId) {
          console.warn('⚠️ useChat - No employeeId provided');
          return;
        }
        if (!autoFetch) return;
        fetchMessages(empId, employeeName);
      });
      return;
    }
    
    if (!autoFetch) return;
    
    let unsubscribe;
    
    if (realtime) {
      // Set up real-time listener AND fetch initial messages
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
        try {
          // First, get existing conversation and fetch initial messages
          getConversation(conversationEmpId).then((conversation) => {
            if (!conversation) {
              throw new Error(`Conversation not found for employee: ${conversationEmpId}`);
            }
            
            // Store conversation with participantNames
            setCurrentConversation(conversation);
            
            // Fetch initial messages for this conversation
            fetchMessages(conversationEmpId, employeeName);
            
            // Then set up listener for real-time updates
            unsubscribe = subscribeMessages(conversationEmpId, (data) => {
              // Callback is called whenever messages change
              setMessages(data);
              setLoadingState(LOADING_STATES.SUCCESS);
            });
        }).catch((err) => {
          console.error('❌ Error setting up messages listener:', err);
          setError(err.message || 'Failed to subscribe to messages');
          setLoadingState(LOADING_STATES.ERROR);
        });
      } catch (err) {
        console.error('❌ Error setting up messages listener:', err);
        setError(err.message || 'Failed to subscribe to messages');
        setLoadingState(LOADING_STATES.ERROR);
      }
    } else {
      // Fetch messages once
      fetchMessages(conversationEmpId, employeeName);
    }
    
    // Cleanup function
    // Always unsubscribe when component unmounts or employeeId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [employeeId, employeeName, realtime, autoFetch, fetchMessages, getCurrentEmployeeId]);
  
  /**
   * Determines if a message was sent by HR
   * Checks if message.senderId matches participantNames[0] (HR name)
   * 
   * @param {Object} message - Message object
   * @returns {boolean} True if message is from HR
   */
  const isHRMessage = useCallback((message) => {
    if (!currentConversation || !currentConversation.participantNames || !message?.senderId) {
      // Fallback to old logic if conversation not available
      return message.senderId === HR_USER.ID;
    }
    
    // Check if senderId matches participantNames[0] (HR)
    const hrName = currentConversation.participantNames[0];
    return doesSenderIdMatchParticipantName(message.senderId, hrName);
  }, [currentConversation]);
  
  /**
   * Determines if a message was sent by the current employee
   * Checks if message.senderId matches participantNames[1] (Employee name)
   * 
   * @param {Object} message - Message object
   * @returns {boolean} True if message is from current employee
   */
  const isSentMessage = useCallback((message) => {
    if (!currentConversation || !currentConversation.participantNames || !message?.senderId) {
      // Fallback to old logic if conversation not available
      return message.senderId === currentEmployeeId;
    }
    
    // Check if senderId matches participantNames[1] (Employee)
    const empName = currentConversation.participantNames[1];
    return doesSenderIdMatchParticipantName(message.senderId, empName);
  }, [currentConversation, currentEmployeeId]);
  
  /**
   * Gets message type (sent or received)
   * 
   * @param {Object} message - Message object
   * @returns {string} MESSAGE_TYPES.SENT or MESSAGE_TYPES.RECEIVED
   */
  const getMessageType = useCallback((message) => {
    return isSentMessage(message) ? MESSAGE_TYPES.SENT : MESSAGE_TYPES.RECEIVED;
  }, [isSentMessage]);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  return {
    // Data
    messages,
    messagesCount: messages.length,
    currentEmployeeId,
    
    // Loading states
    loading: isLoading,
    isLoading,
    isError,
    isSuccess,
    loadingState,
    error,
    sendingMessage,
    
    // Methods
    sendChatMessage,
    fetchMessages,
    isHRMessage,
    isSentMessage,
    getMessageType,
    refreshMessages: () => {
      const empId = employeeId || currentEmployeeId;
      if (empId) {
        return fetchMessages(empId, employeeName);
      }
      return getCurrentEmployeeId().then((id) => fetchMessages(id, employeeName));
    },
  };
};

export default useChat;

