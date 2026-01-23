const express = require('express');
const Store = require('../models/Store');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Get featured/spotlight stores
router.get('/spotlight/active', async (req, res) => {
  try {
    const now = new Date();
    const stores = await Store.find({
      isSpotlight: true,
      spotlightStartDate: { $lte: now },
      spotlightEndDate: { $gte: now }
    }).sort({ votes: -1 });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching spotlight stores:', error);
    res.status(500).json({ message: 'Failed to fetch spotlight stores' });
  }
});

// Get single store
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Failed to fetch store' });
  }
});

// Nominate store for spotlight
router.post('/:id/nominate', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { $inc: { nominationCount: 1 } },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({
      message: 'Store nominated successfully',
      nominationCount: store.nominationCount
    });
  } catch (error) {
    console.error('Error nominating store:', error);
    res.status(500).json({ message: 'Failed to nominate store' });
  }
});

// Vote for store
router.post('/:id/vote', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: 1 } },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({
      message: 'Vote recorded',
      votes: store.votes
    });
  } catch (error) {
    console.error('Error voting for store:', error);
    res.status(500).json({ message: 'Failed to record vote' });
  }
});

module.exports = router;
