const express = require('express');
const { isAuthenticatedView, setUserLocals } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Apply user locals to all routes
router.use(setUserLocals);

// Home page
router.get('/', (req, res) => {
  res.render('pages/home');
});

// My Account page
router.get('/my-account', isAuthenticatedView, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('pages/my-account', { user });
  } catch (error) {
    res.status(500).render('error', { message: 'Server error' });
  }
});

// News page
router.get('/news', (req, res) => {
  res.render('pages/news');
});

// About page
router.get('/about', (req, res) => {
  res.render('pages/about');
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('pages/contact');
});

// Individual article page
router.get('/articles/:id', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });

    if (!article) {
      return res.status(404).render('error', { message: 'Article not found' });
    }

    // Set OG meta tags for social sharing
    const ogData = {
      title: article.title,
      description: article.description,
      image: article.image || `${process.env.APP_URL || 'http://localhost:5000'}/images/logo.png`,
      url: `${process.env.APP_URL || 'http://localhost:5000'}/articles/${article._id}`,
      type: 'article',
      author: article.author,
      publishedDate: article.date,
      category: article.category
    };

    res.render('pages/article', { article, ogData, isAuthenticated: !!req.session.userId, userId: req.session.userId, username: req.session.username });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

module.exports = router;
