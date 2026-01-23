const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  owner: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'United States'
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  services: [{
    type: String,
    enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'Local Delivery', 'Mailbox Rental', 'Printing', 'Packing']
  }],
  isSpotlight: {
    type: Boolean,
    default: false
  },
  spotlightStartDate: {
    type: Date,
    default: null
  },
  spotlightEndDate: {
    type: Date,
    default: null
  },
  votes: {
    type: Number,
    default: 0
  },
  nominationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Store', storeSchema);
