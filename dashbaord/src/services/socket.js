/**
 * Socket.io Client Setup
 * 
 * Configures Socket.io client connection for real-time updates
 * @module services/socket
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Create Socket.io client instance
 * 
 * @returns {Socket} Socket.io client instance
 */
export const createSocket = () => {
  const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Disconnected from Socket.io server');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.io connection error:', error);
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

