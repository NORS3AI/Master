const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const AuditLog = require('../models/AuditLog');
const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');

// GET /api/analytics/dashboard/metrics - Get dashboard metrics
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    }

    const metrics = {
      totalUsers: await User.countDocuments(),
      newUsers: await User.countDocuments(dateFilter),
      activeUsers: await AnalyticsEvent.distinct('userId', dateFilter).then(u => u.length),
      totalArticles: await Article.countDocuments(),
      newArticles: await Article.countDocuments(dateFilter),
      totalComments: await Comment.countDocuments(),
      newComments: await Comment.countDocuments(dateFilter),
      totalViews: await AnalyticsEvent.countDocuments({
        ...dateFilter,
        eventType: 'article_view'
      }),
      totalShares: await AnalyticsEvent.countDocuments({
        ...dateFilter,
        eventType: 'share'
      }),
      totalFavorites: await AnalyticsEvent.countDocuments({
        ...dateFilter,
        eventType: 'favorite'
      })
    };

    // Calculate engagement rate
    const totalInteractions = metrics.newComments + metrics.totalShares + metrics.totalFavorites;
    metrics.engagementRate = metrics.activeUsers > 0
      ? ((totalInteractions / metrics.activeUsers) * 100).toFixed(2)
      : 0;

    res.json({ success: true, metrics });
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/charts/user-growth - User growth over time
router.get('/charts/user-growth', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: userGrowth });
  } catch (err) {
    console.error('Error fetching user growth:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/charts/engagement - Engagement metrics over time
router.get('/charts/engagement', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const engagement = await AnalyticsEvent.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$eventType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({ success: true, data: engagement });
  } catch (err) {
    console.error('Error fetching engagement:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/top-articles - Top performing articles
router.get('/top-articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topArticles = await Article.aggregate([
      {
        $lookup: {
          from: 'analyticevents',
          let: { articleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$resourceId', '$$articleId'] },
                eventType: { $in: ['article_view', 'share', 'favorite'] },
                createdAt: { $gte: startDate }
              }
            }
          ],
          as: 'events'
        }
      },
      {
        $addFields: {
          views: {
            $size: {
              $filter: {
                input: '$events',
                as: 'event',
                cond: { $eq: ['$$event.eventType', 'article_view'] }
              }
            }
          },
          shares: {
            $size: {
              $filter: {
                input: '$events',
                as: 'event',
                cond: { $eq: ['$$event.eventType', 'share'] }
              }
            }
          },
          favorites: {
            $size: {
              $filter: {
                input: '$events',
                as: 'event',
                cond: { $eq: ['$$event.eventType', 'favorite'] }
              }
            }
          }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          title: 1,
          views: 1,
          shares: 1,
          favorites: 1,
          createdBy: 1,
          createdAt: 1
        }
      }
    ]);

    res.json({ success: true, articles: topArticles });
  } catch (err) {
    console.error('Error fetching top articles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/top-authors - Most active authors
router.get('/top-authors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const topAuthors = await Article.aggregate([
      {
        $group: {
          _id: '$createdBy',
          articleCount: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { articleCount: -1 } },
      { $limit: limit },
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
          articleCount: 1,
          totalViews: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, authors: topAuthors });
  } catch (err) {
    console.error('Error fetching top authors:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/top-categories - Popular categories
router.get('/top-categories', async (req, res) => {
  try {
    const topCategories = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          category: '$_id',
          count: 1,
          totalViews: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, categories: topCategories });
  } catch (err) {
    console.error('Error fetching top categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/real-time - Real-time activity feed
router.get('/real-time', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const recentActivity = await AnalyticsEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username avatar')
      .lean();

    res.json({ success: true, activity: recentActivity });
  } catch (err) {
    console.error('Error fetching real-time activity:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/user-demographics - User distribution
router.get('/user-demographics', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const demographics = {
      byActivityLevel: {
        veryActive: await AnalyticsEvent.distinct('userId', {
          createdAt: { $gte: thirtyDaysAgo },
          eventType: { $in: ['article_view', 'comment', 'favorite'] }
        }).then(u => u.length),
        active: await AnalyticsEvent.distinct('userId', {
          createdAt: { $gte: ninetyDaysAgo, $lt: thirtyDaysAgo }
        }).then(u => u.length),
        inactive: await User.countDocuments({
          createdAt: { $lt: ninetyDaysAgo }
        })
      },
      byUserType: {
        total: await User.countDocuments(),
        newThisMonth: await User.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        }),
        newThisQuarter: await User.countDocuments({
          createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        })
      }
    };

    res.json({ success: true, demographics });
  } catch (err) {
    console.error('Error fetching demographics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analytics/export - Export analytics data
router.post('/export', async (req, res) => {
  try {
    const { format, startDate, endDate } = req.body;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const data = await AnalyticsEvent.find(dateFilter)
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Basic CSV format
      let csv = 'Event Type,User,Resource Type,Created At\n';
      data.forEach(event => {
        csv += `${event.eventType},${event.userId},${event.resourceType},${event.createdAt}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv);
    } else {
      res.json({ success: true, data, count: data.length });
    }
  } catch (err) {
    console.error('Error exporting analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/audit-logs - Get admin audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, adminId, days } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let query = {};
    if (action) query.action = action;
    if (adminId) query.adminId = adminId;

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.timestamp = { $gte: startDate };
    }

    const logs = await AuditLog.find(query)
      .populate('adminId', 'username')
      .populate('resourceId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/analytics/events/cleanup - Clean up old events (>90 days)
router.delete('/events/cleanup', async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await AnalyticsEvent.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error cleaning up events:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
