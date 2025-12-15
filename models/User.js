const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ['intern', 'employer', 'admin', 'pending'],
      default: 'pending'
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    linkedIn: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Intern specific fields
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean
      }
    ],
    skills: [String],
    resume: {
      type: String,
      default: ''
    },
    // Employer specific fields
    companyName: {
      type: String,
      trim: true
    },
    companyWebsite: {
      type: String,
      trim: true
    },
    companyDescription: {
      type: String,
      trim: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's provided and modified
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);