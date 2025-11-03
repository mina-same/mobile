/**
 * Feedback Service
 * 
 * Updated service using REST API and Socket.io for real-time updates
 * Replaces Firebase/Firestore operations
 * @module services/feedbackService
 */

import * as feedbackApi from './feedbackApi.js';
import { getSocket } from './socket.js';

/**
 * Subscribe to feedback updates via Socket.io
 * 
 * @param {Function} callback - Callback function called with updated feedback
 * @returns {Function} Unsubscribe function
 */
export const subscribeFeedback = (callback) => {
  const socket = getSocket();
  
  // Fetch initial data first
  feedbackApi.getAllFeedback()
    .then((feedback) => {
      callback(feedback);
    })
    .catch((error) => {
      console.error('Error fetching initial feedback:', error);
      // Still set up listeners even if initial fetch fails
    });
  
  // Subscribe to feedback updates
  socket.emit('subscribe:feedback');
  
  // Listen for feedback events
  const onCreated = (data) => {
    // Refresh feedback list or add new item
    feedbackApi.getAllFeedback()
      .then((feedback) => callback(feedback))
      .catch((error) => console.error('Error refreshing feedback:', error));
  };
  
  const onUpdated = (data) => {
    // Refresh feedback list or update item
    feedbackApi.getAllFeedback()
      .then((feedback) => callback(feedback))
      .catch((error) => console.error('Error refreshing feedback:', error));
  };
  
  const onDeleted = (data) => {
    // Refresh feedback list or remove item
    feedbackApi.getAllFeedback()
      .then((feedback) => callback(feedback))
      .catch((error) => console.error('Error refreshing feedback:', error));
  };
  
  socket.on('feedback:created', onCreated);
  socket.on('feedback:updated', onUpdated);
  socket.on('feedback:deleted', onDeleted);
  
  // Return unsubscribe function
  return () => {
    socket.off('feedback:created', onCreated);
    socket.off('feedback:updated', onUpdated);
    socket.off('feedback:deleted', onDeleted);
    socket.emit('unsubscribe:feedback');
  };
};

// Re-export API functions
export {
  getAllFeedback,
  getFeedbackById,
  getFeedbackByEmployee,
  getFeedbackByScore,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from './feedbackApi.js';
