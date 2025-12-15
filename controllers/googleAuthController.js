const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client with client ID only
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId, accessToken } = req.body;
    
    // Debug logging to see what we're receiving
    console.log('Received tokenId:', tokenId);
    console.log('Received accessToken:', accessToken);
    console.log('Token length:', tokenId?.length);

    let payload;

    // Verify Google ID token using Google's tokeninfo endpoint
    if (tokenId) {
      try {
        const axios = require('axios');
        // Verify as an ID token
        const tokenInfoResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`);
        payload = tokenInfoResponse.data;
        
        // Verify that the token is valid and issued to our client
        if (payload.aud && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({
            success: false,
            message: 'Token audience mismatch'
          });
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({
          success: false,
          message: 'Google token verification failed'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists, update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
      
      // Check if user has selected a role
      if (!user.role || user.role === 'pending') {
        // User needs to select a role
        return res.status(200).json({
          success: true,
          message: 'Role selection required',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            roleSelectionRequired: true
          }
        });
      }
      
      // Generate token with role
      const token = await generateToken(user._id);
      
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          companyName: user.companyName,
          avatar: user.avatar,
          token
        }
      });
    } else {
      // Check if user exists with email
      user = await User.findOne({ email });
      
      if (user) {
        // User exists with email, link Google account
        user.googleId = googleId;
        user.avatar = avatar;
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });
        
        // Check if user has selected a role
        if (!user.role || user.role === 'pending') {
          // User needs to select a role
          return res.status(200).json({
            success: true,
            message: 'Role selection required',
            data: {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              roleSelectionRequired: true
            }
          });
        }
        
        // Generate token with role
        const token = await generateToken(user._id);
        
        res.status(200).json({
          success: true,
          message: 'Authentication successful',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            companyName: user.companyName,
            avatar: user.avatar,
            token
          }
        });
      } else {
        // New user, create account with pending role
        // For Google OAuth users, we don't require a password
        const userData = {
          name,
          email,
          googleId,
          avatar,
          role: 'pending', // Set role as pending until user selects
          isActive: true
        };

        user = await User.create(userData);
        
        // Return response indicating role selection is required
        return res.status(200).json({
          success: true,
          message: 'Role selection required',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            roleSelectionRequired: true
          }
        });
      }
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    // Check if it's a known error type
    if (error.name === 'TypeError' && error.message.includes('MODULE_NOT_FOUND')) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.',
        error: 'Missing required dependencies'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error with Google authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Set user role after Google OAuth
// @route   POST /api/auth/google/set-role
// @access  Public (but requires valid user ID from previous step)
exports.setRole = async (req, res) => {
  try {
    const { userId, role, companyName } = req.body;
    
    // Validate role
    if (!['intern', 'employer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "intern" or "employer"'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already has a role (prevent role changes without admin approval)
    if (user.role && user.role !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Role already set. Contact admin to change role.'
      });
    }
    
    // Update user with selected role
    user.role = role;
    
    // If employer, set company name
    if (role === 'employer' && companyName) {
      user.companyName = companyName;
    }
    
    await user.save();
    
    // Generate token with role
    const token = await generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Role set successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        avatar: user.avatar,
        token
      }
    });
  } catch (error) {
    console.error('Set Role Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting user role',
      error: error.message
    });
  }
};