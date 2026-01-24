/**
 * Phase 4.1: Notifications API Routes
 * Handles real-time notifications, preferences, and push subscriptions
 */

// Notification Types
const NOTIFICATION_TYPES = {
  NEW_FOLLOWER: 'new_follower',
  NEW_COMMENT: 'new_comment',
  COMMENT_REPLY: 'comment_reply',
  ARTICLE_PUBLISHED: 'article_published',
  MENTION: 'mention',
  BADGE_EARNED: 'badge_earned',
  ARTICLE_FEATURED: 'article_featured',
  LEVEL_UP: 'level_up',
  SYSTEM: 'system'
};

/**
 * Register notification routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerNotificationRoutes(app) {

  // GET /api/notifications - Get user's notifications
  app.get('/api/notifications', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { page = 1, limit = 20, unreadOnly = 'false' } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT * FROM notifications
        WHERE userId = ?
      `;
      const params = [userId];

      if (unreadOnly === 'true') {
        query += ' AND isRead = 0';
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const notifications = await c.env.DB.prepare(query).bind(...params).all();

      // Get unread count
      const unreadCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0'
      ).bind(userId).first();

      return c.json({
        notifications: notifications.results || [],
        unreadCount: unreadCount?.count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return c.json({ error: 'Failed to fetch notifications' }, 500);
    }
  });

  // GET /api/notifications/unread-count - Get unread count only
  app.get('/api/notifications/unread-count', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const result = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0'
      ).bind(userId).first();

      return c.json({ unreadCount: result?.count || 0 });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return c.json({ error: 'Failed to fetch unread count' }, 500);
    }
  });

  // POST /api/notifications/:id/read - Mark notification as read
  app.post('/api/notifications/:id/read', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?'
      ).bind(id, userId).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return c.json({ error: 'Failed to mark notification as read' }, 500);
    }
  });

  // POST /api/notifications/read-all - Mark all notifications as read
  app.post('/api/notifications/read-all', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const result = await c.env.DB.prepare(
        'UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0'
      ).bind(userId).run();

      return c.json({
        success: true,
        markedCount: result.changes || 0
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return c.json({ error: 'Failed to mark notifications as read' }, 500);
    }
  });

  // DELETE /api/notifications/:id - Delete a notification
  app.delete('/api/notifications/:id', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM notifications WHERE id = ? AND userId = ?'
      ).bind(id, userId).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return c.json({ error: 'Failed to delete notification' }, 500);
    }
  });

  // DELETE /api/notifications - Clear all notifications
  app.delete('/api/notifications', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const result = await c.env.DB.prepare(
        'DELETE FROM notifications WHERE userId = ?'
      ).bind(userId).run();

      return c.json({
        success: true,
        deletedCount: result.changes || 0
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return c.json({ error: 'Failed to clear notifications' }, 500);
    }
  });

  // GET /api/notifications/preferences - Get notification preferences
  app.get('/api/notifications/preferences', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let prefs = await c.env.DB.prepare(
        'SELECT * FROM notification_preferences WHERE userId = ?'
      ).bind(userId).first();

      // Return defaults if no preferences exist
      if (!prefs) {
        prefs = {
          userId,
          emailNotifications: true,
          pushNotifications: true,
          emailFrequency: 'instant',
          newFollower: true,
          newComment: true,
          articlePublished: true,
          mentions: true,
          newsletter: true,
          marketingEmails: false,
          quietHoursStart: null,
          quietHoursEnd: null
        };
      }

      return c.json(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return c.json({ error: 'Failed to fetch preferences' }, 500);
    }
  });

  // PATCH /api/notifications/preferences - Update notification preferences
  app.patch('/api/notifications/preferences', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updates = await c.req.json();
      const now = Date.now();

      // Check if preferences exist
      const existing = await c.env.DB.prepare(
        'SELECT userId FROM notification_preferences WHERE userId = ?'
      ).bind(userId).first();

      if (existing) {
        // Build update query dynamically
        const allowedFields = [
          'emailNotifications', 'pushNotifications', 'emailFrequency',
          'newFollower', 'newComment', 'articlePublished', 'mentions',
          'newsletter', 'marketingEmails', 'quietHoursStart', 'quietHoursEnd'
        ];

        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            setClauses.push(`${field} = ?`);
            values.push(updates[field]);
          }
        }

        if (setClauses.length > 0) {
          setClauses.push('updatedAt = ?');
          values.push(now);
          values.push(userId);

          await c.env.DB.prepare(
            `UPDATE notification_preferences SET ${setClauses.join(', ')} WHERE userId = ?`
          ).bind(...values).run();
        }
      } else {
        // Insert new preferences
        await c.env.DB.prepare(`
          INSERT INTO notification_preferences (
            userId, emailNotifications, pushNotifications, emailFrequency,
            newFollower, newComment, articlePublished, mentions,
            newsletter, marketingEmails, quietHoursStart, quietHoursEnd,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          updates.emailNotifications ?? 1,
          updates.pushNotifications ?? 1,
          updates.emailFrequency ?? 'instant',
          updates.newFollower ?? 1,
          updates.newComment ?? 1,
          updates.articlePublished ?? 1,
          updates.mentions ?? 1,
          updates.newsletter ?? 1,
          updates.marketingEmails ?? 0,
          updates.quietHoursStart ?? null,
          updates.quietHoursEnd ?? null,
          now,
          now
        ).run();
      }

      // Fetch and return updated preferences
      const prefs = await c.env.DB.prepare(
        'SELECT * FROM notification_preferences WHERE userId = ?'
      ).bind(userId).first();

      return c.json(prefs);
    } catch (error) {
      console.error('Error updating preferences:', error);
      return c.json({ error: 'Failed to update preferences' }, 500);
    }
  });

  // POST /api/notifications/push/subscribe - Subscribe to push notifications
  app.post('/api/notifications/push/subscribe', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { endpoint, keys, deviceType } = await c.req.json();

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return c.json({ error: 'Invalid push subscription data' }, 400);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      // Upsert subscription
      await c.env.DB.prepare(`
        INSERT INTO push_subscriptions (id, userId, endpoint, p256dh, auth, deviceType, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(userId, endpoint) DO UPDATE SET
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          deviceType = excluded.deviceType
      `).bind(id, userId, endpoint, keys.p256dh, keys.auth, deviceType || null, now).run();

      return c.json({ success: true, subscriptionId: id });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return c.json({ error: 'Failed to subscribe to push notifications' }, 500);
    }
  });

  // DELETE /api/notifications/push/unsubscribe - Unsubscribe from push notifications
  app.delete('/api/notifications/push/unsubscribe', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { endpoint } = await c.req.json();

      if (endpoint) {
        await c.env.DB.prepare(
          'DELETE FROM push_subscriptions WHERE userId = ? AND endpoint = ?'
        ).bind(userId, endpoint).run();
      } else {
        // Unsubscribe all
        await c.env.DB.prepare(
          'DELETE FROM push_subscriptions WHERE userId = ?'
        ).bind(userId).run();
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return c.json({ error: 'Failed to unsubscribe' }, 500);
    }
  });

  // GET /api/notifications/push/status - Check push subscription status
  app.get('/api/notifications/push/status', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const subscriptions = await c.env.DB.prepare(
        'SELECT id, deviceType, createdAt FROM push_subscriptions WHERE userId = ?'
      ).bind(userId).all();

      return c.json({
        subscribed: (subscriptions.results?.length || 0) > 0,
        subscriptions: subscriptions.results || []
      });
    } catch (error) {
      console.error('Error checking push status:', error);
      return c.json({ error: 'Failed to check push status' }, 500);
    }
  });
}

/**
 * Create a notification for a user
 * @param {D1Database} db - The D1 database instance
 * @param {Object} notification - Notification data
 */
async function createNotification(db, { userId, type, title, message, relatedId, relatedType, expiresAt }) {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db.prepare(`
    INSERT INTO notifications (id, userId, type, title, message, relatedId, relatedType, isRead, createdAt, expiresAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).bind(id, userId, type, title, message || null, relatedId || null, relatedType || null, now, expiresAt || null).run();

  return id;
}

/**
 * Create notifications for multiple users (batch)
 * @param {D1Database} db - The D1 database instance
 * @param {Array} notifications - Array of notification objects
 */
async function createBatchNotifications(db, notifications) {
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO notifications (id, userId, type, title, message, relatedId, relatedType, isRead, createdAt, expiresAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  const batch = notifications.map(n =>
    stmt.bind(
      crypto.randomUUID(),
      n.userId,
      n.type,
      n.title,
      n.message || null,
      n.relatedId || null,
      n.relatedType || null,
      now,
      n.expiresAt || null
    )
  );

  await db.batch(batch);
}

export {
  registerNotificationRoutes,
  createNotification,
  createBatchNotifications,
  NOTIFICATION_TYPES
};
