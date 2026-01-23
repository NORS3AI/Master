const mongoose = require('mongoose');

const roleTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['admin', 'editor', 'moderator', 'contributor', 'member'],
    unique: true,
    required: true,
    index: true
  },
  description: String,
  defaultPermissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  canDelegate: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
    index: true
  },
  features: {
    articles: {
      create: Boolean,
      read: Boolean,
      update: Boolean,
      delete: Boolean,
      publish: Boolean,
      schedule: Boolean,
      feature: Boolean
    },
    users: {
      create: Boolean,
      read: Boolean,
      update: Boolean,
      delete: Boolean,
      ban: Boolean,
      assignRoles: Boolean
    },
    comments: {
      create: Boolean,
      read: Boolean,
      delete: Boolean,
      moderate: Boolean,
      flag: Boolean
    },
    admin: {
      dashboard: Boolean,
      settings: Boolean,
      backups: Boolean,
      logs: Boolean
    },
    analytics: {
      view: Boolean,
      export: Boolean
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RoleTemplate', roleTemplateSchema);
