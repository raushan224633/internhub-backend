const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const { initializeIO } = require('./utils/socket'); // Import socket utility

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://internshell.com',
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ats', require('./routes/atsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to materially  API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      messages: '/api/messages',
      profile: '/api/profile',
      ats: '/api/ats',
      notifications: '/api/notifications',
      documentation: 'Coming soon...'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 materially  Backend Server                        ║
║                                                       ║
║   ✓ Server running on port ${PORT}                      ║
║   ✓ Environment: ${process.env.NODE_ENV}                        ║
║   ✓ Database: MongoDB                                ║
║                                                       ║
║   📡 API Endpoints:                                   ║
║   → http://localhost:${PORT}                            ║
║   → http://localhost:${PORT}/api/health                 ║
║   → http://localhost:${PORT}/api/auth                   ║
║   → http://localhost:${PORT}/api/jobs                   ║
║   → http://localhost:${PORT}/api/applications           ║
║   → http://localhost:${PORT}/api/messages               ║
║   → http://localhost:${PORT}/api/profile                ║
║   → http://localhost:${PORT}/api/ats                    ║
║   → http://localhost:${PORT}/api/notifications          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

// Initialize the socket utility with the io instance
initializeIO(io);

// Store connected clients
const connectedClients = new Map();

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);
  
  // Handle user authentication for notifications and messages
  socket.on('user-auth', (data) => {
    const { userId } = data;
    if (userId) {
      connectedClients.set(socket.id, userId);
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} authenticated and joined room`);
    }
  });
  
  // Handle employer authentication (backward compatibility)
  socket.on('employer-auth', (data) => {
    const { employerId } = data;
    if (employerId) {
      connectedClients.set(socket.id, employerId);
      socket.join(`employer-${employerId}`);
      socket.join(`user-${employerId}`); // Also join user room for notifications
      console.log(`🏢 Employer ${employerId} authenticated and joined rooms`);
    }
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    console.log(`📴 Client disconnected: ${socket.id}`);
  });
});

// Function to emit analytics update to employer (deprecated - use utils/socket.js instead)
const emitAnalyticsUpdate = (employerId, data) => {
  console.warn('⚠️  Using deprecated emitAnalyticsUpdate from server.js. Use utils/socket.js instead.');
  io.to(`employer-${employerId}`).emit('analytics-update', data);
};

// Export io for use in other modules
module.exports = { app, server, io, emitAnalyticsUpdate };

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});