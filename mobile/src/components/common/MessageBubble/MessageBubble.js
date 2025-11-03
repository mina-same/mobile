/**
 * MessageBubble Component
 * Displays a single chat message (sent or received)
 * Supports text messages and attachments (images/files)
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { formatMessageTime } from '../../../utils/dateFormatter';

/**
 * Message bubble component
 * 
 */
const MessageBubble = ({ message, isSent }) => {
  if (!message) return null;
  
  // Parse attachments - ensure it's always an array
  let attachments = [];
  if (message.attachments) {
    if (Array.isArray(message.attachments)) {
      attachments = message.attachments;
    } else if (typeof message.attachments === 'object') {
      // If attachments is a single object, wrap it in an array
      attachments = [message.attachments];
    }
  }
  
  // Debug: Log message structure to see what we're receiving
  if (__DEV__) {
    if (attachments.length > 0) {
      console.log('📎 MessageBubble - Message has attachments:', {
        messageId: message._id || message.id,
        attachments: attachments,
        attachmentsLength: attachments.length,
        attachmentTypes: attachments.map(a => a?.type),
        attachmentUrls: attachments.map(a => a?.url),
        firstAttachment: attachments[0],
        fullMessage: message,
      });
    } else if (message.text?.includes('📷') || message.text?.includes('📄')) {
      console.warn('⚠️ MessageBubble - Message might have attachment but attachments array is empty:', {
        messageId: message._id || message.id,
        text: message.text,
        attachmentsRaw: message.attachments,
        attachmentsType: typeof message.attachments,
        messageKeys: Object.keys(message),
      });
    }
  }
  
  /**
   * Handles opening attachment URL
   */
  const handleOpenAttachment = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
    }
  };
  
  return (
    <View style={[
      styles.container,
      isSent ? styles.sentContainer : styles.receivedContainer
    ]}>
      <View style={[
        styles.bubble,
        isSent ? styles.sentBubble : styles.receivedBubble
      ]}>
        {/* Attachments */}
        {attachments.length > 0 ? (
          <View style={styles.attachmentsContainer}>
            {attachments.map((attachment, index) => (
              <View key={attachment.url || index} style={[styles.attachmentWrapper, index > 0 && { marginTop: SPACING.xs }]}>
                {attachment.type === 'image' ? (
                  <TouchableOpacity
                    onPress={() => handleOpenAttachment(attachment.url)}
                    activeOpacity={0.9}
                    style={styles.imageTouchable}
                  >
                    {attachment.url ? (
                      <Image
                        source={{ uri: attachment.url }}
                        style={styles.attachmentImage}
                        resizeMode="contain"
                        onError={(error) => {
                          console.error('❌ Image load error:', {
                            url: attachment.url,
                            error: error.nativeEvent?.error || error,
                            attachment,
                            messageId: message._id || message.id,
                            fullMessage: message,
                          });
                        }}
                        onLoad={(e) => {
                          if (__DEV__) {
                            const { width, height } = e.nativeEvent.source || {};
                            console.log('✅ Image loaded successfully:', {
                              url: attachment.url,
                              messageId: message._id || message.id,
                              imageDimensions: width && height ? { width, height } : 'unknown',
                            });
                          }
                        }}
                      />
                    ) : (
                      <View style={[styles.attachmentImage, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: COLORS.gray600 }}>No image URL</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.attachmentFile,
                      isSent ? styles.attachmentFileSent : styles.attachmentFileReceived
                    ]}
                    onPress={() => handleOpenAttachment(attachment.url)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="document-outline"
                      size={24}
                      color={isSent ? COLORS.messageSentText : COLORS.gray600}
                      style={{ marginRight: SPACING.sm }}
                    />
                    <View style={styles.attachmentFileInfo}>
                      <Text
                        style={[
                          styles.attachmentFileName,
                          isSent ? styles.attachmentFileTextSent : styles.attachmentFileTextReceived
                        ]}
                        numberOfLines={1}
                      >
                        {attachment.name}
                      </Text>
                      {attachment.size > 0 && (
                        <Text
                          style={[
                            styles.attachmentFileSize,
                            isSent ? styles.attachmentFileTextSent : styles.attachmentFileTextReceived
                          ]}
                        >
                          {(attachment.size / 1024).toFixed(1)} KB
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name="open-outline"
                      size={20}
                      color={isSent ? COLORS.messageSentText : COLORS.gray600}
                      style={{ marginLeft: SPACING.sm }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : null}
        
        {/* Message Text - only show if text exists */}
        {message.text && message.text.trim().length > 0 && (
          <Text style={[
            styles.text,
            isSent ? styles.sentText : styles.receivedText
          ]}>
            {message.text}
          </Text>
        )}
        
        {/* Timestamp */}
        <Text style={[
          styles.time,
          isSent ? styles.sentTime : styles.receivedTime
        ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  sentBubble: {
    backgroundColor: COLORS.messageSent,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  receivedBubble: {
    backgroundColor: COLORS.messageReceived,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  attachmentsContainer: {
    marginBottom: SPACING.xs,
  },
  attachmentWrapper: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 250,
    height: 200, // Fixed height to ensure image displays
    maxHeight: 300,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  imageTouchable: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    minWidth: 200,
  },
  attachmentFileSent: {
    borderColor: COLORS.messageSentText,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  attachmentFileReceived: {
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray50,
  },
  attachmentFileInfo: {
    flex: 1,
    minWidth: 0,
  },
  attachmentFileName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  attachmentFileTextSent: {
    color: COLORS.messageSentText,
  },
  attachmentFileTextReceived: {
    color: COLORS.gray900,
  },
  attachmentFileSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    opacity: 0.7,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
    marginTop: SPACING.xs,
  },
  sentText: {
    color: COLORS.messageSentText,
  },
  receivedText: {
    color: COLORS.messageReceivedText,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
  },
  sentTime: {
    color: COLORS.messageSentText,
    opacity: 0.8,
  },
  receivedTime: {
    color: COLORS.gray600,
  },
});

export default MessageBubble;

