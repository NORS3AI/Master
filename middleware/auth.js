const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check if user is authenticated (for views)
const isAuthenticatedView = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware to make user data available to views
const setUserLocals = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.isAuthenticated = true;
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAuthenticatedView,
  setUserLocals
};
