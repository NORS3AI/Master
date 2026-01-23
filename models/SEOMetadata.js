const mongoose = require('mongoose');

const seoMetadataSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    unique: true,
    index: true
  },
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  keywords: [String],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  canonicalUrl: String,
  robotsIndex: {
    type: String,
    enum: ['index', 'noindex'],
    default: 'index'
  },
  robotsFollow: {
    type: String,
    enum: ['follow', 'nofollow'],
    default: 'follow'
  },
  structuredData: mongoose.Schema.Types.Mixed,
  schemaType: {
    type: String,
    enum: ['Article', 'NewsArticle', 'BlogPosting', 'Report'],
    default: 'Article'
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SEOMetadata', seoMetadataSchema);
