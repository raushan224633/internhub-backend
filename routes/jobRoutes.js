const express = require('express');
const router = express.Router();
const {
  createJob,
  getEmployerinternship,
  getJobById,
  updateJob,
  deleteJob,
  getAllinternship,
  getEmployerAnalytics,
  getVideoStatus,
  getValidLocations
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllinternship);
router.get('/locations/list', getValidLocations);

// Protected routes - Employer only
router.post('/', protect, authorize('employer'), createJob);
router.get('/employer/my-internship', protect, authorize('employer'), getEmployerinternship);
router.get('/analytics/stats', protect, authorize('employer'), getEmployerAnalytics);

// Dynamic routes (must come after specific routes)
router.get('/:id', getJobById);
router.get('/:id/video-status', getVideoStatus);
router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
