const AnalyticsEvent = require('../models/AnalyticsEvent');

/**
 * Middleware to track analytics events
 * Usage: app.use(analyticsMiddleware())
 */
function analyticsMiddleware() {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;

    // Override res.end to track after response is sent
    res.end = function(chunk, encoding) {
      res.end = originalEnd;

      // Log analytics event based on route/action
      if (req.user) {
        const event = getEventFromRequest(req);
        if (event) {
          AnalyticsEvent.create({
            eventType: event.type,
            userId: req.user.id,
            resourceId: event.resourceId,
            resourceType: event.resourceType,
            metadata: event.metadata,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
          }).catch(err => console.error('Analytics logging error:', err));
        }
      }

      res.end(chunk, encoding);
    };

    next();
  };
}

/**
 * Extract event data from request
 */
function getEventFromRequest(req) {
  const { method, path, body, params } = req;

  // Article view tracking
  if (method === 'GET' && path.includes('/articles/') && !path.includes('/api')) {
    return {
      type: 'article_view',
      resourceId: params.id,
      resourceType: 'Article',
      metadata: {
        path: path
      }
    };
  }

  // Comment creation
  if (method === 'POST' && path.includes('/api/comments')) {
    return {
      type: 'comment',
      resourceId: body.articleId,
      resourceType: 'Article',
      metadata: {
        commentText: body.content?.substring(0, 100)
      }
    };
  }

  // Favorite action
  if (method === 'POST' && path.includes('/api/articles') && path.includes('favorite')) {
    return {
      type: 'favorite',
      resourceId: params.articleId || params.id,
      resourceType: 'Article'
    };
  }

  // Follow action
  if (method === 'POST' && path.includes('/api/follows')) {
    return {
      type: 'follow',
      resourceId: params.userId || body.followingId,
      resourceType: 'User'
    };
  }

  // Share action
  if (method === 'POST' && path.includes('share')) {
    return {
      type: 'share',
      resourceId: params.articleId || params.id,
      resourceType: 'Article',
      metadata: {
        platform: body.platform
      }
    };
  }

  // Badge earned
  if (method === 'POST' && path.includes('/api/badges') && path.includes('check')) {
    return {
      type: 'badge_earned',
      resourceId: params.badgeId,
      resourceType: 'Badge'
    };
  }

  return null;
}

/**
 * Utility function to manually log an event
 */
async function logEvent(userId, eventType, resourceId, resourceType, metadata = {}) {
  try {
    await AnalyticsEvent.create({
      eventType,
      userId,
      resourceId,
      resourceType,
      metadata,
      createdAt: new Date()
    });
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

/**
 * Utility function to log audit action
 */
async function logAuditAction(adminId, action, resourceType, resourceId, changes, reason, ipAddress) {
  const AuditLog = require('../models/AuditLog');
  try {
    await AuditLog.create({
      adminId,
      action,
      resourceType,
      resourceId,
      changes,
      reason,
      ipAddress,
      status: 'success'
    });
  } catch (err) {
    console.error('Error logging audit action:', err);
  }
}

module.exports = {
  analyticsMiddleware,
  logEvent,
  logAuditAction
};
