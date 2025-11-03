/**
 * Feedback Controller
 * 
 * Handles HTTP requests for feedback operations
 * @module controllers/feedbackController
 */

import * as feedbackService from '../services/feedbackService.js';

/**
 * Get all feedback records
 */
export const getAllFeedback = async (req, res) => {
  try {
    const options = {
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc',
      employeeName: req.query.employeeName,
      score: req.query.score,
    };

    const feedback = await feedbackService.getAllFeedback(options);

    res.status(200).json({
      success: true,
      data: feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error('Error in getAllFeedback controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      details: error.message,
    });
  }
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error in getFeedbackById controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      details: error.message,
    });
  }
};

/**
 * Create new feedback record
 */
export const createFeedback = async (req, res) => {
  try {
    const { employeeName, score, notes, date } = req.body;

    // Validation
    if (!employeeName || !score || !notes) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, score, notes',
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 1 and 5',
      });
    }

    const feedback = await feedbackService.createFeedback({
      employeeName,
      score,
      notes,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback created successfully',
    });
  } catch (error) {
    console.error('Error in createFeedback controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create feedback',
      details: error.message,
    });
  }
};

/**
 * Update feedback record
 */
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate score if provided
    if (updateData.score !== undefined) {
      if (updateData.score < 1 || updateData.score > 5) {
        return res.status(400).json({
          success: false,
          error: 'Score must be between 1 and 5',
        });
      }
    }

    const feedback = await feedbackService.updateFeedback(id, updateData);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
      message: 'Feedback updated successfully',
    });
  } catch (error) {
    console.error('Error in updateFeedback controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback',
      details: error.message,
    });
  }
};

/**
 * Delete feedback record
 */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.deleteFeedback(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteFeedback controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback',
      details: error.message,
    });
  }
};

/**
 * Get feedback by employee name
 */
export const getFeedbackByEmployee = async (req, res) => {
  try {
    const { name } = req.params;
    const feedback = await feedbackService.getFeedbackByEmployee(name);

    res.status(200).json({
      success: true,
      data: feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error('Error in getFeedbackByEmployee controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      details: error.message,
    });
  }
};

/**
 * Get feedback by score
 */
export const getFeedbackByScore = async (req, res) => {
  try {
    const { score } = req.params;
    const scoreNum = parseInt(score, 10);

    if (scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 1 and 5',
      });
    }

    const feedback = await feedbackService.getFeedbackByScore(scoreNum);

    res.status(200).json({
      success: true,
      data: feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error('Error in getFeedbackByScore controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      details: error.message,
    });
  }
};

