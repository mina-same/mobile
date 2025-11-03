/**
 * useChat Hook
 * 
 * Custom React hook for managing chat functionality
 * Provides real-time messaging and conversation management
 * 
 * @module hooks/useChat
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getConversation,
  sendMessage,
  subscribeConversations,
  getConversationByEmployeeId,
  subscribeMessages,
  getEmployeeNameFromId,
  getMessages,
} from '../services/chatService';
import { LOADING_STATES, HR_USER } from '../config/constants';
import { generateEmployeeId, doesSenderIdMatchParticipantName, getSenderIdFromParticipantName } from '../utils/helpers';

/**
 * Custom hook for chat management
 * 
 * @param {Object} options - Hook options
 * @param {string} options.employeeName - Employee to chat with
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @returns {Object} Chat state and methods
 * 
 * @example
 * const {
 *   messages,
 *   conversations,
 *   loading,
 *   sendHRMessage,
 *   selectEmployee,
 * } = useChat({ employeeName: 'Jane Doe' });
 */
const useChat = (options = {}) => {
  const { employeeName: initialEmployee, realtime = true } = options;
  
  // State management
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee || null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null); // Store current conversation with participantNames
  const [messages, setMessages] = useState([]);
  const messagesCacheRef = useRef({}); // Cache messages per employeeId using ref for synchronous access
  const [conversationsLoading, setConversationsLoading] = useState(LOADING_STATES.IDLE);
  const [messagesLoading, setMessagesLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  /**
   * Current employee ID based on selected employee
   */
  const currentEmployeeId = useMemo(() => {
    return selectedEmployee ? generateEmployeeId(selectedEmployee) : null;
  }, [selectedEmployee]);
  
  /**
   * Selects an employee to chat with
   * 
   * @param {string} employeeName - Name of the employee
   */
  const selectEmployee = useCallback(async (employeeName) => {
    try {
      // Validate employee name
      if (!employeeName || typeof employeeName !== 'string' || employeeName.trim().length === 0) {
        throw new Error('Employee name is required');
      }
      
      const trimmedName = employeeName.trim();
      
      // If already selected, don't do anything
      if (selectedEmployee === trimmedName) {
        console.log('Employee already selected:', trimmedName);
        return;
      }
      
      setSelectedEmployee(trimmedName);
      setMessagesLoading(LOADING_STATES.LOADING);
      setError(null);
      
      // Generate employee ID from name
      const employeeId = generateEmployeeId(trimmedName);
      
      // Validate employee ID was generated
      if (!employeeId || employeeId.length === 0) {
        throw new Error('Failed to generate employee ID');
      }
      
      // Get existing conversation (read-only, no creation)
      const conversation = await getConversation(employeeId);
      
      if (!conversation) {
        throw new Error(`Conversation not found for employee: ${trimmedName}. Please ensure the conversation exists.`);
      }
      
      // Store conversation with participantNames for checking messages
      setCurrentConversation(conversation);
    } catch (err) {
      console.error('Error selecting employee:', err);
      setError(err.message || 'Failed to select employee');
      setMessagesLoading(LOADING_STATES.ERROR);
    }
  }, [selectedEmployee]);
  
  /**
   * Sends a message from HR to the selected employee
   * Uses participantNames[0] (HR name) to derive senderId
   * 
   * @param {string} messageText - Text content of the message
   * @param {Array} attachments - Array of attachment objects
   * @returns {Promise<string>} ID of the sent message
   */
  const sendHRMessage = useCallback(async (messageText, attachments = []) => {
    if (!selectedEmployee) {
      throw new Error('No employee selected');
    }
    
    // Get current conversation to access participantNames
    if (!currentConversation || !currentConversation.participantNames) {
      // Try to fetch conversation if not stored
      const employeeId = generateEmployeeId(selectedEmployee);
      const conversation = await getConversationByEmployeeId(employeeId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      // Use participantNames[0] to derive HR's senderId
      const hrName = currentConversation?.participantNames?.[0] || HR_USER.NAME;
      const senderId = getSenderIdFromParticipantName(hrName);
      
      const employeeId = generateEmployeeId(selectedEmployee);
      const messageId = await sendMessage(employeeId, senderId, messageText, attachments);
      
      // Immediately refresh messages after sending
      // The API returns after the message is saved, so we can refresh right away
      if (currentEmployeeId) {
        try {
          const updatedMessages = await getMessages(currentEmployeeId);
          setMessages(updatedMessages);
          // Update cache
          messagesCacheRef.current[currentEmployeeId] = updatedMessages;
          setMessagesLoading(LOADING_STATES.SUCCESS);
          console.log('Messages refreshed after sending:', updatedMessages.length);
        } catch (refreshError) {
          console.error('Error refreshing messages after send:', refreshError);
          // Don't fail the send if refresh fails - socket event will update it
          // Also try again after a short delay as fallback
          setTimeout(async () => {
            try {
              const updatedMessages = await getMessages(currentEmployeeId);
              setMessages(updatedMessages);
              // Update cache
              messagesCacheRef.current[currentEmployeeId] = updatedMessages;
              setMessagesLoading(LOADING_STATES.SUCCESS);
            } catch (retryError) {
              console.error('Error on retry refresh:', retryError);
            }
          }, 300);
        }
      }
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [selectedEmployee, currentEmployeeId, currentConversation]);
  
  /**
   * Sends a generic message (can be from HR or employee)
   * 
   * @param {string} senderId - ID of the sender
   * @param {string} messageText - Text content of the message
   * @returns {Promise<string>} ID of the sent message
   */
  const sendChatMessage = useCallback(async (senderId, messageText) => {
    if (!currentEmployeeId) {
      throw new Error('No conversation selected');
    }
    
    try {
      setSendingMessage(true);
      setError(null);
      
      const messageId = await sendMessage(currentEmployeeId, senderId, messageText);
      
      setSendingMessage(false);
      return messageId;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSendingMessage(false);
      throw err;
    }
  }, [currentEmployeeId]);
  
  /**
   * Clears the selected employee and messages
   */
  const clearSelection = useCallback(() => {
    setSelectedEmployee(null);
    setMessages([]);
    setError(null);
  }, []);
  
  /**
   * Determines if a message was sent by HR
   * Checks if message.senderId matches participantNames[0] (HR name)
   * 
   * @param {Object} message - Message object
   * @returns {boolean} True if sent by HR
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
  
  // Set up real-time listener for conversations list
  useEffect(() => {
    if (!realtime) return;
    
    setConversationsLoading(LOADING_STATES.LOADING);
    
    try {
      const unsubscribe = subscribeConversations((data) => {
        setConversations(data);
        setConversationsLoading(LOADING_STATES.SUCCESS);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error subscribing to conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setConversationsLoading(LOADING_STATES.ERROR);
    }
  }, [realtime]);
  
  // Set up real-time listener for messages in selected conversation
  useEffect(() => {
    if (!realtime || !currentEmployeeId) {
      setMessages([]);
      setMessagesLoading(LOADING_STATES.IDLE);
      return;
    }
    
    // Check cache first - use ref for synchronous access
    if (messagesCacheRef.current[currentEmployeeId]) {
      // Use cached messages immediately (no loading state)
      setMessages(messagesCacheRef.current[currentEmployeeId]);
      setMessagesLoading(LOADING_STATES.SUCCESS);
    } else {
      // Only show loading if we don't have cached messages
      setMessagesLoading(LOADING_STATES.LOADING);
    }
    
    let isSubscribed = true;
    
    try {
      const unsubscribe = subscribeMessages(currentEmployeeId, (data) => {
        // Only update if still subscribed to this conversation
        if (isSubscribed && data) {
          setMessages(data);
          // Update cache
          messagesCacheRef.current[currentEmployeeId] = data;
          setMessagesLoading(LOADING_STATES.SUCCESS);
        }
      });
      
      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('Error subscribing to messages:', err);
      setError(err.message || 'Failed to load messages');
      setMessagesLoading(LOADING_STATES.ERROR);
      isSubscribed = false;
    }
  }, [realtime, currentEmployeeId, currentConversation]);
  
  // Computed values
  const isLoadingConversations = conversationsLoading === LOADING_STATES.LOADING;
  const isLoadingMessages = messagesLoading === LOADING_STATES.LOADING;
  const isLoading = isLoadingConversations || isLoadingMessages;
  
  /**
   * List of unique employee names from conversations
   * Dashboard shows participantNames[1] (Employee name) as conversation name
   */
  const employeeList = useMemo(() => {
    return conversations.map((conv) => {
      // Dashboard shows participantNames[1] (Employee name) as conversation name
      const employeeName = conv.participantNames?.[1] || conv.participantNames?.find((name) => name !== HR_USER.NAME) || getEmployeeNameFromId(conv.id);
      return {
        id: conv.id,
        name: employeeName,
        lastMessage: conv.lastMessage,
        lastMessageTimestamp: conv.lastMessageTimestamp,
      };
    });
  }, [conversations]);
  
  /**
   * Count of unread messages (can be extended to track actual unread status)
   */
  const unreadCount = useMemo(() => {
    // This is a placeholder - would need additional logic to track actual unread messages
    return 0;
  }, []);
  
  return {
    // Selected employee data
    selectedEmployee,
    currentEmployeeId,
    currentConversation, // Conversation with participantNames stored in state
    
    // Lists
    conversations,
    employeeList,
    messages,
    
    // Loading states
    loading: isLoading,
    isLoadingConversations,
    isLoadingMessages,
    sendingMessage,
    error,
    
    // Computed values
    unreadCount,
    
    // Methods
    selectEmployee,
    sendHRMessage,
    sendChatMessage,
    clearSelection,
    isHRMessage,
  };
};

export default useChat;

