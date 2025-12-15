const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { emitNotification } = require('../utils/socket');

// @desc    Create a notification (internal use)
// @access  Private
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name avatar companyName')
      .populate('relatedJob', 'title company')
      .populate('relatedApplication', 'status')
      .populate('relatedMessage', 'subject');

    // Emit real-time notification via socket
    emitNotification(notificationData.recipient.toString(), populatedNotification);

    return populatedNotification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { 
      isRead, 
      type,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { recipient: req.user.id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar companyName')
      .populate('relatedJob', 'title company')
      .populate('relatedApplication', 'status')
      .populate('relatedMessage', 'subject')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });

    res.json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to delete all notifications'
    });
  }
};

module.exports = {
  ...exports,
  createNotification
};
