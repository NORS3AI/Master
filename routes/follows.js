const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Follow a user
router.post('/:userId/follow', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    // Prevent self-follows
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Check if current user is blocked
    if (targetUser.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ message: 'Cannot follow this user' });
    }

    // Add to following list
    currentUser.following.push(targetUserId);
    currentUser.followingCount = currentUser.following.length;

    // Add to followers list
    targetUser.followers.push(currentUserId);
    targetUser.followersCount = targetUser.followers.length;

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: 'Successfully followed user',
      following: true,
      followersCount: targetUser.followersCount
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Failed to follow user' });
  }
});

// Unfollow a user
router.post('/:userId/unfollow', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if actually following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    currentUser.followingCount = currentUser.following.length;

    // Remove from followers list
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    targetUser.followersCount = targetUser.followers.length;

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: 'Successfully unfollowed user',
      following: false,
      followersCount: targetUser.followersCount
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
});

// Block a user
router.post('/:userId/block', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    // Prevent self-blocks
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    if (currentUser.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Block the user
    currentUser.blockedUsers.push(targetUserId);

    // If following, unfollow
    if (currentUser.following.includes(targetUserId)) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      currentUser.followingCount = currentUser.following.length;
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
      targetUser.followersCount = targetUser.followers.length;
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

// Unblock a user
router.post('/:userId/unblock', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is blocked
    if (!currentUser.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    // Unblock user
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== targetUserId);
    await currentUser.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('followers', '-password -email -resetPasswordToken -resetPasswordExpires -resetUsernameToken -resetUsernameExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (!user.isPublic && req.session.userId !== userId) {
      return res.status(403).json({ message: 'This user\'s followers are private' });
    }

    res.json({
      count: user.followers.length,
      followers: user.followers.map(f => f.getPublicProfile())
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Failed to fetch followers' });
  }
});

// Get user's following list
router.get('/:userId/following', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('following', '-password -email -resetPasswordToken -resetPasswordExpires -resetUsernameToken -resetUsernameExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (!user.isPublic && req.session.userId !== userId) {
      return res.status(403).json({ message: 'This user\'s following list is private' });
    }

    res.json({
      count: user.following.length,
      following: user.following.map(f => f.getPublicProfile())
    });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Failed to fetch following list' });
  }
});

// Check if current user is following a user
router.get('/:userId/is-following', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Failed to check follow status' });
  }
});

// Get mutual followers
router.get('/:userId/mutual-follows', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.session.userId;

    if (!currentUserId) {
      return res.json({ count: 0, mutual: [] });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find mutual followers (people both follow)
    const mutualIds = currentUser.following.filter(id =>
      targetUser.following.some(followingId => followingId.toString() === id.toString())
    );

    const mutual = await User.find({ _id: { $in: mutualIds } }, '-password -email -resetPasswordToken -resetPasswordExpires -resetUsernameToken -resetUsernameExpires');

    res.json({
      count: mutual.length,
      mutual: mutual.map(u => u.getPublicProfile())
    });
  } catch (error) {
    console.error('Error fetching mutual followers:', error);
    res.status(500).json({ message: 'Failed to fetch mutual followers' });
  }
});

module.exports = router;
