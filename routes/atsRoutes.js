const express = require('express');
const multer = require('multer');
const path = require('path');
const { checkATSCompatibility } = require('../controllers/atsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store uploaded files temporarily
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDF and Word documents
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// @desc    Check resume for ATS compatibility
// @route   POST /api/ats/check
// @access  Private (Intern)
router.post(
  '/check', 
  protect, 
  authorize('intern'),
  (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // Multer error occurred when uploading
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        // Unknown error occurred when uploading
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      // Everything went fine
      next();
    });
  },
  checkATSCompatibility
);

module.exports = router;