/**
 * API Client
 * 
 * Base HTTP client for making API requests to the Node.js server
 * @module services/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Makes an API request
 * 
 * @param {string} endpoint - API endpoint (e.g., '/feedback')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add body if provided
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, data: await response.text() };
    }

    const data = await response.json();

    // Handle API errors
    if (!response.ok || !data.success) {
      const error = new Error(data.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * GET request
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request
 */
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'POST', body });
};

/**
 * PUT request
 */
export const put = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'PUT', body });
};

/**
 * DELETE request
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

