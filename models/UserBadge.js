const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
    index: true
  },
  earnedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  progress: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast lookups
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
userBadgeSchema.index({ userId: 1, earnedAt: -1 });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
