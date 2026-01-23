const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['page_view', 'article_view', 'comment', 'favorite', 'share', 'follow', 'login', 'registration', 'badge_earned'],
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['Article', 'Comment', 'User', 'Badge', 'null'],
    default: 'null'
  },
  metadata: {
    articleTitle: String,
    userName: String,
    platform: String,
    referrer: String,
    duration: Number
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000  // TTL: 90 days auto-cleanup
  }
});

// Index for efficient queries
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
