/**
 * RS News - Cloudflare Workers Entrypoint
 *
 * This worker handles:
 * - Routing requests to the Express application
 * - D1 Database connections
 * - Analytics Engine events
 * - Performance monitoring
 * - Caching strategies
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Log request to Analytics Engine
      if (env.ANALYTICS) {
        ctx.waitUntil(
          env.ANALYTICS.writeDataPoint({
            indexes: [url.hostname, request.method, path],
            blobs: [request.headers.get('user-agent') || 'unknown'],
            doubles: [Date.now()]
          })
        );
      }

      // Health check endpoint
      if (path === '/health') {
        return handleHealthCheck(env);
      }

      // API routes with D1 database
      if (path.startsWith('/api/')) {
        return handleAPIRequest(request, env, ctx);
      }

      // Static assets with caching
      if (isStaticAsset(path)) {
        return handleStaticAsset(request, env, ctx);
      }

      // Default: serve homepage
      return handleHomepage(env);

    } catch (error) {
      console.error('Worker error:', error);

      // Log error to Analytics Engine
      if (env.ANALYTICS) {
        ctx.waitUntil(
          env.ANALYTICS.writeDataPoint({
            indexes: ['error', error.name],
            blobs: [error.message],
            doubles: [1]
          })
        );
      }

      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Scheduled handler for daily tasks
   */
  async scheduled(event, env, ctx) {
    console.log('Scheduled handler triggered');

    // Run maintenance tasks
    ctx.waitUntil(runScheduledTasks(env));
  }
};

/**
 * Handle homepage
 */
async function handleHomepage(env) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RS News - Mail & Parcel Service News</title>
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
    .badge.coming { background: #7b2cbf; color: #fff; }
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
        <span class="badge coming">Coming Soon</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * Handle health check
 */
async function handleHealthCheck(env) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'unknown'
  };

  // Check D1 database connection
  if (env.DB) {
    try {
      const result = await env.DB.prepare('SELECT 1').first();
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
  }

  // Check Analytics Engine
  if (env.ANALYTICS) {
    health.analytics = 'connected';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return new Response(JSON.stringify(health), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle API requests with D1 database access
 */
async function handleAPIRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Example: /api/articles endpoint
  if (path === '/api/articles' && request.method === 'GET') {
    return handleGetArticles(env);
  }

  // Example: /api/analytics endpoint
  if (path.startsWith('/api/analytics') && request.method === 'GET') {
    return handleAnalyticsQuery(env, path);
  }

  // Fallback
  return new Response(
    JSON.stringify({ error: 'API endpoint not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Get articles from D1 database
 */
async function handleGetArticles(env) {
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const articles = await env.DB
      .prepare('SELECT id, title, description, authorId, publishedAt FROM articles ORDER BY publishedAt DESC LIMIT 50')
      .all();

    return new Response(JSON.stringify(articles), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch articles' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle analytics queries
 */
async function handleAnalyticsQuery(env, path) {
  if (!env.ANALYTICS) {
    return new Response(
      JSON.stringify({ error: 'Analytics Engine not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Analytics data will be aggregated by Cloudflare
  // This is just a placeholder endpoint
  return new Response(
    JSON.stringify({
      message: 'Analytics data available through Cloudflare dashboard',
      docs: 'https://developers.cloudflare.com/analytics/analytics-engine/'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(path) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ico'];
  return staticExtensions.some(ext => path.endsWith(ext));
}

/**
 * Handle static assets with appropriate caching
 */
async function handleStaticAsset(request, env, ctx) {
  // This would normally fetch from your origin server
  // For now, return 404
  return new Response('Static asset not found', { status: 404 });
}

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
    // Example: Clean up old analytics data
    const result = await env.DB.prepare(
      'DELETE FROM analytics_events WHERE createdAt < datetime("now", "-90 days")'
    ).run();

    console.log(`Cleaned up old analytics data: ${result.success ? 'Success' : 'Failed'}`);

    // Example: Update trending articles
    // await updateTrendingArticles(env.DB);

    // Log to Analytics Engine
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
