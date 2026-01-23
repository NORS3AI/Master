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

module.exports = router;
