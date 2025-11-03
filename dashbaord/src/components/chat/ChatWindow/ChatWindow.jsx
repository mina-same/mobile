/**
 * ChatWindow Component
 * 
 * Main chat interface displaying messages and input
 * Auto-scrolls to bottom on new messages
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MessageBubble from '../MessageBubble';
import MessageInput from '../MessageInput';
import Loading from '../../common/Loading';
import { getChatDateLabel } from '../../../utils/dateFormatter';
import './ChatWindow.module.css';

/**
 * Chat window component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.employeeName - Name of the employee being chatted with
 * @param {Function} props.onSendMessage - Send message callback
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.sendingMessage - Message sending state
 * @param {Function} props.onBack - Back button callback (mobile only)
 * @returns {JSX.Element} ChatWindow component
 */
const ChatWindow = ({
  messages = [],
  employeeName,
  onSendMessage,
  loading = false,
  sendingMessage = false,
  onBack,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * Groups messages by date
   */
  const groupMessagesByDate = (messagesList) => {
    const groups = {};
    
    messagesList.forEach((message) => {
      const dateLabel = getChatDateLabel(message.timestamp);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  // No employee selected
  if (!employeeName) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 text-center px-6 border border-gray-200">
        <svg
          className="w-20 h-20 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select a Conversation
        </h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Choose an employee from the list to start or continue a conversation.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Back Button (Mobile only) */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Back to conversations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {employeeName?.charAt(0).toUpperCase() || '?'}
          </div>
          
          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {employeeName}
            </h2>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-gray-50"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              No Messages Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Start the conversation by sending a message to {employeeName}.
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(messageGroups).map(([dateLabel, dateMessages]) => (
              <div key={dateLabel} className="mb-6">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                    <p className="text-xs font-medium text-gray-500">
                      {dateLabel}
                    </p>
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                ))}
              </div>
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={!employeeName}
        loading={sendingMessage}
        placeholder={`Message ${employeeName}...`}
      />
    </div>
  );
};

// Prop types for type checking
ChatWindow.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      senderId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.any.isRequired,
    })
  ),
  employeeName: PropTypes.string,
  onSendMessage: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  sendingMessage: PropTypes.bool,
  onBack: PropTypes.func,
};

export default ChatWindow;

