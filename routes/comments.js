const express = require('express');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all comments for an article
router.get('/article/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({
      articleId: req.params.articleId,
      isApproved: true
    })
      .populate('userId', 'username profileImage')
      .sort({ isPinned: -1, likes: -1, createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Create a new comment
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { articleId, content } = req.body;

    if (!articleId || !content) {
      return res.status(400).json({ message: 'Article ID and content required' });
    }

    if (content.length < 3 || content.length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 3 and 1000 characters' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = new Comment({
      articleId,
      userId: req.session.userId,
      username: user.username,
      userImage: user.profileImage,
      content
    });

    await comment.save();

    res.status(201).json({
      message: 'Comment posted successfully',
      comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

// Like a comment
router.post('/:id/like', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likedBy.includes(userId);

    if (hasLiked) {
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
      comment.likes--;
    } else {
      comment.likedBy.push(userId);
      comment.likes++;
    }

    await comment.save();

    res.json({
      message: hasLiked ? 'Like removed' : 'Like added',
      likes: comment.likes,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
});

// Delete a comment (owner only)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// Edit a comment (owner only)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.length < 3 || content.length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 3 and 1000 characters' });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Get all pending comments (admin only - future implementation)
router.get('/admin/pending', isAuthenticated, async (req, res) => {
  try {
    const comments = await Comment.find({ isApproved: false })
      .populate('userId', 'username email')
      .populate('articleId', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({ message: 'Failed to fetch pending comments' });
  }
});

// Approve a comment (admin only - future implementation)
router.post('/:id/approve', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment approved', comment });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ message: 'Failed to approve comment' });
  }
});

module.exports = router;
