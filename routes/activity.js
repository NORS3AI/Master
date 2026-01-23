const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');

// GET /api/activity/feed - Get current user's personalized feed
router.get('/feed', ensureAuthenticated, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Get users that current user follows
    const user = await User.findById(req.user.id);
    const followingIds = user.following || [];
    followingIds.push(req.user.id); // Include own activities

    const activities = await Activity.find({
      userId: { $in: followingIds },
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar')
      .populate('targetId')
      .lean();

    const total = await Activity.countDocuments({
      userId: { $in: followingIds },
      isPublic: true
    });

    res.json({
      success: true,
      activities,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/activity/:userId - Get specific user's public activities
router.get('/:userId', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({
      userId: req.params.userId,
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar')
      .lean();

    const total = await Activity.countDocuments({
      userId: req.params.userId,
      isPublic: true
    });

    res.json({
      success: true,
      activities,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/activity/log (Internal) - Log an activity
router.post('/log', async (req, res) => {
  try {
    const { userId, type, targetId, targetType, targetUser, metadata, isPublic } = req.body;

    if (!userId || !type || !targetId || !targetType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const activity = new Activity({
      userId,
      type,
      targetId,
      targetType,
      targetUser,
      metadata: metadata || {},
      isPublic: isPublic !== false
    });

    await activity.save();

    res.json({ success: true, activity });
  } catch (err) {
    console.error('Error logging activity:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/activity/stats/:userId - Get user's activity statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = {
      totalActivities: 0,
      byType: {
        follow: 0,
        comment: 0,
        favorite: 0,
        article_created: 0,
        badge_earned: 0
      },
      thisMonth: 0,
      thisWeek: 0
    };

    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total activities
    stats.totalActivities = await Activity.countDocuments({
      userId,
      isPublic: true
    });

    // By type
    const typeBreakdown = await Activity.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isPublic: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    typeBreakdown.forEach(item => {
      if (stats.byType[item._id] !== undefined) {
        stats.byType[item._id] = item.count;
      }
    });

    // This month
    stats.thisMonth = await Activity.countDocuments({
      userId,
      isPublic: true,
      createdAt: { $gte: monthAgo }
    });

    // This week
    stats.thisWeek = await Activity.countDocuments({
      userId,
      isPublic: true,
      createdAt: { $gte: weekAgo }
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error getting activity stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/activity/leaderboard - Top users by activity
router.get('/leaderboard', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'month'; // month, week, all
    let dateFilter = {};

    if (timeframe === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const leaderboard = await Activity.aggregate([
      { $match: { isPublic: true, ...dateFilter } },
      { $group: { _id: '$userId', activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
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
          activityCount: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, leaderboard, timeframe });
  } catch (err) {
    console.error('Error getting activity leaderboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
