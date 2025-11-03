/**
 * Seed Data Script
 * 
 * Populates the database with sample feedback and chat data
 * Run with: node scripts/seedData.js
 * 
 * @module scripts/seedData
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Import models
import Feedback from '../models/Feedback.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * Sample feedback data
 */
const sampleFeedback = [
  {
    employeeName: 'Alice Johnson',
    score: 5,
    notes: 'Exceptional performance on the recent project. Showed great leadership and problem-solving skills.',
    date: new Date('2024-07-26T10:30:00'),
  },
  {
    employeeName: 'Bob Smith',
    score: 4,
    notes: 'Consistently meets expectations. Good team player and reliable.',
    date: new Date('2024-07-25T14:20:00'),
  },
  {
    employeeName: 'Carol Williams',
    score: 3,
    notes: 'Needs improvement in communication. Technical skills are strong but needs to work on expressing ideas clearly.',
    date: new Date('2024-07-24T09:15:00'),
  },
  {
    employeeName: 'David Brown',
    score: 5,
    notes: 'Outstanding work ethic and dedication. A valuable asset to the team.',
    date: new Date('2024-07-23T16:45:00'),
  },
  {
    employeeName: 'Emma Davis',
    score: 4,
    notes: 'Good performance overall. Creative and detail-oriented.',
    date: new Date('2024-07-22T11:30:00'),
  },
  {
    employeeName: 'Alice Johnson',
    score: 5,
    notes: 'Continues to exceed expectations. Excellent leadership on Q4 project.',
    date: new Date('2024-07-21T13:00:00'),
  },
  {
    employeeName: 'Bob Smith',
    score: 3,
    notes: 'Good technical skills but needs better documentation practices.',
    date: new Date('2024-07-20T10:00:00'),
  },
  {
    employeeName: 'Carol Williams',
    score: 4,
    notes: 'Showing improvement in communication. Keep up the good work.',
    date: new Date('2024-07-19T15:30:00'),
  },
  {
    employeeName: 'David Brown',
    score: 5,
    notes: 'Consistently delivers high-quality work. Great team contributor.',
    date: new Date('2024-07-18T09:45:00'),
  },
  {
    employeeName: 'Emma Davis',
    score: 4,
    notes: 'Solid performance on mobile app redesign. Good attention to detail.',
    date: new Date('2024-07-17T14:15:00'),
  },
];

/**
 * Sample conversations and messages data
 */
