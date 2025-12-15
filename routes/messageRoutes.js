const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All message routes are protected
router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getConversation);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
