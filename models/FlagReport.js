const mongoose = require('mongoose');

const flagReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['comment', 'article', 'user', 'message'],
    required: true,
    index: true
  },
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportReason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'],
    required: true,
    index: true
  },
  reportDescription: String,
  evidence: [String],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  actionTaken: {
    type: String,
    enum: ['warning', 'remove', 'ban_user', 'suspend', 'none']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: Date
});

// Index for efficient queries
flagReportSchema.index({ status: 1, severity: 1, createdAt: -1 });
flagReportSchema.index({ reportType: 1, reportedId: 1, createdAt: -1 });

module.exports = mongoose.model('FlagReport', flagReportSchema);
