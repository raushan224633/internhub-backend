const express = require('express');
const router = express.Router();

// Use mock service for development - replace with real geminiService once API is configured
const geminiService = require('../utils/mockGeminiService');
// const geminiService = require('../utils/geminiService'); // Uncomment when real API is ready

const { protect } = require('../middleware/auth');

// @desc    Get AI job suggestions based on job title
// @route   POST /api/ai/job-suggestions
// @access  Private
router.post('/job-suggestions', protect, async (req, res) => {
  try {
    const { jobTitle } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const suggestions = await geminiService.generateJobSuggestions(jobTitle);

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('AI job suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI suggestions'
    });
  }
});

// @desc    Enhance job description with AI
// @route   POST /api/ai/enhance-description
// @access  Private
router.post('/enhance-description', protect, async (req, res) => {
  try {
    const { description, jobTitle, company } = req.body;

    if (!description || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Description and job title are required'
      });
    }

    const enhancedDescription = await geminiService.enhanceJobDescription(
      description, 
      jobTitle, 
      company || 'the company'
    );

    res.json({
      success: true,
      data: {
        enhancedDescription
      }
    });

  } catch (error) {
    console.error('Enhance description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enhance description'
    });
  }
});

// @desc    Get skill suggestions based on job title and description
// @route   POST /api/ai/suggest-skills
// @access  Private
router.post('/suggest-skills', protect, async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const skillSuggestions = await geminiService.suggestSkills(jobTitle, jobDescription);

    res.json({
      success: true,
      data: skillSuggestions
    });

  } catch (error) {
    console.error('Skill suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate skill suggestions'
    });
  }
});

// @desc    Generate requirements based on job details
// @route   POST /api/ai/generate-requirements
// @access  Private
router.post('/generate-requirements', protect, async (req, res) => {
  try {
    const { jobTitle, experienceLevel, skills } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const requirements = await geminiService.generateRequirements(
      jobTitle, 
      experienceLevel || 'Entry Level', 
      skills || []
    );

    res.json({
      success: true,
      data: requirements
    });

  } catch (error) {
    console.error('Generate requirements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate requirements'
    });
  }
});

// @desc    Analyze job posting for completeness and suggestions
// @route   POST /api/ai/analyze-posting
// @access  Private
router.post('/analyze-posting', protect, async (req, res) => {
  try {
    const { jobData } = req.body;

    if (!jobData) {
      return res.status(400).json({
        success: false,
        message: 'Job data is required'
      });
    }

    const analysis = await geminiService.analyzeJobPosting(jobData);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Analyze posting error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze job posting'
    });
  }
});

// @desc    Generate interview questions for the job
// @route   POST /api/ai/interview-questions
// @access  Private
router.post('/interview-questions', protect, async (req, res) => {
  try {
    const { jobTitle, skills, experienceLevel } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const questions = await geminiService.generateInterviewQuestions(
      jobTitle, 
      skills || [], 
      experienceLevel || ''
    );

    res.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate interview questions'
    });
  }
});

// @desc    Get smart suggestions while typing (real-time)
// @route   POST /api/ai/smart-suggestions
// @access  Private
router.post('/smart-suggestions', protect, async (req, res) => {
  try {
    const { field, value, context } = req.body;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: 'Field and value are required'
      });
    }

    let suggestions = [];

    switch (field) {
      case 'title':
        // Generate quick job suggestions based on partial title
        if (value.length >= 3) {
          const quickSuggestions = await geminiService.generateJobSuggestions(value);
          suggestions = quickSuggestions.requiredSkills?.slice(0, 5) || [];
        }
        break;
      
      case 'skills':
        // Generate skill suggestions based on current skills and job title
        if (context?.jobTitle && value.length >= 2) {
          const skillSuggestions = await geminiService.suggestSkills(context.jobTitle, context.description);
          const allSkills = [
            ...(skillSuggestions.technicalSkills || []),
            ...(skillSuggestions.tools || []),
            ...(skillSuggestions.frameworks || [])
          ];
          suggestions = allSkills.filter(skill => 
            skill.toLowerCase().includes(value.toLowerCase())
          ).slice(0, 8);
        }
        break;
      
      default:
        suggestions = [];
    }

    res.json({
      success: true,
      data: {
        suggestions,
        field,
        value
      }
    });

  } catch (error) {
    console.error('Smart suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate smart suggestions'
    });
  }
});

module.exports = router;