/**
 * Message Service
 * 
 * Business logic for message operations
 * @module services/messageService
 */

import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

/**
 * Get all messages for a conversation
 * 
 * @param {string} conversationIdOrEmployeeId - Conversation ID (MongoDB ObjectId) or Employee ID (e.g., 'emp_alice_johnson')
 * @returns {Promise<Array>} Array of messages sorted by timestamp
 */
export const getMessagesByConversationId = async (conversationIdOrEmployeeId) => {
  try {
    // Check if it's an employeeId or MongoDB ObjectId
    let conversation;
    
    // Try to find by employeeId first (string format like "emp_alice_johnson")
    conversation = await Conversation.findOne({ employeeId: conversationIdOrEmployeeId });
    
    // If not found and it looks like a MongoDB ObjectId, try by _id
    if (!conversation && conversationIdOrEmployeeId.match(/^[0-9a-fA-F]{24}$/)) {
      conversation = await Conversation.findById(conversationIdOrEmployeeId);
    }
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 }); // Oldest first for chat display

    return messages;
  } catch (error) {
    console.error('Error in getMessagesByConversationId:', error);
    throw error;
  }
};

/**
 * Create a new message
 * 
 * @param {Object} messageData - Message data
 * @param {string} messageData.conversationId - Conversation ID (MongoDB ObjectId) or Employee ID (e.g., 'emp_alice_johnson')
 * @param {string} messageData.senderId - Sender ID (e.g., 'hr_sconnor' or 'emp_alice_johnson')
 * @param {string} messageData.text - Message text
 * @param {Array} messageData.attachments - Array of attachment objects
 * @returns {Promise<Object>} Created message
 */
export const createMessage = async (messageData) => {
  try {
    const { conversationId, senderId, text, attachments = [] } = messageData;

    // Find conversation by employeeId or MongoDB ObjectId
    let conversation;
    
    // Try to find by employeeId first (string format like "emp_alice_johnson")
    conversation = await Conversation.findOne({ employeeId: conversationId });
    
    // If not found and it looks like a MongoDB ObjectId, try by _id
    if (!conversation && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      conversation = await Conversation.findById(conversationId);
    }
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Validate senderId matches one of the participantNames
    // Derive expected senderId from participantNames
    const validateSenderId = (senderId, participantNames) => {
      if (!participantNames || !Array.isArray(participantNames) || participantNames.length < 2) {
        return false;
      }

      // Check if senderId matches participantNames[0] (HR)
      const hrName = participantNames[0];
      if (hrName && (hrName.includes('(HR)') || hrName.toLowerCase().includes('sarah connor'))) {
        const expectedHRSenderId = 'hr_sconnor';
        if (senderId === expectedHRSenderId) {
          return true;
        }
      }

      // Check if senderId matches participantNames[1] (Employee)
      const empName = participantNames[1];
      if (empName) {
        // Generate expected employee ID from name
        const expectedEmpId = 'emp_' + empName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        if (senderId === expectedEmpId) {
          return true;
        }
      }

      return false;
    };

    if (!validateSenderId(senderId, conversation.participantNames)) {
      throw new Error(`Invalid senderId: ${senderId} does not match any participant in this conversation`);
    }

    // Build last message preview
    let lastMessage = (text && typeof text === 'string' ? text.trim() : '') || '';
    if (attachments.length > 0) {
      // Format attachment info for display
      const attachmentInfo = attachments[0]; // Show first attachment in preview
      if (attachmentInfo.type === 'image') {
        if (lastMessage) {
          lastMessage += ` 📷 ${attachmentInfo.name}`;
        } else {
          lastMessage = `📷 ${attachmentInfo.name}`;
        }
      } else {
        if (lastMessage) {
          lastMessage += ` 📄 ${attachmentInfo.name}`;
        } else {
          lastMessage = `📄 ${attachmentInfo.name}`;
        }
      }
      
      // If multiple attachments, add count
      if (attachments.length > 1) {
        lastMessage += ` (+${attachments.length - 1})`;
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id, // Use MongoDB ObjectId
      senderId,
      text: (text && typeof text === 'string' ? text.trim() : '') || '',
      attachments: attachments || [],
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();

    // Update conversation metadata with the message's actual timestamp
    // Use findOneAndUpdate with $max to ensure we only update if this message is newer
    // This prevents race conditions where older messages overwrite newer ones
    await Conversation.findOneAndUpdate(
      { 
        _id: conversation._id,
        // Only update if this message's timestamp is newer than current lastMessageTimestamp
        // OR if lastMessageTimestamp doesn't exist/is null
        $or: [
          { lastMessageTimestamp: { $exists: false } },
          { lastMessageTimestamp: null },
          { lastMessageTimestamp: { $lt: savedMessage.timestamp } }
        ]
      },
      {
        $set: {
          lastMessage: lastMessage.substring(0, 100),
          lastMessageTimestamp: savedMessage.timestamp, // Use the message's actual timestamp
        }
      },
      { new: true }
    );

    return savedMessage;
  } catch (error) {
    console.error('Error in createMessage:', error);
    throw error;
  }
};

/**
 * Update message
 * 
 * @param {string} messageId - Message ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated message or null
 */
export const updateMessage = async (messageId, updateData) => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return message;
  } catch (error) {
    console.error('Error in updateMessage:', error);
    throw error;
  }
};

/**
 * Delete message
 * 
 * @param {string} messageId - Message ID
 * @returns {Promise<Object|null>} Deleted message or null
 */
export const deleteMessage = async (messageId) => {
  try {
    const message = await Message.findByIdAndDelete(messageId);
    return message;
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    throw error;
  }
};

