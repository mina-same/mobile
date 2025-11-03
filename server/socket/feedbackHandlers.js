/**
 * Socket.io Feedback Handlers
 * 
 * Real-time event handlers for feedback operations
 * @module socket/feedbackHandlers
 */

import Feedback from '../models/Feedback.js';

/**
 * Setup feedback-related socket events
 * 
 * @param {Socket} io - Socket.io server instance
 */
export const setupFeedbackHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Subscribe to feedback updates
    socket.on('subscribe:feedback', () => {
      socket.join('feedback');
      console.log('Client subscribed to feedback updates:', socket.id);
    });

    // Unsubscribe from feedback updates
    socket.on('unsubscribe:feedback', () => {
      socket.leave('feedback');
      console.log('Client unsubscribed from feedback updates:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Watch for changes in Feedback collection
  // Note: Change Streams require MongoDB replica set (available in MongoDB Atlas)
  try {
    const changeStream = Feedback.watch();
    changeStream.on('change', (change) => {
      const { operationType, fullDocument, documentKey } = change;

      if (operationType === 'insert') {
        // New feedback created
        io.to('feedback').emit('feedback:created', fullDocument);
        console.log('📢 Emitted feedback:created event');
      } else if (operationType === 'update') {
        // Feedback updated - need to fetch full document
        Feedback.findById(documentKey._id)
          .then((feedback) => {
            if (feedback) {
              io.to('feedback').emit('feedback:updated', feedback);
              console.log('📢 Emitted feedback:updated event');
            }
          })
          .catch((error) => {
            console.error('Error fetching updated feedback:', error);
          });
      } else if (operationType === 'delete') {
        // Feedback deleted
        io.to('feedback').emit('feedback:deleted', { _id: documentKey._id });
        console.log('📢 Emitted feedback:deleted event');
      }
    });
    
    changeStream.on('error', (error) => {
      console.error('❌ Change Stream error:', error);
    });
  } catch (error) {
    console.error('❌ Error setting up Feedback change stream:', error);
    console.warn('⚠️ Real-time updates for feedback may not work. MongoDB Change Streams require a replica set.');
  }
};

