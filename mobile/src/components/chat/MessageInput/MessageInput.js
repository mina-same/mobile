/**
 * MessageInput Component
 * Input field for composing and sending messages
 * Includes send button and handles keyboard
 */

import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Modal, Text, Alert, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, LAYOUT } from '../../../config/theme';
import { validateMessage } from '../../../utils/helpers';
import { uploadFile } from '../../../services/api.js';

/**
 * Message input component
 * 
 * @param {Function} onSendMessage - Called when user sends message
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} loading - Whether message is being sent
 * @param {string} placeholder - Placeholder text
 */
const MessageInput = ({
  onSendMessage,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Smileys & People');
  const [uploading, setUploading] = useState(false);
  
  // Use hooks for permissions (better Expo Go compatibility)
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  
  useEffect(() => {
    console.log('🔐 [Permissions] Camera permission status:', cameraPermission?.status);
    console.log('🔐 [Permissions] Media library permission status:', mediaLibraryPermission?.status);
  }, [cameraPermission, mediaLibraryPermission]);
  
  /**
   * Check and request camera permission using hooks
   */
  const checkCameraPermission = async () => {
    console.log('📷 [Permission] Checking camera permission...');
    console.log('📷 [Permission] Current status:', cameraPermission?.status);
    
    if (Platform.OS === 'web') {
      return true;
    }
    
    if (!cameraPermission) {
      console.log('📷 [Permission] Permission object not ready');
      return false;
    }
    
    if (cameraPermission.status === 'granted') {
      console.log('✅ [Permission] Camera already granted');
      return true;
    }
    
    if (cameraPermission.canAskAgain) {
      console.log('📷 [Permission] Requesting camera permission...');
      const result = await requestCameraPermission();
      console.log('📷 [Permission] Request result:', result.status);
      return result.status === 'granted';
    }
    
    console.warn('⚠️ [Permission] Camera permission denied permanently');
    Alert.alert(
      'Permission Required',
      'Camera permission is required. Please enable it in Settings.',
      [{ text: 'OK' }]
    );
    return false;
  };

  /**
   * Check and request media library permission using hooks
   */
  const checkMediaLibraryPermission = async () => {
    console.log('🖼️ [Permission] Checking media library permission...');
    console.log('🖼️ [Permission] Current status:', mediaLibraryPermission?.status);
    
    if (Platform.OS === 'web') {
      return true;
    }
    
    if (!mediaLibraryPermission) {
      console.log('🖼️ [Permission] Permission object not ready');
      return false;
    }
    
    if (mediaLibraryPermission.status === 'granted') {
      console.log('✅ [Permission] Media library already granted');
      return true;
    }
    
    if (mediaLibraryPermission.canAskAgain) {
      console.log('🖼️ [Permission] Requesting media library permission...');
      const result = await requestMediaLibraryPermission();
      console.log('🖼️ [Permission] Request result:', result.status);
      return result.status === 'granted';
    }
    
    console.warn('⚠️ [Permission] Media library permission denied permanently');
    Alert.alert(
      'Permission Required',
      'Photo library permission is required. Please enable it in Settings.',
      [{ text: 'OK' }]
    );
    return false;
  };

  /**
   * Handles uploading and sending a file
   */
  const handleUploadAndSend = async (fileData, caption = '') => {
    console.log('📤 [Upload] Starting upload and send process...');
    console.log('📤 [Upload] File data:', {
      uri: fileData.uri?.substring(0, 50) + '...',
      name: fileData.name,
      type: fileData.type,
      hasUri: !!fileData.uri,
    });
    
    if (uploading || loading) {
      console.warn('⚠️ [Upload] Already uploading or loading, skipping');
      return;
    }
    
    try {
      setUploading(true);
      console.log('📤 [Upload] Calling uploadFile API...');
      
      // Upload file
      const uploadResponse = await uploadFile(fileData);
      console.log('✅ [Upload] Upload successful:', {
        hasData: !!uploadResponse.data,
        url: uploadResponse.data?.url?.substring(0, 50) + '...',
        type: uploadResponse.data?.type,
      });
      
      const attachmentData = uploadResponse.data;
      
      // Format attachment for message
      const attachment = {
        url: attachmentData.url,
        type: attachmentData.type,
        name: attachmentData.name,
        size: attachmentData.size || 0,
        publicId: attachmentData.publicId || null,
      };
      
      console.log('📨 [Upload] Sending message with attachment...');
      // Send message with attachment
      await onSendMessage(caption, [attachment]);
      
      console.log('✅ [Upload] Message sent successfully!');
      
      // Clear input if there was text
      if (caption) {
        setMessage('');
      }
      Keyboard.dismiss();
    } catch (error) {
      console.error('❌ [Upload] Error uploading and sending file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        status: error.status,
      });
      Alert.alert('Error', error.message || 'Failed to upload and send file.');
    } finally {
      setUploading(false);
      console.log('📤 [Upload] Upload process completed');
    }
  };

  /**
   * Handles picking image from camera
   */
  const handlePickImageFromCamera = async () => {
    console.log('📷 [Camera] Button pressed - opening camera');
    setShowAttachmentMenu(false);
    
    // Wait for modal to close
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('📷 [Camera] Checking camera permission...');
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      console.warn('📷 [Camera] Permission denied, aborting');
      return;
    }
    
    try {
      console.log('📷 [Camera] Launching camera with options...');
      
      // Use absolute minimal options for maximum Expo Go compatibility
      const options = {
        mediaTypes: 'images',
      };
      
      console.log('📷 [Camera] Minimal options:', options);
      
      console.log('📷 [Camera] Options:', JSON.stringify(options));
      
      console.log('📷 [Camera] Calling launchCameraAsync...');
      const resultPromise = ImagePicker.launchCameraAsync(options);
      console.log('📷 [Camera] Promise created, waiting for result...');
      
      // Add timeout wrapper to detect if it hangs
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Camera picker timeout after 30 seconds'));
        }, 30000);
      });
      
      const result = await Promise.race([resultPromise, timeoutPromise]);
      console.log('📷 [Camera] launchCameraAsync resolved!');
      
      console.log('📷 [Camera] Camera result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets,
        assetsLength: result.assets?.length || 0,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('📷 [Camera] Selected asset:', {
          uri: asset.uri?.substring(0, 50) + '...',
          fileName: asset.fileName,
          type: asset.type,
          width: asset.width,
          height: asset.height,
        });
        
        // Prepare file data for upload
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        };
        
        console.log('📷 [Camera] Prepared fileData:', {
          name: fileData.name,
          type: fileData.type,
          hasUri: !!fileData.uri,
        });
        
        // Upload and send with optional caption
        await handleUploadAndSend(fileData, message.trim());
      } else {
        console.log('📷 [Camera] User cancelled or no assets selected');
      }
    } catch (error) {
      console.error('❌ [Camera] Error picking image from camera:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // Handle simulator/device-specific errors
      if (error.message && error.message.includes('simulator')) {
        console.warn('📷 [Camera] Simulator detected - camera not available');
        Alert.alert('Camera Unavailable', 'Camera is not available on simulator. Please test on a physical device.');
      } else {
        Alert.alert('Error', `Failed to pick image from camera: ${error.message || 'Unknown error'}`);
      }
    }
  };

  /**
   * Handles picking image from gallery
   */
  const handlePickImageFromGallery = async () => {
    console.log('🖼️ [Gallery] Button pressed - opening gallery');
    
    // Close menu first and wait for modal to fully close
    setShowAttachmentMenu(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('🖼️ [Gallery] Checking media library permission...');
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      console.warn('🖼️ [Gallery] Permission denied, aborting');
      return;
    }
    
    try {
      // Check if ImagePicker is available
      console.log('🖼️ [Gallery] Checking ImagePicker availability...');
      console.log('🖼️ [Gallery] ImagePicker:', typeof ImagePicker);
      console.log('🖼️ [Gallery] launchImageLibraryAsync:', typeof ImagePicker?.launchImageLibraryAsync);
      
      if (!ImagePicker || !ImagePicker.launchImageLibraryAsync) {
        console.error('❌ [Gallery] ImagePicker.launchImageLibraryAsync is not available');
        Alert.alert('Error', 'Image picker is not available. Make sure expo-image-picker is properly installed.');
        return;
      }
      
      console.log('🖼️ [Gallery] ImagePicker available ✅');
      console.log('🖼️ [Gallery] Platform:', Platform.OS);
      
      // Use absolute minimal options for maximum Expo Go compatibility
      // In v17, just use string 'images' for mediaTypes
      const options = {
        mediaTypes: 'images',
      };
      
      console.log('🖼️ [Gallery] Minimal options:', JSON.stringify(options));
      console.log('🖼️ [Gallery] About to call launchImageLibraryAsync...');
      console.log('🖼️ [Gallery] Current timestamp:', Date.now());
      
      // Call it and log immediately after
      const resultPromise = ImagePicker.launchImageLibraryAsync(options);
      console.log('🖼️ [Gallery] Promise returned, awaiting result...');
      
      const result = await resultPromise;
      
      console.log('🖼️ [Gallery] ✅ launchImageLibraryAsync resolved at:', Date.now());
      
      console.log('🖼️ [Gallery] Gallery result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets,
        assetsLength: result.assets?.length || 0,
        fullResult: JSON.stringify(result, null, 2).substring(0, 200),
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('🖼️ [Gallery] Selected asset:', {
          uri: asset.uri?.substring(0, 50) + '...',
          fileName: asset.fileName,
          type: asset.type,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
        });
        
        // Prepare file data for upload
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || asset.type || 'image/jpeg',
        };
        
        console.log('🖼️ [Gallery] Prepared fileData:', {
          name: fileData.name,
          type: fileData.type,
          hasUri: !!fileData.uri,
        });
        
        // Upload and send with optional caption
        await handleUploadAndSend(fileData, message.trim());
      } else {
        console.log('🖼️ [Gallery] User cancelled or no assets selected');
      }
    } catch (error) {
      console.error('❌ [Gallery] Error picking image from gallery:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      });
      
      // More helpful error message
      let errorMessage = 'Failed to pick image from gallery.';
      if (error.message) {
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please grant photo library access in settings.';
        } else if (error.message.includes('undefined')) {
          errorMessage = 'Image picker error. Please restart the app and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Removed document picker - mobile only supports images

  /**
   * Handles attachment button press - shows menu
   */
  const handleAttach = () => {
    console.log('📎 [Attachment] Attachment button pressed - showing menu');
    setShowAttachmentMenu(true);
  };

  /**
   * Handles message send
   */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    // Validate message
    const validation = validateMessage(trimmedMessage);
    if (!validation.isValid || disabled || loading || uploading) {
      return;
    }
    
    try {
      // Send text message without attachments
      await onSendMessage(trimmedMessage, []);
      setMessage(''); // Clear input
      Keyboard.dismiss(); // Hide keyboard
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message.');
    }
  };
  
  const canSend = message.trim().length > 0 && !disabled && !loading && !uploading;
  const isProcessing = loading || uploading;
  
  /**
   * Emoji categories with full emoji list (system-like)
   */
  const emojiCategories = {
    'Smileys & People': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤐', '😌', '😔',
      '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '😎', '🤓', '🧐', '🤠', '😕', '😟', '🙁', '☹️', '😮',
      '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
      '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
      '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
      '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
    ],
    'Gestures & Body': [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌',
      '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
      '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋',
    ],
    'Hearts & Emotions': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    ],
    'Objects & Symbols': [
      '🔥', '💧', '⚡', '☄️', '❄️', '⭐', '🌟', '💫', '✨', '💥',
      '💢', '💯', '💢', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱',
      '🖲', '🕹', '🗜', '💾', '💿', '📀', '📼', '📷', '📸', '📹',
    ],
  };

  /**
   * Handles emoji button press - shows emoji picker
   */
  const handleEmoji = () => {
    setShowEmojiPicker(true);
  };

  /**
   * Handles emoji selection
   */
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Emoji Picker Modal - System-like */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Emoji</Text>
              <TouchableOpacity
                onPress={() => setShowEmojiPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={styles.emojiCategoryTabs}>
              {Object.keys(emojiCategories).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedEmojiCategory === category && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedEmojiCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedEmojiCategory === category && styles.categoryTabTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Emoji Grid - Scrollable */}
            <ScrollView
              style={styles.emojiScrollContainer}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            >
              {emojiCategories[selectedEmojiCategory]?.map((emoji, index) => (
                <View key={`${selectedEmojiCategory}-${index}`} style={styles.emojiItemWrapper}>
                  <TouchableOpacity
                    style={styles.emojiItem}
                    onPress={() => handleEmojiSelect(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePickImageFromCamera}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePickImageFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>Photo Library</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.inputContainer}>
        {/* Show attach (+) button when message is empty */}
        {!message.trim() && (
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttach}
            disabled={disabled || isProcessing}
            activeOpacity={0.7}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="add" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          multiline
          maxLength={1000}
          editable={!disabled && !isProcessing}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          textAlignVertical="center"
        />
        
        {/* Show send button only when there's content */}
        {message.trim() && (
          <TouchableOpacity
            style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={canSend ? COLORS.white : COLORS.gray400}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray900,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: SPACING.sm,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: TYPOGRAPHY.fontSize.base * 1.2,
  },
  iconButtonContainer: {
    marginRight: SPACING.xs,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  attachmentMenu: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray900,
  },
  emojiPickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 0,
    marginBottom: 0,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  emojiPickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  emojiCategoryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  categoryTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray600,
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emojiScrollContainer: {
    maxHeight: 300,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiItemWrapper: {
    width: '12.5%',
    aspectRatio: 1,
    padding: SPACING.xs / 2,
  },
  emojiItem: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  emojiText: {
    fontSize: 32,
  },
});

export default MessageInput;

