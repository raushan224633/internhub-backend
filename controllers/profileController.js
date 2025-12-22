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

// @desc    Save resume data
// @route   PUT /api/profile/resume
// @access  Private
exports.saveResumeData = async (req, res) => {
  try {
    const { formData, skills, educations, experiences, projects, selectedTemplate } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update resumeData
    user.resumeData = {
      formData: formData || {},
      skills: skills || [],
      educations: educations || [],
      experiences: experiences || [],
      projects: projects || [],
      selectedTemplate: selectedTemplate || 1
    };

    // Also update profile fields if they match
    if (formData) {
      if (formData.fullName && formData.fullName !== user.name) {
        user.name = formData.fullName;
      }
      if (formData.email && formData.email !== user.email) {
        user.email = formData.email;
      }
      if (formData.phone && formData.phone !== user.phone) {
        user.phone = formData.phone;
      }
      if (formData.location && formData.location !== user.location) {
        user.location = formData.location;
      }
      if (formData.profileImage && formData.profileImage !== user.avatar) {
        user.avatar = formData.profileImage;
      }
      if (formData.linkedIn !== undefined) user.linkedIn = formData.linkedIn;
      if (formData.github !== undefined) user.github = formData.github;
      if (formData.portfolio !== undefined) user.portfolio = formData.portfolio;
      if (formData.summary !== undefined) user.bio = formData.summary;
    }

    // Update skills
    if (skills && skills.length > 0) {
      user.skills = skills;
    }

    // Update education if provided
    if (educations && educations.length > 0) {
      user.education = educations.map(edu => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate ? new Date(edu.startDate) : null,
        endDate: edu.endDate ? new Date(edu.endDate) : null,
        current: edu.current || false
      }));
    }

    await user.save();

    res.json({
      success: true,
      message: 'Resume saved successfully',
      data: user.resumeData
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to save resume'
    });
  }
};

// @desc    Get resume data
// @route   GET /api/profile/resume
// @access  Private
exports.getResumeData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeData');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.resumeData || null
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume data'
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