const sampleConversations = [
  {
    employeeId: 'emp_alice_johnson',
    employeeName: 'Alice Johnson',
    participantNames: ['Sarah Connor (HR)', 'Alice Johnson'],
    messages: [
      {
        senderId: 'hr_sconnor',
        text: 'Hi Alice! Great job on the Q4 project. Your leadership was exceptional!',
        timestamp: new Date('2025-10-28T14:00:00'),
      },
      {
        senderId: 'emp_alice_johnson',
        text: 'Thank you so much! The team worked really hard.',
        timestamp: new Date('2025-10-28T14:15:00'),
      },
      {
        senderId: 'hr_sconnor',
        text: 'Your innovative approach to problem-solving stood out. Keep it up!',
        timestamp: new Date('2025-10-28T14:20:00'),
      },
      {
        senderId: 'emp_alice_johnson',
        text: 'Thank you for the feedback! I really appreciate it.',
        timestamp: new Date('2025-10-28T14:30:00'),
      },
    ],
  },
  {
    employeeId: 'emp_bob_smith',
    employeeName: 'Bob Smith',
    participantNames: ['Sarah Connor (HR)', 'Bob Smith'],
    messages: [
      {
        senderId: 'hr_sconnor',
        text: 'Hi Bob, I wanted to discuss your recent performance review.',
        timestamp: new Date('2025-10-27T16:00:00'),
      },
      {
        senderId: 'emp_bob_smith',
        text: 'Sure, I saw the feedback about documentation.',
        timestamp: new Date('2025-10-27T16:30:00'),
      },
      {
        senderId: 'hr_sconnor',
        text: 'Yes, your presentations are great, but we need better code documentation.',
        timestamp: new Date('2025-10-27T16:35:00'),
      },
      {
        senderId: 'emp_bob_smith',
        text: 'I will work on improving my documentation.',
        timestamp: new Date('2025-10-27T16:45:00'),
      },
    ],
  },
  {
    employeeId: 'emp_carol_williams',
    employeeName: 'Carol Williams',
    participantNames: ['Sarah Connor (HR)', 'Carol Williams'],
    messages: [
      {
        senderId: 'hr_sconnor',
        text: 'Hi Carol, I noticed your attendance has been inconsistent this quarter.',
        timestamp: new Date('2025-10-26T10:00:00'),
      },
      {
        senderId: 'emp_carol_williams',
        text: 'I apologize. I had some personal issues to deal with.',
        timestamp: new Date('2025-10-26T11:00:00'),
      },
      {
        senderId: 'emp_carol_williams',
        text: 'Can we schedule a meeting to discuss my performance?',
        timestamp: new Date('2025-10-26T11:20:00'),
      },
    ],
  },
  {
    employeeId: 'emp_david_brown',
    employeeName: 'David Brown',
    participantNames: ['Sarah Connor (HR)', 'David Brown'],
    messages: [
      {
        senderId: 'hr_sconnor',
        text: 'Hi David! Great work on the recent production deployment.',
        timestamp: new Date('2025-10-25T17:00:00'),
      },
      {
        senderId: 'emp_david_brown',
        text: 'Thanks! Happy to help the team.',
        timestamp: new Date('2025-10-25T17:05:00'),
      },
    ],
  },
  {
    employeeId: 'emp_emma_davis',
    employeeName: 'Emma Davis',
    participantNames: ['Sarah Connor (HR)', 'Emma Davis'],
    messages: [
      {
        senderId: 'hr_sconnor',
        text: 'Hi Emma! How is the mobile app redesign progressing?',
        timestamp: new Date('2025-10-24T15:30:00'),
      },
      {
        senderId: 'emp_emma_davis',
        text: 'The mobile app redesign is progressing well. We\'re on track for the deadline.',
        timestamp: new Date('2025-10-24T15:35:00'),
      },
      {
        senderId: 'hr_sconnor',
        text: 'Excellent! Keep up the great work.',
        timestamp: new Date('2025-10-24T15:40:00'),
      },
    ],
  },
];

/**
 * Seed feedback data
 */
const seedFeedback = async () => {
  try {
    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('✅ Cleared existing feedback');

    // Insert sample feedback
    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    console.log(`✅ Created ${createdFeedback.length} feedback records`);
    
    return createdFeedback;
  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
    throw error;
  }
};

/**
 * Seed conversations and messages
 */
const seedConversations = async () => {
  try {
    // Clear existing conversations and messages
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Cleared existing conversations and messages');

    const createdConversations = [];

    // Create each conversation with its messages
    for (const convData of sampleConversations) {
      // Get the last message for conversation metadata
      const lastMessage = convData.messages[convData.messages.length - 1];
      
      // Create conversation
      const conversation = new Conversation({
        employeeId: convData.employeeId,
        employeeName: convData.employeeName,
        participantNames: convData.participantNames,
        lastMessage: lastMessage.text.substring(0, 100),
        lastMessageTimestamp: lastMessage.timestamp,
      });
      
      const savedConversation = await conversation.save();
      createdConversations.push(savedConversation);

      // Create messages for this conversation
      const messages = convData.messages.map((msgData) => ({
        conversationId: savedConversation._id,
        senderId: msgData.senderId,
        text: msgData.text,
        timestamp: msgData.timestamp,
      }));

      await Message.insertMany(messages);
      console.log(`✅ Created conversation and ${messages.length} messages for ${convData.employeeName}`);
    }

    console.log(`✅ Created ${createdConversations.length} conversations`);
    return createdConversations;
  } catch (error) {
    console.error('❌ Error seeding conversations:', error);
    throw error;
  }
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Seed feedback
    await seedFeedback();
    console.log('');

    // Seed conversations
    await seedConversations();
    console.log('');

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${sampleFeedback.length} feedback records`);
    console.log(`   - ${sampleConversations.length} conversations`);
    console.log(`   - ${sampleConversations.reduce((sum, conv) => sum + conv.messages.length, 0)} messages\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed function
seedDatabase();

