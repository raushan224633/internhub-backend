const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'application_status',
        'new_message',
        'new_application',
        'application_accepted',
        'application_rejected',
        'application_shortlisted',
        'job_posted',
        'other'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    relatedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
