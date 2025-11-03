/**
 * API Client
 * 
 * Base HTTP client for making API requests to the Node.js server
 * @module services/api
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

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

/**
 * Upload a file
 * 
 * @param {FormData|Object} fileData - File data (FormData for multipart/form-data or object with uri)
 * @returns {Promise<Object>} Upload response with file data
 */
export const uploadFile = async (fileData) => {
  try {
    const url = `${API_BASE_URL}/upload/single`;
    
    let formData;
    
    // If fileData is already FormData, use it
    if (fileData instanceof FormData) {
      formData = fileData;
    } else {
      // Otherwise, create FormData from file object
      formData = new FormData();
      
      // Handle React Native file format (from expo-image-picker or expo-document-picker)
      if (fileData.uri) {
        // Get file name - ensure it has proper extension
        let fileName = fileData.name || fileData.uri.split('/').pop() || `file_${Date.now()}`;
        
        // Ensure filename has extension if missing
        if (!fileName.includes('.')) {
          // Try to determine extension from mime type
          const mimeType = fileData.type || fileData.mimeType || 'application/octet-stream';
          let extension = 'jpg'; // default
          if (mimeType.includes('image/')) {
            if (mimeType.includes('png')) extension = 'png';
            else if (mimeType.includes('gif')) extension = 'gif';
            else if (mimeType.includes('webp')) extension = 'webp';
            else extension = 'jpg';
          } else if (mimeType.includes('pdf')) extension = 'pdf';
          else if (mimeType.includes('word')) extension = 'docx';
          fileName = `${fileName}.${extension}`;
        }
        
        // Get MIME type with fallback
        const mimeType = fileData.type || fileData.mimeType || 
          (fileData.uri.endsWith('.png') ? 'image/png' : 
           fileData.uri.endsWith('.gif') ? 'image/gif' : 
           fileData.uri.endsWith('.webp') ? 'image/webp' : 
           fileData.uri.endsWith('.pdf') ? 'application/pdf' : 
           'image/jpeg'); // default to jpeg
        
        // Create file object for React Native
        // React Native FormData requires this specific format
        formData.append('file', {
          uri: fileData.uri,
          type: mimeType,
          name: fileName,
        });
      } else {
        throw new Error('Invalid file data format: missing uri');
      }
    }
    
    // Log upload attempt in development
    if (__DEV__) {
      console.log('📤 Uploading file:', {
        url,
        fileName: fileData.name || 'unknown',
        mimeType: fileData.type || fileData.mimeType || 'unknown',
        uri: fileData.uri ? fileData.uri.substring(0, 50) + '...' : 'N/A',
      });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        // Don't set Content-Type header - React Native fetch will automatically set
        // multipart/form-data with proper boundary
      },
      body: formData,
    });
    
    // Handle response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }
    }
    
    if (!response.ok || !data.success) {
      const error = new Error(data.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    // Log success in development
    if (__DEV__) {
      console.log('✅ File uploaded successfully:', {
        url: data.data?.url,
        type: data.data?.type,
        size: data.data?.size,
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    // Provide more helpful error messages
    if (error.message.includes('Network request failed')) {
      throw new Error('Network error: Please check your internet connection and ensure the server is running.');
    } else if (error.message.includes('Invalid response')) {
      throw new Error('Server error: The server returned an invalid response. Please try again.');
    }
    throw error;
  }
};

