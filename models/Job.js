const mongoose = require('mongoose');

// List of valid Indian cities for location dropdown
const VALID_LOCATIONS = [
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Jaipur, Rajasthan',
  'Surat, Gujarat',
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Indore, Madhya Pradesh',
  'Thane, Maharashtra',
  'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Pimpri-Chinchwad, Maharashtra',
  'Patna, Bihar',
  'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh',
  'Ludhiana, Punjab',
  'Agra, Uttar Pradesh',
  'Nashik, Maharashtra',
  'Faridabad, Haryana',
  'Meerut, Uttar Pradesh',
  'Rajkot, Gujarat',
  'Varanasi, Uttar Pradesh',
  'Srinagar, Jammu and Kashmir',
  'Aurangabad, Maharashtra',
  'Dhanbad, Jharkhand',
  'Amritsar, Punjab',
  'Navi Mumbai, Maharashtra',
  'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand',
  'Howrah, West Bengal',
  'Coimbatore, Tamil Nadu',
  'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh',
  'Jodhpur, Rajasthan',
  'Madurai, Tamil Nadu',
  'Raipur, Chhattisgarh',
  'Kota, Rajasthan',
  'Chandigarh',
  'Guwahati, Assam',
  'Remote',
  'Work from Home'
];

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
      trim: true,
      validate: {
        validator: function(v) {
          // Allow any value for backward compatibility, but recommend from the list
          return true;
        },
        message: 'Please select a valid location'
      }
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
    },
    videoUrl: {
      type: String,
      default: null
    },
    videoStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    videoId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
jobSchema.index({ location: 1, status: 1, createdAt: -1 });
jobSchema.index({ employer: 1, status: 1 });

// Static method to get valid locations
jobSchema.statics.getValidLocations = function() {
  return VALID_LOCATIONS;
};

// Virtual property to check if job has expired
jobSchema.virtual('isExpired').get(function() {
  return this.deadline && new Date() > this.deadline;
});

// Method to format salary for display (if stored as numeric range)
jobSchema.methods.getFormattedSalary = function() {
  if (!this.salary) return 'Not specified';
  return this.salary;
};

module.exports = mongoose.model('Job', jobSchema);
