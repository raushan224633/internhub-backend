// Utility file to avoid circular dependencies with socket.io emit functions

let ioInstance = null;

// Initialize the io instance
const initializeIO = (io) => {
  ioInstance = io;
};

// Function to emit analytics update to employer
const emitAnalyticsUpdate = (employerId, data) => {
  if (ioInstance) {
    ioInstance.to(`employer-${employerId}`).emit('analytics-update', data);
  }
};

// Function to emit notification to a user
const emitNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user-${userId}`).emit('notification', notification);
  }
};

// Function to emit new message notification
const emitNewMessage = (userId, message) => {
  if (ioInstance) {
    ioInstance.to(`user-${userId}`).emit('new-message', message);
  }
};

module.exports = {
  initializeIO,
  emitAnalyticsUpdate,
  emitNotification,
  emitNewMessage
};