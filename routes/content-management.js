const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const ArticleRevision = require('../models/ArticleRevision');
const PublishSchedule = require('../models/PublishSchedule');
const ContentDraft = require('../models/ContentDraft');
const ArticleTemplate = require('../models/ArticleTemplate');
const { ensureAuthenticated } = require('../middleware/auth');
const { logAuditAction } = require('../middleware/analyticsMiddleware');

// POST /api/content/articles - Create new article
router.post('/articles', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, content, category, tags, image } = req.body;

    const article = new Article({
      title,
      description,
      content,
      category,
      tags: tags || [],
      image,
      createdBy: req.user.id,
      author: req.user.username
    });

    await article.save();

    // Create first revision
    await ArticleRevision.create({
      articleId: article._id,
      revisionNumber: 1,
      title,
      description,
      content,
      category,
      tags,
      author: req.user.id,
      createdBy: req.user.id,
      changes: { summary: 'Initial creation' }
    });

    // Log audit action
    await logAuditAction(req.user.id, 'article_created', 'Article', article._id, null, 'New article created');

    res.json({ success: true, article });
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/drafts - Get user's drafts
router.get('/drafts', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const drafts = await ContentDraft.find({ authorId: req.user.id })
      .sort({ lastEditedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ContentDraft.countDocuments({ authorId: req.user.id });

    res.json({
      success: true,
      drafts,
      pagination: { current: page, total: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Error fetching drafts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/drafts - Save new draft
router.post('/drafts', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, content, category, tags, image } = req.body;

    const draft = new ContentDraft({
      authorId: req.user.id,
      title,
      description,
      content,
      category,
      tags,
      image,
      status: 'draft'
    });

    await draft.save();

    res.json({ success: true, draft });
  } catch (err) {
    console.error('Error creating draft:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/content/drafts/:draftId - Update draft (auto-save)
router.patch('/drafts/:draftId', ensureAuthenticated, async (req, res) => {
  try {
    const draft = await ContentDraft.findById(req.params.draftId);

    if (!draft || draft.authorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Save auto-save version (limit to last 10)
    if (draft.autoSaveVersions && draft.autoSaveVersions.length >= 10) {
      draft.autoSaveVersions.shift();
    }

    if (!draft.autoSaveVersions) draft.autoSaveVersions = [];
    draft.autoSaveVersions.push({
      content: draft.content,
      savedAt: new Date()
    });

    // Update fields
    Object.assign(draft, req.body);
    draft.lastEditedAt = new Date();
    draft.autoSaveCount = (draft.autoSaveCount || 0) + 1;

    await draft.save();

    res.json({ success: true, draft });
  } catch (err) {
    console.error('Error updating draft:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/articles/:articleId/publish - Publish article
router.post('/articles/:articleId/publish', ensureAuthenticated, async (req, res) => {
  try {
    const { scheduleDate, scheduleTime, timezone, socialMediaShare } = req.body;
    const article = await Article.findById(req.params.articleId);

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    if (scheduleDate) {
      // Schedule for future publish
      const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime || '09:00'}`);

      const schedule = new PublishSchedule({
        articleId: article._id,
        scheduledDate: scheduleDateTime,
        scheduledTime: scheduleTime || '09:00',
        timezone: timezone || 'UTC',
        status: 'scheduled',
        createdBy: req.user.id,
        socialMediaShare: socialMediaShare !== false
      });

      await schedule.save();

      res.json({ success: true, message: 'Article scheduled for publishing', schedule });
    } else {
      // Publish immediately
      article.published = true;
      article.publishedDate = new Date();
      await article.save();

      // Log audit
      await logAuditAction(req.user.id, 'article_published', 'Article', article._id, null, 'Article published');

      res.json({ success: true, message: 'Article published immediately', article });
    }
  } catch (err) {
    console.error('Error publishing article:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/articles/:articleId/revisions - Get revision history
router.get('/articles/:articleId/revisions', async (req, res) => {
  try {
    const revisions = await ArticleRevision.find({ articleId: req.params.articleId })
      .sort({ revisionNumber: -1 })
      .populate('createdBy', 'username')
      .lean();

    res.json({ success: true, revisions });
  } catch (err) {
    console.error('Error fetching revisions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/articles/:articleId/revisions/:revisionId - Get specific revision
router.get('/articles/:articleId/revisions/:revisionId', async (req, res) => {
  try {
    const revision = await ArticleRevision.findById(req.params.revisionId)
      .populate('createdBy', 'username')
      .lean();

    res.json({ success: true, revision });
  } catch (err) {
    console.error('Error fetching revision:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/articles/:articleId/revert - Revert to revision
router.post('/articles/:articleId/revert', ensureAuthenticated, async (req, res) => {
  try {
    const { revisionId } = req.body;
    const revision = await ArticleRevision.findById(revisionId);
    const article = await Article.findById(req.params.articleId);

    if (!revision || !article) {
      return res.status(404).json({ success: false, error: 'Revision or article not found' });
    }

    // Create new revision record
    const newRevisionNumber = (await ArticleRevision.findOne({ articleId: article._id })
      .sort({ revisionNumber: -1 })).revisionNumber + 1;

    const newRevision = await ArticleRevision.create({
      articleId: article._id,
      revisionNumber: newRevisionNumber,
      title: revision.title,
      description: revision.description,
      content: revision.content,
      category: revision.category,
      tags: revision.tags,
      author: revision.author,
      createdBy: req.user.id,
      changes: { summary: `Reverted from revision ${revision.revisionNumber}` }
    });

    // Update article
    article.title = revision.title;
    article.description = revision.description;
    article.content = revision.content;
    article.category = revision.category;
    article.tags = revision.tags;
    await article.save();

    // Log audit
    await logAuditAction(req.user.id, 'article_updated', 'Article', article._id, null, `Reverted to revision ${revision.revisionNumber}`);

    res.json({ success: true, message: 'Article reverted', article, newRevision });
  } catch (err) {
    console.error('Error reverting article:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/scheduled - Get all scheduled articles
router.get('/scheduled', async (req, res) => {
  try {
    const scheduled = await PublishSchedule.find({ status: 'scheduled' })
      .populate('articleId', 'title')
      .sort({ scheduledDate: 1 })
      .lean();

    res.json({ success: true, scheduled });
  } catch (err) {
    console.error('Error fetching scheduled articles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/content/articles/:articleId/schedule - Cancel scheduled publish
router.delete('/articles/:articleId/schedule', ensureAuthenticated, async (req, res) => {
  try {
    const schedule = await PublishSchedule.findOneAndUpdate(
      { articleId: req.params.articleId, status: 'scheduled' },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message: 'Publishing schedule cancelled', schedule });
  } catch (err) {
    console.error('Error cancelling schedule:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/calendar - Content calendar view
router.get('/calendar', async (req, res) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const scheduled = await PublishSchedule.find({
      scheduledDate: { $gte: startDate, $lte: endDate },
      status: 'scheduled'
    })
      .populate('articleId', 'title')
      .lean();

    const published = await Article.find({
      publishedDate: { $gte: startDate, $lte: endDate }
    })
      .select('title publishedDate')
      .lean();

    const calendar = {
      scheduled: scheduled.map(s => ({
        date: s.scheduledDate,
        title: s.articleId?.title,
        type: 'scheduled'
      })),
      published: published.map(p => ({
        date: p.publishedDate,
        title: p.title,
        type: 'published'
      }))
    };

    res.json({ success: true, calendar });
  } catch (err) {
    console.error('Error fetching calendar:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/templates - Get all templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await ArticleTemplate.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, templates });
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/templates - Create template
router.post('/templates', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, category, structure, content, tags, isPublic } = req.body;

    const template = new ArticleTemplate({
      name,
      description,
      category,
      structure,
      content,
      tags,
      isPublic: isPublic || false,
      createdBy: req.user.id
    });

    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    console.error('Error creating template:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/templates/:templateId/use - Create article from template
router.post('/templates/:templateId/use', ensureAuthenticated, async (req, res) => {
  try {
    const template = await ArticleTemplate.findById(req.params.templateId);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const draft = new ContentDraft({
      authorId: req.user.id,
      title: `${template.name} - New Article`,
      content: template.content,
      category: template.category,
      tags: template.tags,
      status: 'draft'
    });

    await draft.save();

    // Increment usage count
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    res.json({ success: true, draft, message: 'Article created from template' });
  } catch (err) {
    console.error('Error creating article from template:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/bulk-publish - Publish multiple articles
router.post('/bulk-publish', ensureAuthenticated, async (req, res) => {
  try {
    const { articleIds } = req.body;

    const articles = await Article.updateMany(
      { _id: { $in: articleIds } },
      { published: true, publishedDate: new Date() }
    );

    // Log audit
    await logAuditAction(req.user.id, 'article_published', 'Article', null, null, `Bulk published ${articleIds.length} articles`);

    res.json({ success: true, message: `${articles.modifiedCount} articles published`, articles });
  } catch (err) {
    console.error('Error bulk publishing:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/bulk-unpublish - Unpublish multiple articles
router.post('/bulk-unpublish', ensureAuthenticated, async (req, res) => {
  try {
    const { articleIds } = req.body;

    const articles = await Article.updateMany(
      { _id: { $in: articleIds } },
      { published: false }
    );

    // Log audit
    await logAuditAction(req.user.id, 'article_updated', 'Article', null, null, `Bulk unpublished ${articleIds.length} articles`);

    res.json({ success: true, message: `${articles.modifiedCount} articles unpublished`, articles });
  } catch (err) {
    console.error('Error bulk unpublishing:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
