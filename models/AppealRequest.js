const mongoose = require('mongoose');

const appealRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appealType: {
    type: String,
    enum: ['warning', 'suspension', 'ban'],
    required: true,
    index: true
  },
  originalActionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  appealReason: {
    type: String,
    required: true
  },
  evidence: [String],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'denied'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  decision: {
    type: String,
    enum: ['uphold', 'overturn', 'partial']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedAt: Date,
  expiresAt: {
    type: Date,
    index: true
  }
});

// Index for pending appeals
appealRequestSchema.index({ status: 1, createdAt: -1 });
appealRequestSchema.index({ userId: 1, appealType: 1, createdAt: -1 });

module.exports = mongoose.model('AppealRequest', appealRequestSchema);
