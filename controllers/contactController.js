const Message = require('../models/Message');
const User = require('../models/User');
const { sendContactFormEmail, sendContactFormAutoReply } = require('../utils/emailService');

// @desc    Send contact/support message
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find admin/support user to receive messages
    // You can modify this to send to a specific support email or create a support user
    const adminUser = await User.findOne({ role: 'employer' }).sort({ createdAt: 1 }).limit(1);
    
    if (!adminUser) {
      // If no admin found, still save the message but log it
      console.log('Contact form submission:', { name, email, subject, message });
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: {
          name,
          email,
          subject,
          sentAt: new Date()
        }
      });
    }

    // Create a message record
    const contactMessage = await Message.create({
      sender: adminUser._id, // Using admin as placeholder
      receiver: adminUser._id, // Sending to admin
      subject: `Contact Form: ${subject}`,
      message: `
From: ${name}
Email: ${email}

Message:
${message}
      `,
      isContactForm: true,
      contactFormData: {
        name,
        email,
        subject,
        message
      }
    });

    // Log for admin notification
    console.log('New contact form submission:', {
      id: contactMessage._id,
      name,
      email,
      subject
    });

    // Send email notification to admin (non-blocking)
    sendContactFormEmail({ name, email, subject, message })
      .then(result => {
        if (result.success) {
          console.log('✅ Admin notification email sent successfully');
        } else {
          console.log('⚠️  Admin email not sent:', result.message);
        }
      })
      .catch(err => console.error('Email error:', err.message));

    // Send auto-reply to user (non-blocking)
    sendContactFormAutoReply({ name, email, subject })
      .then(result => {
        if (result.success) {
          console.log('✅ Auto-reply sent to user');
        }
      })
      .catch(err => console.error('Auto-reply error:', err.message));

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contactMessage._id,
        name,
        email,
        subject,
        sentAt: contactMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact messages (admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await Message.find({ isContactForm: true })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages'
    });
  }
};
