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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Article', articleSchema);
