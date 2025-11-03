/**
 * Date Normalizer Utilities
 * 
 * Converts MongoDB date format to JavaScript Date objects
 * Handles both ISO strings and Date objects from MongoDB
 * @module utils/dateNormalizer
 */

/**
 * Normalizes a date value to a JavaScript Date object
 * Handles various date formats from MongoDB and Firebase
 * 
 * @param {Date|string|Object} dateValue - Date value (Date, ISO string, or Firestore Timestamp)
 * @returns {Date} JavaScript Date object
 */
export const normalizeDate = (dateValue) => {
  if (!dateValue) return new Date();
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a string (ISO format from MongoDB)
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  
  // If it's a Firestore Timestamp (has toMillis method)
  if (dateValue && typeof dateValue.toMillis === 'function') {
    return new Date(dateValue.toMillis());
  }
  
  // If it's a Firestore Timestamp (has seconds property)
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }
  
  // Try to convert to Date
  return new Date(dateValue);
};

/**
 * Normalizes dates in an object
 * Recursively converts date fields to Date objects
 * 
 * @param {Object} obj - Object to normalize
 * @param {Array<string>} dateFields - Fields that contain dates
 * @returns {Object} Object with normalized dates
 */
export const normalizeObjectDates = (obj, dateFields = ['date', 'timestamp', 'createdAt', 'updatedAt', 'lastMessageTimestamp']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const normalized = Array.isArray(obj) ? [...obj] : { ...obj };
  
  if (Array.isArray(normalized)) {
    return normalized.map(item => normalizeObjectDates(item, dateFields));
  }
  
  for (const field of dateFields) {
    if (normalized[field]) {
      normalized[field] = normalizeDate(normalized[field]);
    }
  }
  
  return normalized;
};

/**
 * Normalizes dates in feedback objects
 * 
 * @param {Object|Array} feedback - Feedback object or array
 * @returns {Object|Array} Feedback with normalized dates
 */
export const normalizeFeedbackDates = (feedback) => {
  return normalizeObjectDates(feedback, ['date', 'createdAt', 'updatedAt']);
};

/**
 * Normalizes dates in message objects
 * 
 * @param {Object|Array} message - Message object or array
 * @returns {Object|Array} Message with normalized dates
 */
export const normalizeMessageDates = (message) => {
  return normalizeObjectDates(message, ['timestamp', 'createdAt', 'updatedAt']);
};

/**
 * Normalizes dates in conversation objects
 * 
 * @param {Object|Array} conversation - Conversation object or array
 * @returns {Object|Array} Conversation with normalized dates
 */
export const normalizeConversationDates = (conversation) => {
  return normalizeObjectDates(conversation, ['lastMessageTimestamp', 'createdAt', 'updatedAt']);
};

