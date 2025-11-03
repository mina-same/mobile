/**
 * Message Model
 * 
 * Mongoose model for chat messages within conversations
 * @module models/Message
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
      trim: true,
    },
    text: {
      type: String,
      required: false,
      default: '',
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    attachments: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            required: true,
            enum: ['image', 'file'],
          },
          name: {
            type: String,
            required: true,
          },
          size: {
            type: Number,
            default: 0,
          },
          publicId: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
messageSchema.index({ conversationId: 1, timestamp: 1 }); // Compound index for message queries
messageSchema.index({ senderId: 1 });
messageSchema.index({ timestamp: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

