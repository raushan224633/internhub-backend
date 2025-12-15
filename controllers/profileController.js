const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      bio,
      avatar,
      companyName,
      companyWebsite,
      companyDescription,
      skills,
      education,
      resume,
      linkedIn,
      github,
      portfolio
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update common fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    // Update optional fields
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (linkedIn !== undefined) user.linkedIn = linkedIn;
    if (github !== undefined) user.github = github;
    if (portfolio !== undefined) user.portfolio = portfolio;

    // Update employer specific fields
    if (user.role === 'employer') {
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;
      if (companyDescription) user.companyDescription = companyDescription;
    }

    // Update intern specific fields
    if (user.role === 'intern') {
      if (skills) user.skills = Array.isArray(skills) ? skills : [skills];
      if (education) {
        // Ensure education is an array of objects
        if (Array.isArray(education)) {
          user.education = education;
        } else if (typeof education === 'string') {
          // If education is a string, convert it to proper format
          user.education = [{
            degree: education,
            institution: '',
            field: '',
            startDate: null,
            endDate: null,
            current: false
          }];
        } else if (typeof education === 'object') {
          user.education = [education];
        }
      }
      if (resume) user.resume = resume;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/profile/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};
