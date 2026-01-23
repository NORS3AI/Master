const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendUsernameResetEmail } = require('../utils/email');
const { isAuthenticatedView } = require('../middleware/auth');

const router = express.Router();

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register logic
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.status(201).json({
      message: 'User registered successfully',
      redirect: '/my-account'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login logic
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      redirect: '/'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password');
});

// Forgot password logic
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);

    if (emailSent) {
      res.json({ message: 'Reset email sent' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password-error', {
        message: 'Invalid or expired reset link'
      });
    }

    res.render('auth/reset-password', { token: req.params.token });
  } catch (error) {
    res.status(500).render('auth/reset-password-error', {
      message: 'Server error'
    });
  }
});

// Reset password logic
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      message: 'Password reset successful',
      redirect: '/auth/login'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot username page
router.get('/forgot-username', (req, res) => {
  res.render('auth/forgot-username');
});

// Forgot username logic
router.post('/forgot-username', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate reset token
    const resetToken = user.generateUsernameResetToken();
    await user.save();

    // Send email
    const emailSent = await sendUsernameResetEmail(email, resetToken, user.username);

    if (emailSent) {
      res.json({ message: 'Reset email sent' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Forgot username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset username page
router.get('/reset-username/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetUsernameToken: hashedToken,
      resetUsernameExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-username-error', {
        message: 'Invalid or expired reset link'
      });
    }

    res.render('auth/reset-username', { token: req.params.token });
  } catch (error) {
    res.status(500).render('auth/reset-username-error', {
      message: 'Server error'
    });
  }
});

// Reset username logic
router.post('/reset-username/:token', async (req, res) => {
  try {
    const { newUsername } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    if (!newUsername) {
      return res.status(400).json({ message: 'New username required' });
    }

    if (newUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findOne({
      resetUsernameToken: hashedToken,
      resetUsernameExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.username = newUsername;
    user.resetUsernameToken = null;
    user.resetUsernameExpires = null;
    await user.save();

    res.json({
      message: 'Username reset successful',
      redirect: '/auth/login'
    });
  } catch (error) {
    console.error('Reset username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
