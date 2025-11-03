/**
 * MessageInput Component
 * 
 * Input field for composing and sending messages
 * Includes send button and handles enter key
 * 
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import { uploadFiles } from '../../../services/uploadApi.js';
import './MessageInput.module.css';

/**
 * Message input component
 * 
 */
const MessageInput = ({
  onSendMessage,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('recent');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isTyping = message.trim().length > 0;
  // When conversation is selected (not disabled), show send button instead of voice
  const isConversationSelected = !disabled;
  
  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  /**
   * Handles message send
   */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    // Allow sending if there's a message OR files selected
    if ((!trimmedMessage && selectedFiles.length === 0) || loading || disabled) return;
    
    try {
      let attachments = [];
      
      // Upload files if any selected
      if (selectedFiles.length > 0) {
        try {
          const uploadResults = await uploadFiles(selectedFiles);
          
          // Transform upload results to attachment format
          attachments = uploadResults.map((result) => ({
            url: result.url,
            type: result.type,
            name: result.name,
            size: result.size,
            publicId: result.publicId || null,
          }));
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          alert('Failed to upload files. Please try again.');
          return;
        }
      }
      
      // Send message with attachments
      await onSendMessage(trimmedMessage, attachments);
      
      setMessage('');
      setSelectedFiles([]);
      
      // Reset textarea height and refocus
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Refocus textarea after sending
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };
  
  /**
   * Handles textarea change
   */
  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  /**
   * Handles key press (Enter to send)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handles emoji click
   */
  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus textarea after emoji selection
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  /**
   * Emoji categories with organized emojis
   */
  const emojiCategories = {
    recent: ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
    gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    objects: ['🔥', '⭐', '🌟', '✨', '💫', '💥', '💢', '💯', '💤', '💨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'],
  };

  /**
   * Handles file selection
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Filter for images only (you can extend this for other file types)
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const otherFiles = files.filter(file => !file.type.startsWith('image/'));
      
      setSelectedFiles(prev => [...prev, ...imageFiles, ...otherFiles]);
      
      // Preview images
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // You can handle image preview here if needed
          console.log('Image selected:', file.name, e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // Reset file input to allow selecting the same file again
      e.target.value = '';
    }
  };

  /**
   * Removes a selected file
   */
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handles record button click (placeholder for future voice recording)
   */
  const handleRecordClick = () => {
    // TODO: Implement voice recording functionality
    console.log('Record clicked');
  };
  
  /**
   * Handles add button click - opens file picker
   */
  const handleAddClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Category Tabs */}
          <div className="flex items-center justify-around border-b border-gray-200 bg-gray-50 px-2 py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('recent')}
              className={`px-3 py-2.5 text-lg transition-all ${
                selectedCategory === 'recent'
                  ? 'text-gray-900 bg-white rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Recent emojis"
            >
              ⏰
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('smileys')}
              className={`px-3 py-2.5 text-lg transition-all ${
                selectedCategory === 'smileys'
                  ? 'text-gray-900 bg-white rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Smileys"
            >
              😊
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('gestures')}
              className={`px-3 py-2.5 text-lg transition-all ${
                selectedCategory === 'gestures'
                  ? 'text-gray-900 bg-white rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Gestures"
            >
              👋
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('hearts')}
              className={`px-3 py-2.5 text-lg transition-all ${
                selectedCategory === 'hearts'
                  ? 'text-gray-900 bg-white rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Hearts"
            >
              ❤️
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('objects')}
              className={`px-3 py-2.5 text-lg transition-all ${
                selectedCategory === 'objects'
                  ? 'text-gray-900 bg-white rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Objects"
            >
              🔥
            </button>
          </div>

          {/* Emoji Grid */}
          <div className="p-4 max-h-64 overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-8 gap-0">
              {emojiCategories[selectedCategory]?.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors active:bg-gray-200 flex items-center justify-center aspect-square min-h-[40px]"
                  aria-label={`Add ${emoji} emoji`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs text-gray-500 truncate w-full text-center mt-1">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          aria-label="File input"
        />

        {/* Add Attachment Button (+) - Desktop only */}
        {!isMobile && (
          <button
            type="button"
            onClick={handleAddClick}
            disabled={disabled || loading}
            className="flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add attachment"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}

        {/* Emoji Button - Desktop only */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || loading}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              showEmojiPicker
                ? 'text-gray-900 bg-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Toggle emoji picker"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              setShowEmojiPicker(false);
            }}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className="messageInput w-full px-4 py-3 text-base border border-gray-300 rounded-xl resize-none outline-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:border-gray-900 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed overflow-y-auto"
            style={{ 
              maxHeight: '120px', 
              minHeight: '48px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              fontSize: '12px',
            }}
            aria-label="Message input"
            autoFocus={false}
            autoComplete="off"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>
        
        {/* Send/Add Button (outside textarea) */}
        <button
          type="button"
          onClick={
            isMobile && !isTyping && selectedFiles.length === 0 
              ? handleAddClick 
              : isTyping || selectedFiles.length > 0 || isConversationSelected 
                ? handleSend 
                : handleRecordClick
          }
          disabled={
            isMobile && !isTyping && selectedFiles.length === 0
              ? (disabled || loading)
              : (isTyping || selectedFiles.length > 0 || isConversationSelected) 
                ? (!message.trim() && selectedFiles.length === 0 || disabled || loading) 
                : (disabled || loading)
          }
          className="flex-shrink-0 w-10 h-10 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed self-start mt-1"
          aria-label={
            isMobile && !isTyping && selectedFiles.length === 0
              ? "Add attachment"
              : (isTyping || selectedFiles.length > 0 || isConversationSelected) 
                ? "Send message" 
                : "Record voice message"
          }
          style={{ marginTop: '4px' }}
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : isMobile && !isTyping && selectedFiles.length === 0 ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : isTyping || isConversationSelected ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// Prop types for type checking
MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default MessageInput;

