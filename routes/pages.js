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

// Spotlight page
router.get('/spotlight', async (req, res) => {
  try {
    const Store = require('../models/Store');
    const now = new Date();

    // Get current spotlight stores
    const spotlightStores = await Store.find({
      isSpotlight: true,
      spotlightStartDate: { $lte: now },
      spotlightEndDate: { $gte: now }
    }).sort({ votes: -1 }).limit(3);

    // Get top nominated stores for next spotlight
    const topNominated = await Store.find({
      isSpotlight: false
    }).sort({ nominationCount: -1 }).limit(5);

    res.render('pages/spotlight', {
      spotlightStores,
      topNominated,
      isAuthenticated: !!req.session.userId,
      userId: req.session.userId,
      username: req.session.username
    });
  } catch (error) {
    console.error('Error fetching spotlight page:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Store profile page
router.get('/stores/:id', async (req, res) => {
  try {
    const Store = require('../models/Store');
    const store = await Store.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });

    if (!store) {
      return res.status(404).render('error', { message: 'Store not found' });
    }

    const ogData = {
      title: store.name,
      description: store.description,
      image: store.image || store.logo || `${process.env.APP_URL || 'http://localhost:5000'}/images/logo.png`,
      url: `${process.env.APP_URL || 'http://localhost:5000'}/stores/${store._id}`,
      type: 'business.business',
      author: store.owner,
      location: `${store.city}, ${store.state}`
    };

    res.render('pages/store', {
      store,
      ogData,
      isAuthenticated: !!req.session.userId,
      userId: req.session.userId,
      username: req.session.username
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Admin dashboard page
router.get('/admin/dashboard', isAuthenticatedView, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    // Check if user is admin (basic check - can be expanded with permission system in Phase 3.3)
    if (!user || !user.isAdmin) {
      return res.status(403).render('error', { message: 'Unauthorized access' });
    }

    res.render('pages/admin/dashboard', { user });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Activity feed page
router.get('/activity-feed', async (req, res) => {
  res.render('pages/activity-feed', {
    user: req.session.userId,
    isAuthenticated: !!req.session.userId
  });
});

// Badges page
router.get('/badges', async (req, res) => {
  res.render('pages/badges', {
    user: req.session.userId,
    isAuthenticated: !!req.session.userId
  });
});

module.exports = router;
