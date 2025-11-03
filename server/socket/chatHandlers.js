/**
 * Socket.io Chat Handlers
 * 
 * Real-time event handlers for chat operations
 * @module socket/chatHandlers
 */

import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * Setup chat-related socket events
 * 
 * @param {Socket} io - Socket.io server instance
 */
export const setupChatHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Client connected for chat:', socket.id);

    // Subscribe to conversations list updates
    socket.on('subscribe:conversations', () => {
      socket.join('conversations');
      console.log('Client subscribed to conversations updates:', socket.id);
    });

    // Unsubscribe from conversations list
    socket.on('unsubscribe:conversations', () => {
      socket.leave('conversations');
      console.log('Client unsubscribed from conversations:', socket.id);
    });

    // Subscribe to messages for a specific conversation
    socket.on('subscribe:messages', async (conversationIdOrEmployeeId) => {
      try {
        let conversation;
        
        // Try to find by employeeId first (string format like "emp_alice_johnson")
        conversation = await Conversation.findOne({ employeeId: conversationIdOrEmployeeId });
        
        // If not found and it looks like a MongoDB ObjectId, try by _id
        if (!conversation && conversationIdOrEmployeeId.match(/^[0-9a-fA-F]{24}$/)) {
          conversation = await Conversation.findById(conversationIdOrEmployeeId);
        }
        
        if (conversation) {
          const room = `conversation:${conversation._id}`;
          socket.join(room);
          console.log(`Client subscribed to messages for conversation ${conversation._id} (employeeId: ${conversationIdOrEmployeeId}):`, socket.id);
        } else {
          // If conversation not found, still join using the provided ID (fallback)
          const room = `conversation:${conversationIdOrEmployeeId}`;
          socket.join(room);
          console.log(`Client subscribed to messages for conversation ${conversationIdOrEmployeeId} (conversation not found):`, socket.id);
        }
      } catch (error) {
        console.error('Error subscribing to messages:', error);
        // Fallback: join using the provided ID
        const room = `conversation:${conversationIdOrEmployeeId}`;
        socket.join(room);
      }
    });

    // Unsubscribe from messages for a specific conversation
    socket.on('unsubscribe:messages', async (conversationIdOrEmployeeId) => {
      try {
        let conversation;
        
        // Try to find by employeeId first
        conversation = await Conversation.findOne({ employeeId: conversationIdOrEmployeeId });
        
        // If not found and it looks like a MongoDB ObjectId, try by _id
        if (!conversation && conversationIdOrEmployeeId.match(/^[0-9a-fA-F]{24}$/)) {
          conversation = await Conversation.findById(conversationIdOrEmployeeId);
        }
        
        if (conversation) {
          const room = `conversation:${conversation._id}`;
          socket.leave(room);
          console.log(`Client unsubscribed from messages for conversation ${conversation._id}:`, socket.id);
        } else {
          // Fallback: leave using the provided ID
          const room = `conversation:${conversationIdOrEmployeeId}`;
          socket.leave(room);
        }
      } catch (error) {
        console.error('Error unsubscribing from messages:', error);
        // Fallback: leave using the provided ID
        const room = `conversation:${conversationIdOrEmployeeId}`;
        socket.leave(room);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Watch for changes in Conversation collection
  // Note: Change Streams require MongoDB replica set (available in MongoDB Atlas)
  try {
    const conversationChangeStream = Conversation.watch();
    conversationChangeStream.on('change', (change) => {
      const { operationType, fullDocument, documentKey } = change;

      if (operationType === 'insert' || operationType === 'update') {
        // Fetch full document for updates
        const fetchPromise = operationType === 'update'
          ? Conversation.findById(documentKey._id)
          : Promise.resolve(fullDocument);

        fetchPromise.then((conversation) => {
          if (conversation) {
            io.to('conversations').emit('conversation:updated', conversation);
            console.log('📢 Emitted conversation:updated event');
          }
        }).catch((error) => {
          console.error('Error fetching conversation:', error);
        });
      }
    });
    
    conversationChangeStream.on('error', (error) => {
      console.error('❌ Conversation Change Stream error:', error);
    });
  } catch (error) {
    console.error('❌ Error setting up Conversation change stream:', error);
    console.warn('⚠️ Real-time updates for conversations may not work. MongoDB Change Streams require a replica set.');
  }

  // Watch for changes in Message collection
  try {
    const messageChangeStream = Message.watch();
    messageChangeStream.on('change', (change) => {
      const { operationType, fullDocument, documentKey } = change;

      if (operationType === 'insert') {
        // New message created
        Message.findById(documentKey._id)
          .populate('conversationId')
          .then((message) => {
            if (message && message.conversationId) {
              const room = `conversation:${message.conversationId._id}`;
              io.to(room).emit('message:new', message);
              io.to('conversations').emit('conversation:updated', message.conversationId);
              console.log('📢 Emitted message:new event');
            }
          })
          .catch((error) => {
            console.error('Error fetching message:', error);
          });
      }
    });
    
    messageChangeStream.on('error', (error) => {
      console.error('❌ Message Change Stream error:', error);
    });
  } catch (error) {
    console.error('❌ Error setting up Message change stream:', error);
    console.warn('⚠️ Real-time updates for messages may not work. MongoDB Change Streams require a replica set.');
  }
};

