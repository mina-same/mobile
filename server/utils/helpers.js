/**
 * Helper Utilities
 * 
 * General utility functions
 * @module utils/helpers
 */

/**
 * Generate employee ID from employee name
 * Converts "Alice Johnson" to "emp_alice_johnson"
 * 
 * @param {string} employeeName - Employee name
 * @returns {string} Employee ID
 */
export const generateEmployeeId = (employeeName) => {
  if (!employeeName || typeof employeeName !== 'string') {
    throw new Error('Employee name must be a non-empty string');
  }

  return 'emp_' + employeeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Validate message text
 * 
 * @param {string} text - Message text
 * @returns {Object} Validation result
 */
export const validateMessage = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: 'Message text must be a non-empty string',
    };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Message text cannot be empty',
    };
  }

  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: 'Message text cannot exceed 1000 characters',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate feedback data
 * 
 * @param {Object} feedbackData - Feedback data
 * @returns {Object} Validation result
 */
export const validateFeedback = (feedbackData) => {
  const errors = [];

  if (!feedbackData.employeeName || typeof feedbackData.employeeName !== 'string' || feedbackData.employeeName.trim().length === 0) {
    errors.push('Employee name is required');
  }

  if (!feedbackData.score || isNaN(feedbackData.score)) {
    errors.push('Score must be a number');
  } else {
    const score = parseInt(feedbackData.score, 10);
    if (score < 1 || score > 5) {
      errors.push('Score must be between 1 and 5');
    }
  }

  if (!feedbackData.notes || typeof feedbackData.notes !== 'string' || feedbackData.notes.trim().length === 0) {
    errors.push('Notes are required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

