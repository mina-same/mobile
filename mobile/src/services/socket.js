/**
 * Socket.io Client Setup
 * 
 * Configures Socket.io client connection for real-time updates
 * @module services/socket
 */

import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Helper to get socket URL
const getSocketURL = () => {
  // Debug: Log all environment variables (for troubleshooting)
  if (__DEV__) {
    console.log('🔍 Environment variables check:');
    console.log('  EXPO_PUBLIC_SOCKET_URL:', process.env.EXPO_PUBLIC_SOCKET_URL);
    console.log('  EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('  All EXPO_PUBLIC_ vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_')));
  }

  // Priority: EXPO_PUBLIC_SOCKET_URL > EXPO_PUBLIC_API_URL > default
  const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL;
  
  if (socketUrl) {
    console.log('✅ Using Socket URL from environment:', socketUrl);
    return socketUrl;
  }

  // For mobile devices (not emulator), localhost won't work
  // Need to use computer's IP address
  if (Platform.OS !== 'web') {
    console.warn('⚠️ Socket URL not configured. Please set EXPO_PUBLIC_SOCKET_URL with your computer\'s IP address (e.g., http://192.168.1.xxx:3001)');
    console.warn('   The .env file should contain: EXPO_PUBLIC_SOCKET_URL=http://192.168.100.38:3001');
    console.warn('   Restart Expo with: expo start --clear');
  }

  // Default fallback (will only work on simulator/emulator or same machine)
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketURL();

// Log the URL being used (for debugging)
if (__DEV__) {
  console.log('🔗 Socket.IO URL:', SOCKET_URL);
  if (SOCKET_URL.includes('localhost') && Platform.OS !== 'web') {
    console.error('❌ ERROR: Using localhost - this will NOT work on physical devices!');
    console.error('   Solution:');
    console.error('   1. Make sure .env file exists in mobile/ folder');
    console.error('   2. Restart Expo: expo start --clear');
    console.error('   3. Check .env contains: EXPO_PUBLIC_SOCKET_URL=http://192.168.100.38:3001');
  }
}

/**
 * Create Socket.io client instance
 * 
 * @returns {Socket} Socket.io client instance
 */
export const createSocket = () => {
  const socket = io(SOCKET_URL, {
    // For mobile/React Native: polling first, then upgrade to websocket
    // Polling is more reliable on mobile networks and works better with React Native
    transports: ['polling', 'websocket'],
    // Enable reconnection
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    // Timeout configuration (increased for mobile networks)
    timeout: 20000,
    // Auto connect
    autoConnect: true,
    // Force new connection if needed
    forceNew: false,
    // Allow upgrade from polling to websocket
    upgrade: true,
    // Additional options for mobile compatibility
    rememberUpgrade: false,
    // For React Native, ensure proper JSON parsing
    forceBase64: false,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Disconnected from Socket.io server');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.io connection error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      description: error.description,
    });
    
    // Helpful error messages for common mobile issues
    if (error.message?.includes('xhr poll error') || error.message?.includes('polling')) {
      console.error('⚠️ XHR Poll Error - Cannot reach server');
      if (SOCKET_URL.includes('localhost')) {
        console.error('❌ Problem: localhost doesn\'t work on physical devices!');
        console.error('✅ Solution: Set EXPO_PUBLIC_SOCKET_URL=http://YOUR_COMPUTER_IP:3001');
        console.error('   Find your IP address:');
        console.error('   - Mac: System Preferences > Network');
        console.error('   - Windows: ipconfig in CMD');
        console.error('   - Linux: ip addr or ifconfig');
      } else {
        console.error('⚠️ Check:');
        console.error('   1. Server is running on port 3001');
        console.error('   2. Device and computer are on same WiFi network');
        console.error('   3. Firewall allows connections on port 3001');
        console.error('   4. CORS_ORIGIN includes your device IP');
      }
    } else if (error.message?.includes('websocket')) {
      console.warn('⚠️ WebSocket error detected. Socket.IO will try polling transport.');
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconnected to Socket.io server (attempt ${attemptNumber})`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ Socket.io reconnection error:', error);
    console.error('Reconnection error details:', {
      message: error.message,
      type: error.type,
    });
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Socket.io reconnection failed after all attempts');
  });

  // Additional error event for engine.io errors
  socket.io.on('error', (error) => {
    console.error('❌ Socket.io engine error:', error);
  });

  // Log transport upgrades
  socket.io.on('upgrade', () => {
    console.log('⬆️ Transport upgraded to websocket');
  });

  socket.io.on('upgradeError', (error) => {
    console.warn('⚠️ Transport upgrade error (will continue with polling):', error);
  });

  return socket;
};

/**
 * Singleton Socket.io instance
 * Reuses the same connection across the application
 */
let socketInstance = null;

/**
 * Get Socket.io instance (singleton)
 * 
 * @returns {Socket} Socket.io client instance
 */
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = createSocket();
  }
  return socketInstance;
};

/**
 * Disconnect Socket.io client
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default getSocket;

