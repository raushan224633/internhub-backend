const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get intern dashboard stats
// @route   GET /api/dashboard/intern/stats
// @access  Private (Intern)
exports.getInternDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total applications
    const totalApplications = await Application.countDocuments({
      applicant: userId
    });

    // Get applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $match: { applicant: userId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object for easier access
    const statusCounts = {};
    applicationsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // Get recent applications (last 10)
    const recentApplications = await Application.find({
      applicant: userId
    })
      .populate('job', 'title company location jobType stipend')
      .populate('employer', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get application stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applicationStats = await Application.aggregate([
      {
        $match: {
          applicant: userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get total jobs available
    const totalJobsAvailable = await Job.countDocuments({
      status: 'open'
    });

    // Get user profile completion
    const userProfile = await User.findById(userId);
    let profileCompletion = 0;
    if (userProfile) {
      const fields = ['name', 'email', 'phone', 'skills', 'education', 'resume'];
      const filledFields = fields.filter(field => userProfile[field] && userProfile[field] !== '');
      profileCompletion = Math.round((filledFields.length / fields.length) * 100);
    }

    // Get unread messages count
    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    // Get shortlisted applications
    const shortlistedCount = await Application.countDocuments({
      applicant: userId,
      status: 'shortlisted'
    });

    // Get interview scheduled count
    const interviewCount = await Application.countDocuments({
      applicant: userId,
      status: 'interview_scheduled'
    });

    // Get profile views (if tracking is implemented)
    // Note: profileViews and resumeViews may need to be added to User model
    const profileViews = userProfile?.profileViews || 0;
    const resumeViews = userProfile?.resumeViews || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalApplications,
          shortlisted: shortlistedCount,
          interviewScheduled: interviewCount,
          pendingApplications: statusCounts['pending'] || 0,
          totalJobsAvailable,
          profileViews,
          resumeViews,
          unreadMessages,
          profileCompletion
        },
        statusBreakdown: statusCounts,
        recentApplications,
        applicationTrend: applicationStats
      }
    });
  } catch (error) {
    console.error('Get intern dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get employer dashboard stats
// @route   GET /api/dashboard/employer/stats
// @access  Private (Employer)
exports.getEmployerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get employer's jobs
    const totalJobs = await Job.countDocuments({
      employer: userId
    });

    const activeJobs = await Job.countDocuments({
      employer: userId,
      status: 'open'
    });

    const closedJobs = await Job.countDocuments({
      employer: userId,
      status: 'closed'
    });

    // Get total applications for employer's jobs
    const applications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.employer': userId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationCounts = {};
    applications.forEach(item => {
      applicationCounts[item._id] = item.count;
    });

    const totalApplications = applications.reduce((sum, item) => sum + item.count, 0);

    // Get recent applications
    const recentApplications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.employer': userId
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicant',
          foreignField: '_id',
          as: 'applicantData'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          jobData: { $arrayElemAt: ['$jobData', 0] },
          applicantData: { $arrayElemAt: ['$applicantData', 0] }
        }
      }
    ]);

    // Get application trend for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applicationTrend = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.employer': userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          closedJobs,
          totalApplications,
          approved: applicationCounts['approved'] || 0,
          rejected: applicationCounts['rejected'] || 0,
          shortlisted: applicationCounts['shortlisted'] || 0,
          pending: applicationCounts['pending'] || 0,
          interviewScheduled: applicationCounts['interview_scheduled'] || 0
        },
        recentApplications,
        applicationTrend
      }
    });
  } catch (error) {
    console.error('Get employer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get activity stats
// @route   GET /api/dashboard/activity
// @access  Private
exports.getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let activities = {};

    if (user.role === 'intern') {
      // Intern activities
      activities.applicationsToday = await Application.countDocuments({
        applicant: userId,
        createdAt: { $gte: today, $lt: tomorrow }
      });

      activities.messagesReceived = await Message.countDocuments({
        receiver: userId,
        createdAt: { $gte: today, $lt: tomorrow }
      });
    } else if (user.role === 'employer') {
      // Employer activities
      const jobs = await Job.find({ employer: userId }, '_id');
      const jobIds = jobs.map(j => j._id);

      activities.applicationsReceived = await Application.countDocuments({
        job: { $in: jobIds },
        createdAt: { $gte: today, $lt: tomorrow }
      });

      activities.messagesSent = await Message.countDocuments({
        sender: userId,
        createdAt: { $gte: today, $lt: tomorrow }
      });
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};
