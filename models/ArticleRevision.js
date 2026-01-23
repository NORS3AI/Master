const mongoose = require('mongoose');

const articleRevisionSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  revisionNumber: {
    type: Number,
    required: true
  },
  title: String,
  description: String,
  content: String,
  category: String,
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changes: {
    fields: [String],
    summary: String
  },
  changeReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: String,
  views: { type: Number, default: 0 }
});

// Compound index for fast lookups
articleRevisionSchema.index({ articleId: 1, revisionNumber: -1 });
articleRevisionSchema.index({ articleId: 1, createdAt: -1 });

module.exports = mongoose.model('ArticleRevision', articleRevisionSchema);
