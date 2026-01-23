const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Failed to fetch article' });
  }
});

// Toggle favorite article
router.post('/:id/favorite', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const articleId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorited = user.favoriteArticles.includes(articleId);

    if (isFavorited) {
      user.favoriteArticles = user.favoriteArticles.filter(
        id => id.toString() !== articleId
      );
    } else {
      user.favoriteArticles.push(articleId);
    }

    await user.save();

    res.json({
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited,
      favoriteCount: user.favoriteArticles.length
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Failed to update favorite' });
  }
});

// Get user's favorite articles
router.get('/user/favorites', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate('favoriteArticles');
    res.json(user.favoriteArticles || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// Check if article is favorited by user
router.get('/:id/is-favorited', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const articleId = req.params.id;

    const user = await User.findById(userId);
    const isFavorited = user.favoriteArticles.includes(articleId);

    res.json({ isFavorited });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
});

module.exports = router;
