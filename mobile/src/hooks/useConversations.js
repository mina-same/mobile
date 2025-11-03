/**
 * useConversations Hook
 * Manages: Conversations list with real-time updates
 * Used in: Conversations List screen
 * 
 * @module hooks/useConversations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllConversations,
  subscribeConversations,
} from '../services/chatService';
import { LOADING_STATES } from '../config/constants';
import { HR_USER } from '../config/constants';

/**
 * Custom hook for managing conversations list
 * 
 * Provides:
 * - Conversations list data
 * - Loading states
 * - Error handling
 * - Real-time updates
 * - Helper functions
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.autoFetch - Automatically fetch on mount (default: true)
 * @returns {Object} Conversations state and methods
 * 
 * @example
 * const {
 *   conversations,
 *   loading,
 *   error,
 *   refreshConversations,
 * } = useConversations({ realtime: true });
 */
const useConversations = (options = {}) => {
  const { realtime = true, autoFetch = true } = options;
  
  // State management
  const [conversations, setConversations] = useState([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  /**
   * Fetches conversations from Firestore (one-time)
   * 
   * This is used when realtime is disabled or for initial fetch.
   */
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      // Fetch conversations from Firestore
      const data = await getAllConversations();
      
      setConversations(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);
  
  /**
   * Refreshes conversations manually
   * 
   * Useful for pull-to-refresh functionality.
   */
  const refreshConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Set up real-time listener or fetch once
  useEffect(() => {
    if (!autoFetch) return;
    
    let unsubscribe;
    
    if (realtime) {
      // Set up real-time listener AND fetch initial data
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      try {
        // First, fetch initial conversations
        fetchConversations();
        
        // Then set up real-time listener for updates
        unsubscribe = subscribeConversations((data) => {
          // Callback is called whenever conversations change
          setConversations(data);
          setLoadingState(LOADING_STATES.SUCCESS);
        });
      } catch (err) {
        console.error('❌ Error setting up conversations listener:', err);
        setError(err.message || 'Failed to subscribe to conversations');
        setLoadingState(LOADING_STATES.ERROR);
      }
    } else {
      // Fetch data once (not real-time)
      fetchConversations();
    }
    
    // Cleanup function
    // This runs when the component unmounts or dependencies change
    // Important: Always unsubscribe to prevent memory leaks
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realtime, autoFetch, fetchConversations]);
  
  /**
   * Gets HR name from a conversation (for mobile - shows HR as conversation name)
   * 
   * Conversations have participantNames array with [HR, Employee].
   * Mobile shows participantNames[0] (HR name) as the conversation name.
   * 
   * @param {Object} conversation - Conversation object
   * @returns {string} HR name (participantNames[0])
   */
  const getEmployeeNameFromConversation = useCallback((conversation) => {
    if (!conversation || !conversation.participantNames) return '';
    
    // Mobile shows participantNames[0] (HR name) as conversation name
    return conversation.participantNames[0] || '';
  }, []);
  
  // Computed values
  const isLoading = loadingState === LOADING_STATES.LOADING;
  const isError = loadingState === LOADING_STATES.ERROR;
  const isSuccess = loadingState === LOADING_STATES.SUCCESS;
  
  /**
   * Processes conversations for display
   * 
   * Extracts employee names and formats data for the UI.
   */
  const processedConversations = conversations.map((conv) => {
    const employeeName = getEmployeeNameFromConversation(conv);
    
    return {
      id: conv.id,
      employeeId: conv.employeeId, // Include employeeId for navigation
      employeeName,
      lastMessage: conv.lastMessage || '',
      lastMessageTimestamp: conv.lastMessageTimestamp,
      participantNames: conv.participantNames || [],
    };
  });
  
  return {
    // Data
    conversations: processedConversations,
    conversationsCount: processedConversations.length,
    
    // Loading states
    loading: isLoading,
    isLoading,
    isError,
    isSuccess,
    loadingState,
    error,
    
    // Methods
    refreshConversations,
    fetchConversations,
    getEmployeeNameFromConversation,
  };
};

export default useConversations;

