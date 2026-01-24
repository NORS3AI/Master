/**
 * RS News - Cloudflare Workers Entrypoint
 *
 * This worker handles:
 * - Routing requests via Hono framework
 * - D1 Database connections
 * - Analytics Engine events
 * - Performance monitoring
 * - Caching strategies
 * - Phase 4 features (4.1-4.6)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

// Phase 4.1 - Email & Notifications
import { registerNotificationRoutes } from '../routes/notifications.js';
import { registerEmailRoutes } from '../routes/email.js';

// Phase 4.2 - Advanced UX & Personalization
import { registerPreferenceRoutes } from '../routes/preferences.js';

// Phase 4.3 - Technical Enhancements (Security)
import { registerSecurityRoutes } from '../routes/security.js';

// Phase 4.4 - Community Features
import { registerForumRoutes } from '../routes/forums.js';

// Phase 4.5 - Search & Discovery
import { registerSearchRoutes } from '../routes/search.js';

// Phase 4.6 - Mobile & PWA
import { registerPWARoutes } from '../routes/pwa.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['https://rsnewsroom.nors3ai.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

app.use('*', secureHeaders());

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();

  // Log to Analytics Engine
  if (c.env.ANALYTICS) {
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        indexes: [new URL(c.req.url).hostname, c.req.method, new URL(c.req.url).pathname],
        blobs: [c.req.header('user-agent') || 'unknown'],
        doubles: [Date.now()]
      })
    );
  }

  await next();

  // Log response time
  const duration = Date.now() - start;
  c.res.headers.set('X-Response-Time', `${duration}ms`);
});

// Authentication middleware - extracts userId from Authorization header
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Validate token and get userId
    // In production, verify JWT or session token
    try {
      if (c.env.DB) {
        const session = await c.env.DB.prepare(
          'SELECT userId FROM user_sessions WHERE token = ? AND expiresAt > ?'
        ).bind(token, Date.now()).first();

        if (session) {
          c.set('userId', session.userId);
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
    }
  }

  await next();
});

// Admin check middleware for admin routes
const adminMiddleware = async (c, next) => {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    c.set('userRole', user.role);
  } catch (error) {
    return c.json({ error: 'Authorization check failed' }, 500);
  }

  await next();
};

// Health check endpoint
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown',
    phase4: 'active'
  };

  if (c.env.DB) {
    try {
      await c.env.DB.prepare('SELECT 1').first();
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
  }

  if (c.env.ANALYTICS) {
    health.analytics = 'connected';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
});

// Core API routes

// GET /api/articles - List articles
app.get('/api/articles', async (c) => {
  if (!c.env.DB) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  try {
    const { page = 1, limit = 20, category, status = 'published' } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT a.*, u.username as authorName
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      WHERE a.status = ?
    `;
    const params = [status];

    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }

    query += ' ORDER BY a.publishedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const articles = await c.env.DB.prepare(query).bind(...params).all();

    // Get total count
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM articles WHERE status = ?'
    ).bind(status).first();

    return c.json({
      articles: articles.results || [],
      total: countResult?.total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    }, 200, {
      'Cache-Control': 'public, max-age=300'
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch articles' }, 500);
  }
});

// GET /api/articles/:id - Get single article
app.get('/api/articles/:id', async (c) => {
  if (!c.env.DB) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  try {
    const { id } = c.req.param();

    const article = await c.env.DB.prepare(`
      SELECT a.*, u.username as authorName
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      WHERE a.id = ? OR a.slug = ?
    `).bind(id, id).first();

    if (!article) {
      return c.json({ error: 'Article not found' }, 404);
    }

    // Increment view count
    await c.env.DB.prepare(
      'UPDATE articles SET views = views + 1 WHERE id = ?'
    ).bind(article.id).run();

    return c.json(article);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch article' }, 500);
  }
});

// GET /api/categories - List categories
app.get('/api/categories', async (c) => {
  if (!c.env.DB) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  try {
    const categories = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE isActive = 1 ORDER BY sort_order ASC, name ASC'
    ).all();

    return c.json({ categories: categories.results || [] });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Authentication routes

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  if (!c.env.DB) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    // In production, properly hash and verify password
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, role FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create session
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    await c.env.DB.prepare(`
      INSERT INTO user_sessions (id, userId, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), user.id, token, expiresAt, Date.now()).run();

    return c.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token,
      expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ') && c.env.DB) {
    const token = authHeader.substring(7);
    await c.env.DB.prepare(
      'DELETE FROM user_sessions WHERE token = ?'
    ).bind(token).run();
  }

  return c.json({ success: true });
});

// GET /api/auth/me - Get current user
app.get('/api/auth/me', async (c) => {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, role, createdAt FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Analytics endpoint
app.get('/api/analytics', async (c) => {
  if (!c.env.ANALYTICS) {
    return c.json({
      message: 'Analytics data available through Cloudflare dashboard',
      docs: 'https://developers.cloudflare.com/analytics/analytics-engine/'
    });
  }

  return c.json({
    message: 'Analytics Engine connected',
    dashboard: 'https://dash.cloudflare.com'
  });
});

// Register Phase 4 routes
registerNotificationRoutes(app);
registerEmailRoutes(app);
registerPreferenceRoutes(app);
registerSecurityRoutes(app);
registerForumRoutes(app);
registerSearchRoutes(app);
registerPWARoutes(app);

// Homepage
app.get('/', async (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RS News - Mail & Parcel Service News</title>
  <link rel="manifest" href="/api/pwa/manifest">
  <meta name="theme-color" content="#3498db">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 1.25rem;
      color: #a0a0a0;
      margin-bottom: 2rem;
    }
    .status {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .status-item:last-child { border-bottom: none; }
    .badge {
      background: #00d4ff;
      color: #1a1a2e;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge.active { background: #22c55e; color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>RS News</h1>
    <p class="subtitle">Mail & Parcel Service News Platform</p>
    <p>Your comprehensive source for shipping industry updates, delivered at the edge.</p>
    <div class="status">
      <div class="status-item">
        <span>Platform Status</span>
        <span class="badge">Live</span>
      </div>
      <div class="status-item">
        <span>Edge Locations</span>
        <span class="badge">200+</span>
      </div>
      <div class="status-item">
        <span>Phase 4 Features</span>
        <span class="badge active">Active</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  return c.html(html);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: new URL(c.req.url).pathname }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);

  if (c.env.ANALYTICS) {
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        indexes: ['error', err.name || 'Unknown'],
        blobs: [err.message || 'No message'],
        doubles: [1]
      })
    );
  }

  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,

  async scheduled(event, env, ctx) {
    console.log('Scheduled handler triggered');
    ctx.waitUntil(runScheduledTasks(env));
  }
};

/**
 * Run scheduled maintenance tasks
 */
