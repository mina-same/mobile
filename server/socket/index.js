/**
 * Socket.io Setup
 * 
 * Configures Socket.io server with all event handlers
 * @module socket/index
 */

import { setupFeedbackHandlers } from './feedbackHandlers.js';
import { setupChatHandlers } from './chatHandlers.js';

/**
 * Initialize Socket.io handlers
 * 
 * @param {Socket} io - Socket.io server instance
 */
export const setupSocketIO = (io) => {
  // Setup feedback handlers
  setupFeedbackHandlers(io);

  // Setup chat handlers
  setupChatHandlers(io);

  console.log('✅ Socket.io handlers initialized');
};

