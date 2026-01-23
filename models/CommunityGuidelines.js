const mongoose = require('mongoose');

const communityGuidelinesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'content', 'behavior', 'safety', 'copyright'],
    required: true,
    index: true
  },
  rules: [{
    rule: String,
    consequence: String,
    examples: [String],
    severity: {
      type: String,
      enum: ['warning', 'ban'],
      default: 'warning'
    }
  }],
  version: {
    type: Number,
    default: 1,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index for active guidelines
communityGuidelinesSchema.index({ isActive: 1, version: -1 });
communityGuidelinesSchema.index({ category: 1, version: -1 });

module.exports = mongoose.model('CommunityGuidelines', communityGuidelinesSchema);
