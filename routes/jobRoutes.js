const express = require('express');
const router = express.Router();
const {
  createJob,
  getEmployerJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobs,
  getEmployerAnalytics
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobs);

// Protected routes - Employer only
router.post('/', protect, authorize('employer'), createJob);
router.get('/employer/my-jobs', protect, authorize('employer'), getEmployerJobs);
router.get('/analytics/stats', protect, authorize('employer'), getEmployerAnalytics);

// Dynamic routes (must come after specific routes)
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