async function runScheduledTasks(env) {
  console.log('Running scheduled maintenance tasks');

  if (!env.DB) {
    console.log('Database not available for scheduled tasks');
    return;
  }

  try {
    const now = Date.now();

    // Clean up old analytics data (90 days)
    await env.DB.prepare(
      'DELETE FROM analytics_events WHERE createdAt < ?'
    ).bind(now - (90 * 24 * 60 * 60 * 1000)).run();

    // Clean up expired sessions
    await env.DB.prepare(
      'DELETE FROM user_sessions WHERE expiresAt < ?'
    ).bind(now).run();

    // Clean up old notifications (30 days)
    await env.DB.prepare(
      'DELETE FROM notifications WHERE createdAt < ? AND isRead = 1'
    ).bind(now - (30 * 24 * 60 * 60 * 1000)).run();

    // Update trending articles
    await env.DB.prepare(`
      INSERT OR REPLACE INTO trending_articles (id, articleId, score, calculatedAt)
      SELECT
        lower(hex(randomblob(16))),
        id,
        (views * 0.3 + likes * 0.5 + comments * 0.2) * (1 - (? - publishedAt) / 604800000.0),
        ?
      FROM articles
      WHERE status = 'published' AND publishedAt > ?
      ORDER BY score DESC
      LIMIT 50
    `).bind(now, now, now - (7 * 24 * 60 * 60 * 1000)).run();

    // Clean up expired offline sync items
    await env.DB.prepare(
      'DELETE FROM offline_sync WHERE status = ? AND createdAt < ?'
    ).bind('completed', now - (7 * 24 * 60 * 60 * 1000)).run();

    console.log('Scheduled tasks completed successfully');

    if (env.ANALYTICS) {
      env.ANALYTICS.writeDataPoint({
        indexes: ['scheduled', 'maintenance'],
        blobs: ['tasks_completed'],
        doubles: [1]
      });
    }
  } catch (error) {
    console.error('Scheduled task error:', error);
  }
}
