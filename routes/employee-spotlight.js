const express = require('express');
const router = express.Router();
const EmployeeSpotlight = require('../models/EmployeeSpotlight');
const EmployeeRole = require('../models/EmployeeRole');
const User = require('../models/User');

// GET /api/employee-spotlight/featured - Featured employees
router.get('/featured', async (req, res) => {
  try {
    const role = req.query.role;
    const department = req.query.department;
    const page = req.query.page || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = {
      isActive: true,
      featuredUntil: { $gt: new Date() }
    };

    if (role) query.featuredRole = role;
    if (department) query.department = department;

    const employees = await EmployeeSpotlight.find(query)
      .populate('userId', 'username avatar email')
      .sort({ pinnedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EmployeeSpotlight.countDocuments(query);

    res.json({
      success: true,
      employees,
      pagination: {
        current: page,
        total: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching featured employees:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/employee-spotlight/featured/:userId - Specific employee spotlight
router.get('/featured/:userId', async (req, res) => {
  try {
    const spotlight = await EmployeeSpotlight.findOne({
      userId: req.params.userId,
      isActive: true,
      featuredUntil: { $gt: new Date() }
    })
      .populate('userId', 'username avatar email')
      .lean();

    if (!spotlight) {
      return res.json({ success: true, spotlight: null });
    }

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error fetching employee spotlight:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/employee-spotlight/by-department/:department - Employees by department
router.get('/by-department/:department', async (req, res) => {
  try {
    const employees = await EmployeeSpotlight.find({
      department: req.params.department,
      isActive: true,
      featuredUntil: { $gt: new Date() }
    })
      .populate('userId', 'username avatar email')
      .sort({ pinnedAt: -1 })
      .lean();

    res.json({ success: true, employees });
  } catch (err) {
    console.error('Error fetching employees by department:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/employee-spotlight/leaderboard - Top employees by contributions
router.get('/leaderboard', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    let dateFilter = {};

    if (timeframe === 'month') {
      dateFilter = { pinnedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const leaderboard = await EmployeeSpotlight.find({
      isActive: true,
      ...dateFilter
    })
      .populate('userId', 'username avatar')
      .sort({ articleCount: -1, helpfulComments: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, leaderboard, timeframe });
  } catch (err) {
    console.error('Error fetching employee leaderboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/employee-spotlight/:userId/feature - Admin: Create spotlight
router.post('/:userId/feature', async (req, res) => {
  try {
    const { jobTitle, department, bio, featuredRole, category, duration } = req.body;

    if (!jobTitle || !department || !featuredRole || !category || !duration) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if employee already featured
    const existing = await EmployeeSpotlight.findOne({
      userId: req.params.userId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Employee already featured' });
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + duration);

    const spotlight = new EmployeeSpotlight({
      userId: req.params.userId,
      jobTitle,
      department,
      bio,
      featuredRole,
      category,
      featuredUntil,
      isActive: true
    });

    await spotlight.save();

    // Create or update employee role
    await EmployeeRole.findOneAndUpdate(
      { userId: req.params.userId },
      {
        userId: req.params.userId,
        jobTitle,
        department,
        isActive: true
      },
      { upsert: true }
    );

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error creating employee spotlight:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/employee-spotlight/:spotlightId - Admin: Update spotlight
router.patch('/:spotlightId', async (req, res) => {
  try {
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.userId;

    const spotlight = await EmployeeSpotlight.findByIdAndUpdate(
      req.params.spotlightId,
      updates,
      { new: true }
    )
      .populate('userId', 'username avatar email')
      .lean();

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error updating employee spotlight:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/employee-spotlight/:spotlightId - Admin: Remove from spotlight
router.delete('/:spotlightId', async (req, res) => {
  try {
    const spotlight = await EmployeeSpotlight.findByIdAndUpdate(
      req.params.spotlightId,
      { isActive: false },
      { new: true }
    );

    res.json({ success: true, spotlight });
  } catch (err) {
    console.error('Error removing employee spotlight:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/employee-spotlight/roles - List available roles
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      {
        name: 'Community Author',
        icon: '✍️',
        description: 'Active article writer and content creator'
      },
      {
        name: 'Support Champion',
        icon: '🤝',
        description: 'Provides excellent customer support'
      },
      {
        name: 'Community Moderator',
        icon: '🛡️',
        description: 'Maintains community standards and quality'
      },
      {
        name: 'Brand Ambassador',
        icon: '📢',
        description: 'Represents brand and engages community'
      },
      {
        name: 'Product Expert',
        icon: '🎯',
        description: 'Deep product knowledge and guidance'
      },
      {
        name: 'Community Partner',
        icon: '🔗',
        description: 'Collaborates on partnerships and initiatives'
      }
    ];

    res.json({ success: true, roles });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
