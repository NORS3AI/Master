const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { isAuthenticated, isAuthenticatedView } = require('../middleware/auth');

const router = express.Router();

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: fileFilter
});

// Get current user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public user profile by ID
router.get('/:userId/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email -resetPasswordToken -resetPasswordExpires -resetUsernameToken -resetUsernameExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if private and requester is not the user
    if (!user.isPublic && (!req.session.userId || req.session.userId !== req.params.userId)) {
      return res.status(403).json({ message: 'This user\'s profile is private' });
    }

    // Add follow status if user is logged in
    if (req.session.userId && req.session.userId !== req.params.userId) {
      const currentUser = await User.findById(req.session.userId);
      user._doc.isFollowing = currentUser.following.includes(req.params.userId);
      user._doc.isBlocked = currentUser.blockedUsers.includes(req.params.userId);
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, bio, birthDate, country, state, storeName, city } = req.body;

    const user = await User.findById(req.session.userId);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (birthDate) user.birthDate = new Date(birthDate);
    if (country) user.country = country;
    if (state) user.state = state;
    if (storeName) user.storeInfo.storeName = storeName;
    if (city) user.storeInfo.city = city;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/profile-image', isAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.session.userId);

    // Delete old image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/profiles', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.session.userId);

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
