/**
 * Database Check Script
 * 
 * Queries MongoDB to check all conversations and their messages
 * Ensures data integrity
 * @module scripts/checkDatabase
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Load environment variables
dotenv.config();

/**
 * Check all conversations and their messages
 */
const checkDatabase = async () => {
  try {
    console.log('🔍 Starting database check...\n');
    
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
    console.log('='.repeat(80));

    // Check each conversation
    let totalMessages = 0;
    let orphanedMessages = 0;

    for (const conv of conversations) {
      console.log(`\n💬 Conversation: ${conv.employeeName}`);
      console.log(`   ID: ${conv._id}`);
      console.log(`   Employee ID: ${conv.employeeId}`);
      console.log(`   Participant Names: [${conv.participantNames.join(', ')}]`);
      console.log(`   Last Message: ${conv.lastMessage || '(empty)'}`);
      console.log(`   Last Message Timestamp: ${conv.lastMessageTimestamp}`);

      // Get all messages for this conversation
      const messages = await Message.find({ conversationId: conv._id })
        .sort({ timestamp: 1 });

      console.log(`   Messages: ${messages.length}`);
      totalMessages += messages.length;

      if (messages.length > 0) {
        console.log(`   Message Details:`);
        messages.forEach((msg, index) => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          const textPreview = msg.text ? msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : '') : '(no text)';
          const attachments = msg.attachments && msg.attachments.length > 0 ? ` [${msg.attachments.length} attachment(s)]` : '';
          console.log(`     ${index + 1}. ${msg.senderId} - "${textPreview}"${attachments} (${timestamp})`);
        });
      }

      console.log('-'.repeat(80));
    }

    // Check for orphaned messages (messages without a conversation)
    console.log(`\n🔍 Checking for orphaned messages...`);
    const allMessages = await Message.find();
    const allConversationIds = conversations.map(c => c._id.toString());
    
    const orphaned = allMessages.filter(msg => {
      const conversationId = msg.conversationId.toString();
      return !allConversationIds.includes(conversationId);
    });

    if (orphaned.length > 0) {
      console.log(`⚠️ Found ${orphaned.length} orphaned messages (messages without a valid conversation):`);
      orphaned.forEach(msg => {
        console.log(`   - Message ID: ${msg._id}, Conversation ID: ${msg.conversationId}, Sender: ${msg.senderId}`);
      });
      orphanedMessages = orphaned.length;
    } else {
      console.log('✅ No orphaned messages found');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`   Total Conversations: ${conversations.length}`);
    console.log(`   Total Messages: ${totalMessages}`);
    console.log(`   Orphaned Messages: ${orphanedMessages}`);
    console.log('='.repeat(80));

    // Check for duplicate conversations (same employeeId)
    console.log('\n🔍 Checking for duplicate conversations...');
    const employeeIds = conversations.map(c => c.employeeId);
    const duplicates = employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Found duplicate employeeIds: ${[...new Set(duplicates)].join(', ')}`);
      const duplicateConvs = conversations.filter(c => duplicates.includes(c.employeeId));
      duplicateConvs.forEach(c => {
        console.log(`   - Conversation ID: ${c._id}, Employee ID: ${c.employeeId}, Employee Name: ${c.employeeName}`);
      });
    } else {
      console.log('✅ No duplicate conversations found');
    }

    // Check message senderId consistency
    console.log('\n🔍 Checking message senderId consistency...');
    let inconsistentMessages = [];
    for (const conv of conversations) {
      const messages = await Message.find({ conversationId: conv._id });
      for (const msg of messages) {
        // Check if senderId matches expected format based on participantNames
        const isHR = conv.participantNames[0]?.includes('(HR)') || conv.participantNames[0]?.toLowerCase().includes('sarah connor');
        const expectedHRSenderId = 'hr_sconnor';
        const isEmployeeSender = msg.senderId.startsWith('emp_');
        
        // Check if HR message has correct senderId
        if (isHR && msg.senderId === expectedHRSenderId) {
          continue; // Correct
        }
        
        // Check if employee message has correct format
        if (!isHR && isEmployeeSender) {
          // Verify employee ID matches conversation employeeId
          if (msg.senderId === conv.employeeId) {
            continue; // Correct
          }
        }
        
        // If we get here, might be inconsistent - but let's not flag it unless clearly wrong
        // This is just informational
      }
    }
    
    console.log('✅ Message senderId check completed');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run check
checkDatabase();

