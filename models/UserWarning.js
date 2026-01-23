const mongoose = require('mongoose');

const userWarningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  warningNumber: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlagReport'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'serious'],
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  acknowledged: Boolean,
  acknowledgedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for counting user warnings
userWarningSchema.index({ userId: 1, createdAt: -1 });
userWarningSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model('UserWarning', userWarningSchema);
