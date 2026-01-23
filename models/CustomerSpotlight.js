const mongoose = require('mongoose');

const customerSpotlightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  imageUrl: String,
  category: {
    type: String,
    enum: ['engagement', 'contribution', 'leadership'],
    required: true,
    index: true
  },
  featuredUntil: {
    type: Date,
    required: true,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  nominations: {
    type: Number,
    default: 1
  },
  awards: [String],
  stats: {
    followersGained: Number,
    articlesCreated: Number,
    commentsHelpful: Number,
    articlesFavorited: Number
  },
  pinnedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for active spotlights
customerSpotlightSchema.index({ featuredUntil: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerSpotlight', customerSpotlightSchema);
