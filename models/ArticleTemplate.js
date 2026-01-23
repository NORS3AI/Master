const mongoose = require('mongoose');

const articleTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category: String,
  structure: {
    sections: [String],
    placeholders: mongoose.Schema.Types.Mixed
  },
  content: String,
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  icon: String,
  color: String,
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

// Index for finding templates
articleTemplateSchema.index({ isPublic: 1, createdAt: -1 });
articleTemplateSchema.index({ createdBy: 1, createdAt: -1 });
articleTemplateSchema.index({ category: 1 });

module.exports = mongoose.model('ArticleTemplate', articleTemplateSchema);
