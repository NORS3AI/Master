const mongoose = require('mongoose');

const customerNominationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nominatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    maxlength: 1000,
    required: true
  },
  category: {
    type: String,
    enum: ['engagement', 'contribution', 'leadership'],
    required: true,
    index: true
  },
  votes: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'featured'],
    default: 'pending',
    index: true
  },
  featuredId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerSpotlight'
  },
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Prevent duplicate nominations from same user within 7 days
customerNominationSchema.index(
  { userId: 1, nominatedBy: 1, createdAt: -1 },
  { sparse: true }
);

module.exports = mongoose.model('CustomerNomination', customerNominationSchema);
