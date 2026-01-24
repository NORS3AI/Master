/**
 * Phase 4.6: PWA & Offline Routes
 * Handles service worker sync, offline reading, and device management
 */

/**
 * Register PWA routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerPWARoutes(app) {

  // GET /api/pwa/manifest - Get PWA manifest
  app.get('/api/pwa/manifest', async (c) => {
    const manifest = {
      name: 'RS News',
      short_name: 'RS News',
      description: 'Your personalized mail and parcel industry news platform',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      theme_color: '#3498db',
      background_color: '#ffffff',
      scope: '/',
      icons: [
        {
          src: '/images/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/images/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/images/icon-maskable-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      categories: ['news', 'business'],
      shortcuts: [
        { name: 'Search', url: '/search' },
        { name: 'Trending', url: '/trending' }
      ]
    };

    return c.json(manifest);
  });

  // POST /api/pwa/sync - Queue offline action for sync
  app.post('/api/pwa/sync', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { actionType, targetId, targetType, payload } = await c.req.json();

      if (!actionType) {
        return c.json({ error: 'Action type is required' }, 400);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO offline_sync (id, userId, actionType, targetId, targetType, payload, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).bind(id, userId, actionType, targetId || null, targetType || null, payload ? JSON.stringify(payload) : null, now).run();

      return c.json({ syncId: id, queued: true });
    } catch (error) {
      console.error('Error queueing sync:', error);
      return c.json({ error: 'Failed to queue sync' }, 500);
    }
  });

  // GET /api/pwa/sync/status/:syncId - Check sync status
  app.get('/api/pwa/sync/status/:syncId', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { syncId } = c.req.param();

      const sync = await c.env.DB.prepare(
        'SELECT status, error, syncedAt FROM offline_sync WHERE id = ? AND userId = ?'
      ).bind(syncId, userId).first();

      if (!sync) {
        return c.json({ error: 'Sync not found' }, 404);
      }

      return c.json(sync);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      return c.json({ error: 'Failed to fetch sync status' }, 500);
    }
  });

  // GET /api/pwa/offline-queue - Get pending sync items
  app.get('/api/pwa/offline-queue', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const queue = await c.env.DB.prepare(`
        SELECT * FROM offline_sync WHERE userId = ? AND status = 'pending'
        ORDER BY createdAt ASC
      `).bind(userId).all();

      return c.json({
        queue: (queue.results || []).map(item => ({
          ...item,
          payload: item.payload ? JSON.parse(item.payload) : null
        }))
      });
    } catch (error) {
      console.error('Error fetching offline queue:', error);
      return c.json({ error: 'Failed to fetch queue' }, 500);
    }
  });

  // POST /api/pwa/offline-queue/:id/retry - Retry failed sync
  app.post('/api/pwa/offline-queue/:id/retry', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(`
        UPDATE offline_sync SET status = 'pending', attemptCount = attemptCount + 1, lastAttempt = ?
        WHERE id = ? AND userId = ?
      `).bind(Date.now(), id, userId).run();

      return c.json({ success: true, status: 'pending' });
    } catch (error) {
      console.error('Error retrying sync:', error);
      return c.json({ error: 'Failed to retry' }, 500);
    }
  });

  // DELETE /api/pwa/offline-queue/:id - Remove from queue
  app.delete('/api/pwa/offline-queue/:id', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM offline_sync WHERE id = ? AND userId = ?'
      ).bind(id, userId).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error removing from queue:', error);
      return c.json({ error: 'Failed to remove' }, 500);
    }
  });

  // GET /api/pwa/cache/stats - Get cache statistics
  app.get('/api/pwa/cache/stats', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const cache = await c.env.DB.prepare(
        'SELECT totalSize, maxSize, cacheVersion, lastCleanup FROM service_worker_cache WHERE userId = ?'
      ).bind(userId).first();

      if (!cache) {
        return c.json({
          totalSize: 0,
          maxSize: 52428800, // 50MB
          itemCount: 0,
          cacheVersion: 'v1'
        });
      }

      return c.json({
        totalSize: cache.totalSize || 0,
        maxSize: cache.maxSize || 52428800,
        cacheVersion: cache.cacheVersion,
        lastCleanup: cache.lastCleanup
      });
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      return c.json({ error: 'Failed to fetch cache stats' }, 500);
    }
  });

  // POST /api/pwa/cache/articles - Download articles for offline
  app.post('/api/pwa/cache/articles', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { articleIds } = await c.req.json();

      if (!articleIds || !Array.isArray(articleIds)) {
        return c.json({ error: 'Article IDs required' }, 400);
      }

      // Get articles
      const placeholders = articleIds.map(() => '?').join(',');
      const articles = await c.env.DB.prepare(`
        SELECT * FROM articles WHERE id IN (${placeholders})
      `).bind(...articleIds).all();

      // Calculate total size (rough estimate)
      let totalSize = 0;
      for (const article of articles.results || []) {
        totalSize += (article.content?.length || 0) + (article.title?.length || 0);
      }

      // Update cache record
      const now = Date.now();
      await c.env.DB.prepare(`
        INSERT INTO service_worker_cache (id, userId, cacheVersion, cacheType, cachedItems, totalSize, createdAt, updatedAt)
        VALUES (?, ?, 'v1', 'articles', ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          cachedItems = excluded.cachedItems,
          totalSize = excluded.totalSize,
          updatedAt = excluded.updatedAt
      `).bind(
        crypto.randomUUID(),
        userId,
        JSON.stringify(articleIds.map(id => ({ url: `/articles/${id}`, cached: now }))),
        totalSize,
        now,
        now
      ).run();

      return c.json({
        downloadedCount: articles.results?.length || 0,
        totalSize,
        articles: articles.results || []
      });
    } catch (error) {
      console.error('Error caching articles:', error);
      return c.json({ error: 'Failed to cache articles' }, 500);
    }
  });

  // POST /api/pwa/cache/clear - Clear cache
  app.post('/api/pwa/cache/clear', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await c.env.DB.prepare(
        'DELETE FROM service_worker_cache WHERE userId = ?'
      ).bind(userId).run();

      return c.json({ cleared: true });
    } catch (error) {
      console.error('Error clearing cache:', error);
      return c.json({ error: 'Failed to clear cache' }, 500);
    }
  });

  // POST /api/reading/progress/:articleId - Save reading progress
  app.post('/api/reading/progress/:articleId', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { articleId } = c.req.param();
      const { position, timeSpent, isOffline } = await c.req.json();

      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO reading_progress (id, userId, articleId, currentPosition, timeSpent, lastReadAt, isOffline, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(userId, articleId) DO UPDATE SET
          currentPosition = excluded.currentPosition,
          timeSpent = reading_progress.timeSpent + excluded.timeSpent,
          lastReadAt = excluded.lastReadAt,
          isOffline = excluded.isOffline
      `).bind(
        crypto.randomUUID(),
        userId,
        articleId,
        position || 0,
        timeSpent || 0,
        now,
        isOffline ? 1 : 0,
        now
      ).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error saving reading progress:', error);
      return c.json({ error: 'Failed to save progress' }, 500);
    }
  });

  // GET /api/reading/progress/:articleId - Get reading progress
  app.get('/api/reading/progress/:articleId', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { articleId } = c.req.param();

      const progress = await c.env.DB.prepare(
        'SELECT currentPosition, timeSpent, lastReadAt FROM reading_progress WHERE userId = ? AND articleId = ?'
      ).bind(userId, articleId).first();

      if (!progress) {
        return c.json({ position: 0, timeSpent: 0, lastReadAt: null });
      }

      return c.json({
        position: progress.currentPosition,
        timeSpent: progress.timeSpent,
        lastReadAt: progress.lastReadAt
      });
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      return c.json({ error: 'Failed to fetch progress' }, 500);
    }
  });

  // GET /api/reading/continue - Get articles to continue reading
  app.get('/api/reading/continue', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { limit = 10 } = c.req.query();

      const progress = await c.env.DB.prepare(`
        SELECT rp.*, a.title, a.slug, a.description, a.category
        FROM reading_progress rp
        JOIN articles a ON rp.articleId = a.id
        WHERE rp.userId = ? AND rp.currentPosition < 100
        ORDER BY rp.lastReadAt DESC
        LIMIT ?
      `).bind(userId, parseInt(limit)).all();

      return c.json({
        articles: progress.results || []
      });
    } catch (error) {
      console.error('Error fetching continue reading:', error);
      return c.json({ error: 'Failed to fetch' }, 500);
    }
  });

  // POST /api/devices/register - Register device
  app.post('/api/devices/register', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { deviceId, deviceType, osName, osVersion, browserName, screenWidth, screenHeight, supportsPWA, supportsServiceWorker, supportsPushNotifications } = await c.req.json();

      if (!deviceId) {
        return c.json({ error: 'Device ID is required' }, 400);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO device_info (id, userId, deviceId, deviceType, osName, osVersion, browserName, screenWidth, screenHeight, supportsPWA, supportsServiceWorker, supportsPushNotifications, lastActiveAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(deviceId) DO UPDATE SET
          lastActiveAt = excluded.lastActiveAt,
          osVersion = excluded.osVersion,
          browserName = excluded.browserName
      `).bind(
        id,
        userId,
        deviceId,
        deviceType || null,
        osName || null,
        osVersion || null,
        browserName || null,
        screenWidth || null,
        screenHeight || null,
        supportsPWA ? 1 : 0,
        supportsServiceWorker ? 1 : 0,
        supportsPushNotifications ? 1 : 0,
        now,
        now
      ).run();

      return c.json({ success: true, deviceId });
    } catch (error) {
      console.error('Error registering device:', error);
      return c.json({ error: 'Failed to register device' }, 500);
    }
  });

  // GET /api/devices - Get user's devices
  app.get('/api/devices', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const devices = await c.env.DB.prepare(
        'SELECT * FROM device_info WHERE userId = ? ORDER BY lastActiveAt DESC'
      ).bind(userId).all();

      return c.json({
        devices: devices.results || []
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
      return c.json({ error: 'Failed to fetch devices' }, 500);
    }
  });

  // DELETE /api/devices/:deviceId - Unregister device
  app.delete('/api/devices/:deviceId', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { deviceId } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM device_info WHERE deviceId = ? AND userId = ?'
      ).bind(deviceId, userId).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error unregistering device:', error);
      return c.json({ error: 'Failed to unregister device' }, 500);
    }
  });

  // POST /api/pwa/installed - Track PWA installation
  app.post('/api/pwa/installed', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Log installation event
      await c.env.DB.prepare(`
        INSERT INTO analytics_events (id, userId, eventType, metadata, createdAt)
        VALUES (?, ?, 'pwa_installed', '{}', ?)
      `).bind(crypto.randomUUID(), userId, Date.now()).run();

      return c.json({ installed: true });
    } catch (error) {
      console.error('Error tracking installation:', error);
      return c.json({ error: 'Failed to track installation' }, 500);
    }
  });

  // GET /api/pwa/status - Get PWA status
  app.get('/api/pwa/status', async (c) => {
    return c.json({
      supported: true,
      serviceWorkerUrl: '/service-worker.js',
      manifestUrl: '/api/pwa/manifest',
      version: '1.0.0'
    });
  });
}

export { registerPWARoutes };
