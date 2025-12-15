const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverLetter: {
      type: String,
      trim: true
    },
    resume: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    reviewedDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
applicationSchema.index({ job: 1, applicant: 1 });
applicationSchema.index({ employer: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
