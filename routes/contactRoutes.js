const express = require('express');
const router = express.Router();
const {
  sendContactMessage,
  getContactMessages
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route - anyone can send contact message
router.post('/', sendContactMessage);

// Protected route - get all contact messages (admin)
router.get('/', protect, getContactMessages);

module.exports = router;
