const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['follow', 'comment', 'favorite', 'article_created', 'badge_earned'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['User', 'Article', 'Comment', 'Badge'],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    articleTitle: String,
    userName: String,
    userAvatar: String,
    badgeName: String,
    badgeIcon: String,
    commentText: String
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for fast feed queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ isPublic: 1, createdAt: -1 });
activitySchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
