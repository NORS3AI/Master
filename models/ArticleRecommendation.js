const mongoose = require('mongoose');

const articleRecommendationSchema = new mongoose.Schema({
  sourceArticleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  recommendedArticleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['similar_category', 'similar_tags', 'same_author', 'trending', 'user_history', 'sequential'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  clickThroughs: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Prevent duplicate recommendations
articleRecommendationSchema.index({ sourceArticleId: 1, recommendedArticleId: 1 }, { unique: true });
articleRecommendationSchema.index({ reason: 1, createdAt: -1 });

module.exports = mongoose.model('ArticleRecommendation', articleRecommendationSchema);
