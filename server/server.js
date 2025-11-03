/**
 * Main Server File
 * 
 * Sets up Express server with MongoDB and Socket.io
 * @module server
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/database.js';
import { setupSocketIO } from './socket/index.js';

// Import routes
import feedbackRoutes from './routes/feedback.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Get allowed origins from environment or defaults
const getAllowedOrigins = () => {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  return ['http://localhost:5173', 'http://localhost:19006' , 'http://192.168.100.38:3001'];
};

// For development, allow mobile connections more flexibly
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // In development, allow all origins (including mobile apps without origin header)
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked origin for debugging
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Initialize Socket.io with proper configuration for mobile
const io = new Server(httpServer, {
  cors: corsOptions,
  // Enable both transports
  transports: ['polling', 'websocket'],
  // Allow upgrades from polling to websocket
  allowUpgrades: true,
  // Ping timeout for mobile networks
  pingTimeout: 60000,
  pingInterval: 25000,
  // Connection state recovery
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Setup Socket.io handlers
setupSocketIO(io);

// Make io available to routes (if needed)
app.set('io', io);

// Middleware - CORS with mobile support
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Server configuration
const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    // Use '0.0.0.0' to listen on all network interfaces (allows mobile device connections)
    const HOST = process.env.HOST || '0.0.0.0';
    httpServer.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Socket.io ready`);
      console.log(`🌐 Allowed CORS origins: ${getAllowedOrigins().join(', ')}`);
      if (HOST === '0.0.0.0') {
        console.log(`📱 Mobile access: http://192.168.100.38:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server gracefully
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (termination signal)
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Process terminated');
  });
});

// Start the server
startServer();

