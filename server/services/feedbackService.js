/**
 * Feedback Service
 * 
 * Business logic for feedback operations
 * @module services/feedbackService
 */

import Feedback from '../models/Feedback.js';

/**
 * Get all feedback records
 * 
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Field to sort by (default: 'date')
 * @param {string} options.sortOrder - Sort order 'asc' or 'desc' (default: 'desc')
 * @param {string} options.employeeName - Filter by employee name
 * @param {number} options.score - Filter by score
 * @returns {Promise<Array>} Array of feedback records
 */
export const getAllFeedback = async (options = {}) => {
  try {
    const {
      sortBy = 'date',
      sortOrder = 'desc',
      employeeName,
      score,
    } = options;

    // Build query
    const query = {};
    
    if (employeeName) {
      query.employeeName = { $regex: employeeName, $options: 'i' }; // Case-insensitive search
    }
    
    if (score) {
      query.score = parseInt(score, 10);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const feedback = await Feedback.find(query).sort(sort);

    return feedback;
  } catch (error) {
    console.error('Error in getAllFeedback:', error);
    throw error;
  }
};

/**
 * Get feedback by ID
 * 
 * @param {string} id - Feedback ID
 * @returns {Promise<Object|null>} Feedback record or null
 */
export const getFeedbackById = async (id) => {
  try {
    const feedback = await Feedback.findById(id);
    return feedback;
  } catch (error) {
    console.error('Error in getFeedbackById:', error);
    throw error;
  }
};

/**
 * Get feedback by employee name
 * 
 * @param {string} employeeName - Employee name
 * @returns {Promise<Array>} Array of feedback records
 */
export const getFeedbackByEmployee = async (employeeName) => {
  try {
    const feedback = await Feedback.find({
      employeeName: { $regex: employeeName, $options: 'i' },
    }).sort({ date: -1 });

    return feedback;
  } catch (error) {
    console.error('Error in getFeedbackByEmployee:', error);
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
    const feedback = await Feedback.find({ score: parseInt(score, 10) })
      .sort({ date: -1 });

    return feedback;
  } catch (error) {
    console.error('Error in getFeedbackByScore:', error);
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
 * @param {Date} feedbackData.date - Date of feedback (optional)
 * @returns {Promise<Object>} Created feedback record
 */
export const createFeedback = async (feedbackData) => {
  try {
    const { employeeName, score, notes, date } = feedbackData;

    const newFeedback = new Feedback({
      employeeName,
      score: parseInt(score, 10),
      notes,
      date: date || new Date(),
    });

    const savedFeedback = await newFeedback.save();
    return savedFeedback;
  } catch (error) {
    console.error('Error in createFeedback:', error);
    throw error;
  }
};

/**
 * Update feedback record
 * 
 * @param {string} id - Feedback ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated feedback record or null
 */
export const updateFeedback = async (id, updateData) => {
  try {
    // Convert score to number if provided
    if (updateData.score) {
      updateData.score = parseInt(updateData.score, 10);
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return feedback;
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    throw error;
  }
};

/**
 * Delete feedback record
 * 
 * @param {string} id - Feedback ID
 * @returns {Promise<Object|null>} Deleted feedback record or null
 */
export const deleteFeedback = async (id) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(id);
    return feedback;
  } catch (error) {
    console.error('Error in deleteFeedback:', error);
    throw error;
  }
};

