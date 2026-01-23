const mongoose = require('mongoose');

const adminDashboardSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  dateRange: {
    type: String,
    enum: ['today', 'week', 'month', 'year', 'custom'],
    default: 'month'
  },
  startDate: Date,
  endDate: Date,
  metrics: {
    totalUsers: Number,
    newUsers: Number,
    activeUsers: Number,
    totalArticles: Number,
    newArticles: Number,
    totalComments: Number,
    totalViews: Number,
    totalShares: Number,
    totalFavorites: Number,
    engagementRate: Number
  },
  topArticles: [{
    articleId: mongoose.Schema.Types.ObjectId,
    title: String,
    views: Number,
    shares: Number,
    favorites: Number
  }],
  topAuthors: [{
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    articleCount: Number,
    engagement: Number
  }],
  topCategories: [{
    name: String,
    count: Number,
    engagement: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AdminDashboard', adminDashboardSchema);
