const mongoose = require('mongoose');

const employeeSpotlightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['Sales', 'Engineering', 'Support', 'Marketing', 'Leadership', 'Operations'],
    required: true,
    index: true
  },
  bio: {
    type: String,
    maxlength: 300
  },
  imageUrl: String,
  featuredRole: {
    type: String,
    enum: ['author', 'moderator', 'ambassador', 'partner'],
    required: true
  },
  category: {
    type: String,
    enum: ['leadership', 'content', 'support', 'partnership'],
    required: true,
    index: true
  },
  featuredUntil: {
    type: Date,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  articleCount: {
    type: Number,
    default: 0
  },
  helpfulComments: {
    type: Number,
    default: 0
  },
  moderationActions: {
    type: Number,
    default: 0
  },
  stats: {
    articlesWritten: Number,
    communityHelpful: Number,
    moderationActions: Number,
    communityLikes: Number
  },
  socialLinks: {
    twitter: String,
    linkedin: String,
    website: String
  },
  pinnedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for active employees
employeeSpotlightSchema.index({ isActive: 1, featuredUntil: 1 });
employeeSpotlightSchema.index({ department: 1, createdAt: -1 });

module.exports = mongoose.model('EmployeeSpotlight', employeeSpotlightSchema);
