/**
 * Conversation Model
 * 
 * Mongoose model for chat conversations between HR and employees
 * @module models/Conversation
 */

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    participantNames: {
      type: [String],
      required: [true, 'Participant names are required'],
      default: function() {
        return ['Sarah Connor (HR)', this.employeeName];
      },
    },
    lastMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Last message preview cannot exceed 100 characters'],
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
conversationSchema.index({ employeeId: 1 });
conversationSchema.index({ employeeName: 1 });
conversationSchema.index({ lastMessageTimestamp: -1 }); // Descending for newest first
conversationSchema.index({ createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

