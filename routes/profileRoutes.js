const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getUserById
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All profile routes are protected
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/:id', protect, getUserById);

module.exports = router;
