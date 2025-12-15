const express = require('express');
const router = express.Router();
const {
  getInternDashboardStats,
  getEmployerDashboardStats,
  getActivityStats
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Intern dashboard routes
router.get('/intern/stats', protect, authorize('intern'), getInternDashboardStats);

// Employer dashboard routes
router.get('/employer/stats', protect, authorize('employer'), getEmployerDashboardStats);

// Activity stats (both roles)
router.get('/activity', protect, getActivityStats);

module.exports = router;
