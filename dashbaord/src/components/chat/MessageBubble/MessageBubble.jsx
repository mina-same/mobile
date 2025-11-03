/**
 * MessageBubble Component
 * 
 * Displays a single message in the chat
 * Styled differently for sent vs received messages
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { formatChatTime } from '../../../utils/dateFormatter';
import { HR_USER } from '../../../config/constants';
import './MessageBubble.module.css';

/**
 * Message bubble component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object
 * @param {boolean} props.isHR - Whether the message is from HR
 * @returns {JSX.Element} MessageBubble component
 */
const MessageBubble = ({ message, isHR }) => {
  const isFromHR = message.senderId === HR_USER.ID || isHR;
  
  const attachments = message.attachments || [];
  
  return (
    <div
      className={`flex ${isFromHR ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2.5
          ${isFromHR
            ? 'bg-gray-900 text-white'
            : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
          }
        `}
      >
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                {attachment.type === 'image' ? (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 border-dashed transition-colors
                      ${isFromHR
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }
                    `}
                  >
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${isFromHR ? 'text-gray-400' : 'text-gray-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isFromHR ? 'text-white' : 'text-gray-900'}`}>
                        {attachment.name}
                      </p>
                      {attachment.size > 0 && (
                        <p className={`text-xs ${isFromHR ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${isFromHR ? 'text-gray-400' : 'text-gray-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message Text */}
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}
        
        {/* Timestamp */}
        <p
          className={`
            text-xs mt-1.5 
            ${isFromHR ? 'text-gray-400' : 'text-gray-500'}
          `}
        >
          {formatChatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Prop types for type checking
MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    senderId: PropTypes.string.isRequired,
    text: PropTypes.string,
    timestamp: PropTypes.any.isRequired,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['image', 'file']).isRequired,
        name: PropTypes.string.isRequired,
        size: PropTypes.number,
        publicId: PropTypes.string,
      })
    ),
  }).isRequired,
  isHR: PropTypes.bool,
};

export default MessageBubble;

