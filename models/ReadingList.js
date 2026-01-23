const mongoose = require('mongoose');

const readingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  color: String,
  icon: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for finding user's lists
readingListSchema.index({ userId: 1, createdAt: -1 });
readingListSchema.index({ isPublic: 1, views: -1 });

module.exports = mongoose.model('ReadingList', readingListSchema);
