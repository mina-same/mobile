/**
 * Feedback API Service
 * 
 * API calls for feedback operations
 * @module services/feedbackApi
 */

import { get, post, put, del } from './api.js';
import { normalizeFeedbackDates } from '../utils/dateNormalizer.js';

/**
 * Get all feedback records
 * 
 * @param {Object} options - Query options (sortBy, sortOrder, employeeName, score)
 * @returns {Promise<Array>} Array of feedback records
 */
export const getAllFeedback = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);
    if (options.employeeName) queryParams.append('employeeName', options.employeeName);
    if (options.score) queryParams.append('score', options.score);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/feedback?${queryString}` : '/feedback';
    
    const response = await get(endpoint);
    const feedback = response.data || [];
    return normalizeFeedbackDates(feedback);
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    throw error;
  }
};

/**
 * Get feedback by ID
 * 
 * @param {string} id - Feedback ID
 * @returns {Promise<Object>} Feedback record
 */
export const getFeedbackById = async (id) => {
  try {
    const response = await get(`/feedback/${id}`);
    return normalizeFeedbackDates(response.data);
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    throw error;
  }
};

/**
 * Get feedback by employee name
 * 
 * @param {string} name - Employee name
 * @returns {Promise<Array>} Array of feedback records
 */
export const getFeedbackByEmployee = async (name) => {
  try {
    const response = await get(`/feedback/employee/${encodeURIComponent(name)}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching feedback by employee:', error);
    throw error;
  }
};

/**
 * Get feedback by score
 * 
 * @param {number} score - Score (1-5)
 * @returns {Promise<Array>} Array of feedback records
 */
export const getFeedbackByScore = async (score) => {
  try {
    const response = await get(`/feedback/score/${score}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching feedback by score:', error);
    throw error;
  }
};

/**
 * Create new feedback record
 * 
 * @param {Object} feedbackData - Feedback data
 * @param {string} feedbackData.employeeName - Employee name
 * @param {number} feedbackData.score - Score (1-5)
 * @param {string} feedbackData.notes - Feedback notes
 * @param {Date|string} feedbackData.date - Date of feedback
 * @returns {Promise<string>} ID of created feedback
 */
export const createFeedback = async (feedbackData) => {
  try {
    // Convert date to ISO string if it's a Date object
    const data = {
      ...feedbackData,
      date: feedbackData.date instanceof Date 
        ? feedbackData.date.toISOString() 
        : feedbackData.date,
    };

    const response = await post('/feedback', data);
    return response.data._id || response.data.id;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

/**
 * Update feedback record
 * 
 * @param {string} id - Feedback ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated feedback record
 */
export const updateFeedback = async (id, updateData) => {
  try {
    const response = await put(`/feedback/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

/**
 * Delete feedback record
 * 
 * @param {string} id - Feedback ID
 * @returns {Promise<void>}
 */
export const deleteFeedback = async (id) => {
  try {
    await del(`/feedback/${id}`);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

