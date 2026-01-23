const mongoose = require('mongoose');

const contentDraftSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: String,
  description: String,
  content: String,
  category: String,
  tags: [String],
  image: String,
  draftSavedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastEditedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  autoSaveCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'scheduled', 'published'],
    default: 'draft',
    index: true
  },
  linkedArticleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  autoSaveVersions: [{
    content: String,
    savedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for user's drafts
contentDraftSchema.index({ authorId: 1, lastEditedAt: -1 });
contentDraftSchema.index({ authorId: 1, status: 1 });

module.exports = mongoose.model('ContentDraft', contentDraftSchema);
