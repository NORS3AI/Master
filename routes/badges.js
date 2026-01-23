const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { ensureAuthenticated } = require('../middleware/auth');

// GET /api/badges - Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find()
      .sort({ rarity: -1, order: 1 })
      .lean();

    res.json({ success: true, badges });
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/badges/:userId - Get user's earned badges
router.get('/:userId', async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.params.userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 })
      .lean();

    const badges = userBadges.map(ub => ({
      ...ub.badgeId,
      earnedAt: ub.earnedAt,
      progress: ub.progress
    }));

    res.json({ success: true, badges, count: badges.length });
  } catch (err) {
    console.error('Error fetching user badges:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/badges/check/:badgeId (Internal)
router.post('/check/:badgeId', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }

    const badge = await Badge.findById(req.params.badgeId);
    if (!badge) {
      return res.status(404).json({ success: false, error: 'Badge not found' });
    }

    // Check if user already has this badge
    const existingBadge = await UserBadge.findOne({
      userId,
      badgeId: req.params.badgeId
    });

    if (existingBadge) {
      return res.json({ success: true, awarded: false, reason: 'Already earned' });
    }

    // Check if user qualifies
    const qualifies = await checkBadgeCriteria(userId, badge);

    if (qualifies) {
      // Award badge
      const userBadge = new UserBadge({
        userId,
        badgeId: req.params.badgeId,
        notificationSent: false
      });

      await userBadge.save();

      // Log activity
      const user = await User.findById(userId);
      await Activity.create({
        userId,
        type: 'badge_earned',
        targetId: req.params.badgeId,
        targetType: 'Badge',
        metadata: {
          badgeName: badge.name,
          badgeIcon: badge.icon,
          userName: user.username
        },
        isPublic: true
      });

      res.json({ success: true, awarded: true, badge });
    } else {
      res.json({ success: true, awarded: false, reason: 'Criteria not met' });
    }
  } catch (err) {
    console.error('Error checking badge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/badges/leaderboard - Top users by badge count
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await UserBadge.aggregate([
      { $group: { _id: '$userId', badgeCount: { $sum: 1 } } },
      { $sort: { badgeCount: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          avatar: '$user.avatar',
          badgeCount: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Error fetching badge leaderboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper function: Check if user meets badge criteria
async function checkBadgeCriteria(userId, badge) {
  try {
    const user = await User.findById(userId)
      .populate('followers following');

    if (!user) return false;

    const { criteria } = badge;

    switch (criteria.type) {
      case 'followerCount':
        return (user.followers?.length || 0) >= criteria.value;

      case 'commentCount': {
        const commentCount = await require('../models/Comment')
          .countDocuments({ userId });
        return commentCount >= criteria.value;
      }

      case 'favoriteCount': {
        const favorites = user.favorites || [];
        return favorites.length >= criteria.value;
      }

      case 'articleCount': {
        const articleCount = await require('../models/Article')
          .countDocuments({ createdBy: userId });
        return articleCount >= criteria.value;
      }

      case 'commentLikes': {
        const Comment = require('../models/Comment');
        const comments = await Comment.find({ userId });
        const totalLikes = comments.reduce((sum, c) => sum + (c.likes?.length || 0), 0);
        return totalLikes >= criteria.value;
      }

      case 'earlyUser': {
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceSignup <= criteria.value;
      }

      case 'views': {
        const viewCount = await Activity.countDocuments({
          userId,
          type: 'article_viewed'
        });
        return viewCount >= criteria.value;
      }

      default:
        return false;
    }
  } catch (err) {
    console.error('Error checking badge criteria:', err);
    return false;
  }
}

// Endpoint to check all badges for a user
router.post('/check-all/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const badges = await Badge.find();

    const results = [];
    for (const badge of badges) {
      const qualifies = await checkBadgeCriteria(userId, badge);
      const alreadyEarned = await UserBadge.findOne({
        userId,
        badgeId: badge._id
      });

      if (qualifies && !alreadyEarned) {
        const userBadge = new UserBadge({
          userId,
          badgeId: badge._id
        });
        await userBadge.save();
        results.push({ badgeId: badge._id, name: badge.name, awarded: true });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Error checking all badges:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
