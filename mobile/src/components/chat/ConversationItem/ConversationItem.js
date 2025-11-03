/**
 * ConversationItem Component
 * Displays one conversation in the list
 * Shows: Employee name, last message preview, timestamp
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { formatConversationTime } from '../../../utils/dateFormatter';
import { truncateString, getInitials } from '../../../utils/helpers';

/**
 * Avatar color palette - different colors for different conversations
 */
const avatarColors = [
  COLORS.primary,           // #01002C
  '#2563EB',               // Blue
  '#7C3AED',               // Purple
  '#059669',               // Green
  '#DC2626',               // Red
  '#EA580C',               // Orange
  '#0891B2',               // Cyan
  '#BE185D',               // Pink
  '#9333EA',               // Violet
  '#CA8A04',               // Amber
];

/**
 * Gets avatar color based on conversation ID
 * Ensures same conversation always gets same color
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {string} Color for avatar
 */
const getAvatarColor = (conversationId) => {
  if (!conversationId) return avatarColors[0];
  
  // Simple hash function to get consistent color per conversation
  let hash = 0;
  for (let i = 0; i < conversationId.length; i++) {
    hash = conversationId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

/**
 * Conversation item component
 * 
 * @param {Object} conversation - Conversation object
 * @param {Function} onPress - Called when item is pressed
 */
const ConversationItem = ({ conversation, onPress }) => {
  if (!conversation) return null;
  
  // Get unique avatar color for this conversation
  const avatarColor = useMemo(
    () => getAvatarColor(conversation.id),
    [conversation.id]
  );
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>
          {getInitials(conversation.employeeName)}
        </Text>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.employeeName}
          </Text>
          {conversation.lastMessageTimestamp && (
            <Text style={styles.time}>
              {formatConversationTime(conversation.lastMessageTimestamp)}
            </Text>
          )}
        </View>
        
        {/* Last Message Preview */}
        {conversation.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {truncateString(conversation.lastMessage, 50)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    flex: 1,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginLeft: SPACING.sm,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
});

export default ConversationItem;

