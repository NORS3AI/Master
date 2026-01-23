const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['engagement', 'contributor', 'community', 'milestone'],
    required: true,
    index: true
  },
  criteria: {
    type: {
      type: String,
      enum: [
        'followerCount',
        'commentCount',
        'favoriteCount',
        'articleCount',
        'daysActive',
        'commentLikes',
        'featured',
        'earlyUser',
        'views'
      ],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'legendary'],
    default: 'common',
    index: true
  },
  color: {
    type: String,
    default: '#FFD700'
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Rarity color mappings
badgeSchema.pre('save', function(next) {
  if (!this.color) {
    const rarityColors = {
      common: '#A0A0A0',
      uncommon: '#1EFF00',
      rare: '#0070DD',
      legendary: '#FF8000'
    };
    this.color = rarityColors[this.rarity] || '#FFD700';
  }
  next();
});

module.exports = mongoose.model('Badge', badgeSchema);
