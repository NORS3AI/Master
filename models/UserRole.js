const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'moderator', 'contributor', 'member'],
    required: true,
    index: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  department: String,
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for finding active roles
userRoleSchema.index({ role: 1, isActive: 1 });
userRoleSchema.index({ assignedBy: 1, createdAt: -1 });

module.exports = mongoose.model('UserRole', userRoleSchema);
