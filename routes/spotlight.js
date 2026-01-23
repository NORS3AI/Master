const express = require('express');
const router = express.Router();
const CustomerSpotlight = require('../models/CustomerSpotlight');
const CustomerNomination = require('../models/CustomerNomination');
const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/spotlight/featured - Featured customers
router.get('/featured', async (req, res) => {
  try {
    const category = req.query.category;
    const page = req.query.page || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = {
      featuredUntil: { $gt: new Date() }
    };

    if (category) {
      query.category = category;
    }

    const spotlights = await CustomerSpotlight.find(query)
      .populate('userId', 'username avatar email')
      .sort({ pinnedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CustomerSpotlight.countDocuments(query);

    res.json({
      success: true,
      spotlights,
      pagination: {
        current: page,
        total: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching featured customers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/spotlight/featured/:userId - Specific customer spotlight
router.get('/featured/:userId', async (req, res) => {
  try {
    const spotlight = await CustomerSpotlight.findOne({
      userId: req.params.userId,
      featuredUntil: { $gt: new Date() }
    })
      .populate('userId', 'username avatar email followers following')
      .populate('createdBy', 'username')
      .lean();

    if (!spotlight) {
      return res.json({ success: true, spotlight: null });
    }

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error fetching customer spotlight:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/spotlight/leaderboard - Top spotlighted customers
router.get('/leaderboard', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'month';
    let dateFilter = {};

    if (timeframe === 'month') {
      dateFilter = { pinnedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const leaderboard = await CustomerSpotlight.find(dateFilter)
      .populate('userId', 'username avatar')
      .sort({ views: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, leaderboard, timeframe });
  } catch (err) {
    console.error('Error fetching spotlight leaderboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/spotlight/nominate - Nominate customer
router.post('/nominate', async (req, res) => {
  try {
    const { userId, reason, category } = req.body;
    const nominator = req.body.nominatedBy || req.user?.id;

    if (!userId || !reason || !category) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!nominator) {
      return res.status(401).json({ success: false, error: 'Must be logged in to nominate' });
    }

    // Check if user already nominated this person recently
    const recentNomination = await CustomerNomination.findOne({
      userId,
      nominatedBy: nominator,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (recentNomination) {
      return res.status(400).json({
        success: false,
        error: 'You can only nominate this user once per week'
      });
    }

    const nomination = new CustomerNomination({
      userId,
      nominatedBy: nominator,
      reason,
      category
    });

    await nomination.save();

    res.json({ success: true, nomination });
  } catch (err) {
    console.error('Error creating nomination:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/spotlight/nominations - Admin: Get pending nominations
router.get('/nominations', async (req, res) => {
  try {
    // This should be admin-only
    const nominations = await CustomerNomination.find({ status: 'pending' })
      .populate('userId', 'username avatar')
      .populate('nominatedBy', 'username')
      .sort({ votes: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, nominations });
  } catch (err) {
    console.error('Error fetching nominations:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/spotlight/nominations/:nominationId/approve - Admin: Approve and feature
router.post('/nominations/:nominationId/approve', async (req, res) => {
  try {
    const { duration } = req.body; // Duration in days (14-60)

    if (!duration || duration < 14 || duration > 60) {
      return res.status(400).json({ success: false, error: 'Duration must be 14-60 days' });
    }

    const nomination = await CustomerNomination.findById(req.params.nominationId)
      .populate('userId');

    if (!nomination) {
      return res.status(404).json({ success: false, error: 'Nomination not found' });
    }

    // Create spotlight
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + duration);

    const spotlight = new CustomerSpotlight({
      userId: nomination.userId._id,
      title: `Community ${nomination.category === 'engagement' ? 'Star' : nomination.category === 'contribution' ? 'Voice' : 'Builder'}`,
      description: nomination.reason,
      category: nomination.category,
      featuredUntil,
      createdBy: req.user?.id
    });

    await spotlight.save();

    // Update nomination
    nomination.status = 'featured';
    nomination.featuredId = spotlight._id;
    await nomination.save();

    // Log activity
    await Activity.create({
      userId: nomination.userId._id,
      type: 'badge_earned',
      targetId: spotlight._id,
      targetType: 'CustomerSpotlight',
      metadata: {
        badgeName: 'Customer Spotlight',
        badgeIcon: '⭐',
        userName: nomination.userId.username
      },
      isPublic: true
    });

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error approving nomination:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/spotlight/nominations/:nominationId/reject - Admin: Reject
router.post('/nominations/:nominationId/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const nomination = await CustomerNomination.findByIdAndUpdate(
      req.params.nominationId,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );

    res.json({ success: true, nomination });
  } catch (err) {
    console.error('Error rejecting nomination:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
