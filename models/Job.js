const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      trim: true
    },
    requirements: {
      type: [String],
      default: []
    },
    responsibilities: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time'
    },
    category: {
      type: String,
      trim: true,
      default: 'Technology'
    },
    experience: {
      type: String,
      trim: true
    },
    salary: {
      type: String,
      trim: true
    },
    openings: {
      type: Number,
      default: 1
    },
    deadline: {
      type: Date
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Job', jobSchema);
