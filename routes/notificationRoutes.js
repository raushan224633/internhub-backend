const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get notifications and delete all
router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Single notification operations
router.route('/:id')
  .delete(deleteNotification);

// Mark as read
router.put('/:id/read', markAsRead);

module.exports = router;
