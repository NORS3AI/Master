const mongoose = require('mongoose');

const employeeRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['Sales', 'Engineering', 'Support', 'Marketing', 'Leadership', 'Operations'],
    required: true
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responsibilities: [String],
  permissions: {
    type: [String],
    enum: ['admin', 'moderator', 'content-creator', 'support-staff', 'editor'],
    default: []
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
employeeRoleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmployeeRole', employeeRoleSchema);
