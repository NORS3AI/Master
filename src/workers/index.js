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

      // Default: return 404
      return new Response('Not Found', { status: 404 });

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
