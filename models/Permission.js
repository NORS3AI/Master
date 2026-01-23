const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  description: String,
  category: {
    type: String,
    enum: ['articles', 'users', 'comments', 'moderation', 'admin', 'analytics'],
    required: true,
    index: true
  },
  resource: {
    type: String,
    enum: ['articles', 'users', 'comments', 'reports', 'dashboard', 'settings'],
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'publish', 'moderate', 'approve', 'manage'],
    required: true
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient lookups
permissionSchema.index({ category: 1, resource: 1, action: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
