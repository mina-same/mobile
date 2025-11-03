/**
 * Feedback Model
 * 
 * Mongoose model for employee feedback records
 * @module models/Feedback
 */

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [1, 'Score must be at least 1'],
      max: [5, 'Score cannot exceed 5'],
    },
    notes: {
      type: String,
      required: [true, 'Notes are required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
feedbackSchema.index({ employeeName: 1 });
feedbackSchema.index({ score: 1 });
feedbackSchema.index({ date: -1 }); // Descending for newest first
feedbackSchema.index({ createdAt: -1 });

// Compound index for common queries
feedbackSchema.index({ employeeName: 1, date: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

