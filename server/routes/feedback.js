/**
 * Feedback Routes
 * 
 * API routes for feedback operations
 * @module routes/feedback
 */

import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Get all feedback
router.get('/', feedbackController.getAllFeedback);

// Get feedback by ID
router.get('/:id', feedbackController.getFeedbackById);

// Create new feedback
router.post('/', feedbackController.createFeedback);

// Update feedback
router.put('/:id', feedbackController.updateFeedback);

// Delete feedback
router.delete('/:id', feedbackController.deleteFeedback);

// Get feedback by employee name
router.get('/employee/:name', feedbackController.getFeedbackByEmployee);

// Get feedback by score
router.get('/score/:score', feedbackController.getFeedbackByScore);

export default router;

