const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'General', 'Updates', 'Tips'],
    default: 'General'
  },
  image: {
    type: String,
    default: null
  },
  author: {
    type: String,
    default: 'RS News'
  },
  date: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: Number,
    default: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  shares: {
    type: Number,
    default: 0
  },
  shares_twitter: {
    type: Number,
    default: 0
  },
  shares_facebook: {
    type: Number,
    default: 0
  },
  shares_linkedin: {
    type: Number,
    default: 0
  },
  shares_email: {
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
  }
});

module.exports = mongoose.model('Article', articleSchema);
