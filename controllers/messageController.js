const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');
const { emitNewMessage } = require('../utils/socket');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, subject, message, relatedJob, attachments } = req.body;

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver,
      subject,
      message,
      relatedJob,
      attachments
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email avatar companyName')
      .populate('receiver', 'name email avatar')
      .populate('relatedJob', 'title company');

    // Create notification for receiver
    const senderName = req.user.companyName || req.user.name;
    await createNotification({
      recipient: receiver,
      sender: req.user.id,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName} sent you a message: ${subject}`,
      link: `/messages`,
      relatedMessage: newMessage._id,
      relatedJob: relatedJob || null
    });

    // Emit real-time message notification
    emitNewMessage(receiver.toString(), populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

// @desc    Get all messages (inbox & sent)
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { 
      type = 'inbox', 
      isRead, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};

    if (type === 'inbox') {
      query.receiver = req.user.id;
    } else if (type === 'sent') {
      query.sender = req.user.id;
    } else if (type === 'all') {
      query.$or = [
        { sender: req.user.id },
        { receiver: req.user.id }
      ];
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar companyName')
      .populate('receiver', 'name email avatar')
      .populate('relatedJob', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    // Get unread count
    const unreadCount = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// @desc    Get conversation with specific user
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name email avatar companyName')
      .populate('receiver', 'name email avatar')
      .populate('relatedJob', 'title company')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
};

// @desc    Get all conversations (list of users you've chatted with)
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching conversations for user:', userId);

    // Get all unique users who have exchanged messages
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            companyName: 1,
            role: 1
          },
          lastMessage: {
            message: 1,
            createdAt: 1,
            isRead: 1,
            subject: 1
          },
          unreadCount: 1
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    console.log('Found conversations:', conversations.length);
    console.log('Conversations data:', JSON.stringify(conversations, null, 2));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations: ' + error.message
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (
      message.sender.toString() !== req.user.id &&
      message.receiver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};
