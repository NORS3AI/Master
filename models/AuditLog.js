const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
      'article_created', 'article_updated', 'article_deleted', 'article_published',
      'comment_approved', 'comment_rejected', 'comment_deleted',
      'role_assigned', 'permission_granted', 'permission_revoked',
      'content_flagged', 'content_resolved',
      'other'
    ],
    index: true
  },
  resourceType: {
    type: String,
    enum: ['User', 'Article', 'Comment', 'Role', 'Permission', 'FlagReport'],
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    summary: String
  },
  reason: String,
  ipAddress: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
