const express = require('express');
const Comment = require('../models/Comment');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin (future implementation)
const isAdmin = (req, res, next) => {
  // TODO: Implement proper admin role checking
  // For now, allow all authenticated users to access
  if (!req.session.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};

// Get pending comments for moderation
router.get('/comments/pending', isAdmin, async (req, res) => {
  try {
    const comments = await Comment.find({ isApproved: false })
      .populate('userId', 'username email')
      .populate('articleId', 'title _id')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({ message: 'Failed to fetch pending comments' });
  }
});

// Get all comments for moderation
router.get('/comments', isAdmin, async (req, res) => {
  try {
    const { approved, search } = req.query;
    let filter = {};

    if (approved !== undefined) {
      filter.isApproved = approved === 'true';
    }

    let comments = await Comment.find(filter)
      .populate('userId', 'username email')
      .populate('articleId', 'title _id')
      .sort({ createdAt: -1 });

    if (search) {
      comments = comments.filter(c =>
        c.content.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Approve a comment
router.post('/comments/:id/approve', isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      message: 'Comment approved successfully',
      comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ message: 'Failed to approve comment' });
  }
});

// Reject/delete a comment
router.post('/comments/:id/reject', isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment rejected and deleted' });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({ message: 'Failed to reject comment' });
  }
});

// Pin/unpin a comment
router.post('/comments/:id/pin', isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    res.json({
      message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned',
      isPinned: comment.isPinned
    });
  } catch (error) {
    console.error('Error pinning comment:', error);
    res.status(500).json({ message: 'Failed to pin comment' });
  }
});

module.exports = router;
