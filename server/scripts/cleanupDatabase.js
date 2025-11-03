/**
 * Database Cleanup Script
 * 
 * Removes duplicate and invalid conversations
 * Keeps only conversations with valid employeeIds (starting with 'emp_')
 * @module scripts/cleanupDatabase
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Load environment variables
dotenv.config();

/**
 * Cleanup duplicate and invalid conversations
 */
const cleanupDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all conversations
    const conversations = await Conversation.find().sort({ lastMessageTimestamp: -1 });
    console.log(`📋 Found ${conversations.length} conversations\n`);

    // Group conversations by employeeName (more reliable than employeeId)
    const conversationsByEmployee = {};
    const conversationsToDelete = [];
    
    for (const conv of conversations) {
      const key = conv.employeeName; // Group by employee name
      
      if (!conversationsByEmployee[key]) {
        conversationsByEmployee[key] = [];
      }
      
      conversationsByEmployee[key].push(conv);
    }

    // Find duplicates and invalid conversations
    console.log('🔍 Analyzing conversations...\n');
    
    for (const [key, convs] of Object.entries(conversationsByEmployee)) {
      if (convs.length > 1) {
        console.log(`⚠️ Found ${convs.length} conversations for: ${key}`);
        
        // Find the valid conversation (has proper employeeId and messages)
        let validConversation = null;
        let maxMessages = -1;
        
        // First, find conversation with proper employeeId format (emp_*) that has messages
        for (const conv of convs) {
          if (conv.employeeId.startsWith('emp_')) {
            const messageCount = await Message.countDocuments({ conversationId: conv._id });
            if (messageCount > maxMessages || (messageCount === maxMessages && !validConversation)) {
              validConversation = conv;
              maxMessages = messageCount;
            }
          }
        }
        
        // If no valid conversation with proper employeeId found, pick the one with most messages
        if (!validConversation) {
          for (const conv of convs) {
            const messageCount = await Message.countDocuments({ conversationId: conv._id });
            if (messageCount > maxMessages) {
              validConversation = conv;
              maxMessages = messageCount;
            }
          }
        }
        
        // Prioritize conversations with proper employeeId format even if they have fewer messages
        if (validConversation && !validConversation.employeeId.startsWith('emp_')) {
          for (const conv of convs) {
            if (conv.employeeId.startsWith('emp_')) {
              const messageCount = await Message.countDocuments({ conversationId: conv._id });
              if (messageCount >= maxMessages) {
                validConversation = conv;
                maxMessages = messageCount;
                break;
              }
            }
          }
        }
        
        if (validConversation) {
          console.log(`   ✅ Keeping: ${validConversation._id} (${maxMessages} messages, employeeId: ${validConversation.employeeId})`);
          
          // Mark others for deletion
          for (const conv of convs) {
            if (conv._id.toString() !== validConversation._id.toString()) {
              const messageCount = await Message.countDocuments({ conversationId: conv._id });
              console.log(`   ❌ Deleting: ${conv._id} (${messageCount} messages, employeeId: ${conv.employeeId})`);
              conversationsToDelete.push(conv);
            }
          }
        }
      } else {
        // Check if single conversation has invalid employeeId
        const conv = convs[0];
        if (!conv.employeeId.startsWith('emp_') && !conv.employeeId.match(/^[0-9a-fA-F]{24}$/)) {
          // Invalid format - might be a MongoDB ObjectId incorrectly stored
          console.log(`⚠️ Found conversation with invalid employeeId: ${conv._id} (employeeId: ${conv.employeeId})`);
          const messageCount = await Message.countDocuments({ conversationId: conv._id });
          if (messageCount === 0) {
            console.log(`   ❌ Deleting: ${conv._id} (no messages, invalid employeeId)`);
            conversationsToDelete.push(conv);
          }
        }
      }
    }

    // Delete invalid/duplicate conversations and their messages
    if (conversationsToDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${conversationsToDelete.length} invalid/duplicate conversations...`);
      
      for (const conv of conversationsToDelete) {
        // Delete all messages for this conversation
        const deletedMessages = await Message.deleteMany({ conversationId: conv._id });
        console.log(`   Deleted ${deletedMessages.deletedCount} messages for conversation ${conv._id}`);
        
        // Delete the conversation
        await Conversation.deleteOne({ _id: conv._id });
        console.log(`   Deleted conversation ${conv._id} (${conv.employeeName})`);
      }
      
      console.log(`\n✅ Cleanup completed! Deleted ${conversationsToDelete.length} conversations`);
    } else {
      console.log('\n✅ No duplicate or invalid conversations found!');
    }

    // Final summary
    const remainingConversations = await Conversation.find();
    const remainingMessages = await Message.find();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY:');
    console.log(`   Remaining Conversations: ${remainingConversations.length}`);
    console.log(`   Remaining Messages: ${remainingMessages.length}`);
    console.log('='.repeat(80));

    // Verify no duplicates
    const employeeIds = remainingConversations.map(c => c.employeeId);
    const duplicates = employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️ Warning: Still found duplicate employeeIds: ${[...new Set(duplicates)].join(', ')}`);
    } else {
      console.log('\n✅ No duplicate employeeIds found');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error cleaning up database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run cleanup
cleanupDatabase();

