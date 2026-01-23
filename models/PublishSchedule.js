const mongoose = require('mongoose');

const publishScheduleSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    unique: true,
    index: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  scheduledTime: String,
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notifyAuthor: {
    type: Boolean,
    default: true
  },
  socialMediaShare: {
    type: Boolean,
    default: true
  },
  platforms: {
    twitter: Boolean,
    facebook: Boolean,
    linkedin: Boolean
  },
  tags: [String],
  category: String,
  publishedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for finding scheduled articles to publish
publishScheduleSchema.index({ scheduledDate: 1, status: 1 });
publishScheduleSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('PublishSchedule', publishScheduleSchema);
