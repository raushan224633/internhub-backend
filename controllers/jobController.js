const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const mongoose = require('mongoose');
const { emitAnalyticsUpdate } = require('../utils/socket'); // Import emit function from utils

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employer: req.user.id
    };

    const job = await Job.create(jobData);

    // Emit real-time update to employer
    emitAnalyticsUpdate(req.user.id.toString(), {
      type: 'new_job',
      jobId: job._id
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create job posting'
    });
  }
};

// @desc    Get all jobs by employer
// @route   GET /api/jobs/employer
// @access  Private (Employer)
exports.getEmployerJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { employer: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('applicants', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        const pendingCount = await Application.countDocuments({ 
          job: job._id, 
          status: 'pending' 
        });
        const shortlistedCount = await Application.countDocuments({ 
          job: job._id, 
          status: 'shortlisted' 
        });

        return {
          ...job.toObject(),
          stats: {
            totalApplications: applicationCount,
            pending: pendingCount,
            shortlisted: shortlistedCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: jobsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email companyName companyWebsite')
      .populate('applicants', 'name email skills');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Emit real-time update to employer
    emitAnalyticsUpdate(req.user.id.toString(), {
      type: 'job_updated',
      jobId: job._id
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update job'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    // Delete all related applications
    await Application.deleteMany({ job: req.params.id });

    // Emit real-time update to employer
    emitAnalyticsUpdate(req.user.id.toString(), {
      type: 'job_deleted',
      jobId: req.params.id
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

// @desc    Get all active jobs (Public)
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      location, 
      jobType, 
      skills 
    } = req.query;

    const query = { status: 'active', isActive: true };

    // Search by title or company
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('employer', 'name companyName companyWebsite')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// @desc    Get employer analytics
// @route   GET /api/jobs/analytics/stats
// @access  Private (Employer)
exports.getEmployerAnalytics = async (req, res) => {
  try {
    const employerId = req.user.id;

    // Total jobs
    const totalJobs = await Job.countDocuments({ employer: employerId });
    const activeJobs = await Job.countDocuments({ 
      employer: employerId, 
      status: 'active' 
    });
    const closedJobs = await Job.countDocuments({ 
      employer: employerId, 
      status: 'closed' 
    });

    // Total applications
    const totalApplications = await Application.countDocuments({ 
      employer: employerId 
    });
    const pendingApplications = await Application.countDocuments({ 
      employer: employerId, 
      status: 'pending' 
    });
    const shortlistedApplications = await Application.countDocuments({ 
      employer: employerId, 
      status: 'shortlisted' 
    });
    const rejectedApplications = await Application.countDocuments({ 
      employer: employerId, 
      status: 'rejected' 
    });
    const acceptedApplications = await Application.countDocuments({ 
      employer: employerId, 
      status: 'accepted' 
    });

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplicationsCount = await Application.countDocuments({
      employer: employerId,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get recent applications list with details for chart
    const recentApplicationsList = await Application.find({
      employer: employerId,
      createdAt: { $gte: sevenDaysAgo }
    }).select('createdAt status').sort({ createdAt: -1 });

    // Top performing jobs
    const topJobs = await Application.aggregate([
      { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
      { 
        $group: { 
          _id: '$job', 
          applicationCount: { $sum: 1 } 
        } 
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      { $unwind: '$jobDetails' },
      {
        $project: {
          title: '$jobDetails.title',
          applicationCount: 1
        }
      }
    ]);

    // Applications trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationsTrend = await Application.aggregate([
      { 
        $match: { 
          employer: new mongoose.Types.ObjectId(employerId),
          createdAt: { $gte: thirtyDaysAgo }
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
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          shortlisted: shortlistedApplications,
          rejected: rejectedApplications,
          accepted: acceptedApplications,
          recent: recentApplicationsCount
        },
        recentApplications: recentApplicationsList,
        topJobs,
        applicationsTrend
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};