const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  profileImage: {
    type: String,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  country: {
    type: String,
    default: 'United States'
  },
  state: {
    type: String,
    default: ''
  },
  storeInfo: {
    storeName: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    }
  },
  favoriteArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  resetUsernameToken: {
    type: String,
    default: null
  },
  resetUsernameExpires: {
    type: Date,
    default: null
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Method to generate username reset token
userSchema.methods.generateUsernameResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetUsernameToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetUsernameExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Method to check if user is following another user
userSchema.methods.isFollowing = function(userId) {
  return this.following.includes(userId);
};

// Method to check if user is blocked
userSchema.methods.isBlockedBy = function(userId) {
  return this.blockedUsers.includes(userId);
};

// Method to get public profile data
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    bio: this.bio,
    profileImage: this.profileImage,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    isPublic: this.isPublic,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
