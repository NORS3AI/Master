/**
 * Phase 4.2: User Preferences & Personalization Routes
 * Handles user preferences, themes, feeds, and recommendations
 */

/**
 * Register preference routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerPreferenceRoutes(app) {

  // GET /api/preferences - Get user preferences
  app.get('/api/preferences', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let prefs = await c.env.DB.prepare(
        'SELECT * FROM user_preferences WHERE userId = ?'
      ).bind(userId).first();

      if (!prefs) {
        // Return defaults
        prefs = {
          userId,
          interests: {},
          excludeTopics: [],
          contentTypePreferences: { articles: true, videos: true },
          readingTimeAvailability: 'moderate',
          languagePreference: 'en',
          sourcePreferences: {},
          feedAlgorithm: 'personalized'
        };
      } else {
        prefs.interests = JSON.parse(prefs.interests || '{}');
        prefs.excludeTopics = JSON.parse(prefs.excludeTopics || '[]');
        prefs.contentTypePreferences = JSON.parse(prefs.contentTypePreferences || '{}');
        prefs.sourcePreferences = JSON.parse(prefs.sourcePreferences || '{}');
      }

      return c.json(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return c.json({ error: 'Failed to fetch preferences' }, 500);
    }
  });

  // PATCH /api/preferences - Update user preferences
  app.patch('/api/preferences', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updates = await c.req.json();
      const now = Date.now();

      const existing = await c.env.DB.prepare(
        'SELECT userId FROM user_preferences WHERE userId = ?'
      ).bind(userId).first();

      if (existing) {
        const allowedFields = [
          'interests', 'excludeTopics', 'contentTypePreferences',
          'readingTimeAvailability', 'languagePreference', 'sourcePreferences', 'feedAlgorithm'
        ];

        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            setClauses.push(`${field} = ?`);
            if (typeof updates[field] === 'object') {
              values.push(JSON.stringify(updates[field]));
            } else {
              values.push(updates[field]);
            }
          }
        }

        if (setClauses.length > 0) {
          setClauses.push('updatedAt = ?');
          values.push(now);
          values.push(userId);

          await c.env.DB.prepare(
            `UPDATE user_preferences SET ${setClauses.join(', ')} WHERE userId = ?`
          ).bind(...values).run();
        }
      } else {
        await c.env.DB.prepare(`
          INSERT INTO user_preferences (
            userId, interests, excludeTopics, contentTypePreferences,
            readingTimeAvailability, languagePreference, sourcePreferences, feedAlgorithm,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          JSON.stringify(updates.interests || {}),
          JSON.stringify(updates.excludeTopics || []),
          JSON.stringify(updates.contentTypePreferences || {}),
          updates.readingTimeAvailability || 'moderate',
          updates.languagePreference || 'en',
          JSON.stringify(updates.sourcePreferences || {}),
          updates.feedAlgorithm || 'personalized',
          now,
          now
        ).run();
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return c.json({ error: 'Failed to update preferences' }, 500);
    }
  });

  // POST /api/preferences/interests/:category - Set interest level
  app.post('/api/preferences/interests/:category', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { category } = c.req.param();
      const { level } = await c.req.json();

      if (!level || level < 1 || level > 5) {
        return c.json({ error: 'Level must be between 1 and 5' }, 400);
      }

      const prefs = await c.env.DB.prepare(
        'SELECT interests FROM user_preferences WHERE userId = ?'
      ).bind(userId).first();

      let interests = prefs ? JSON.parse(prefs.interests || '{}') : {};
      interests[category] = { level, weight: level * 20, lastUpdated: Date.now() };

      const now = Date.now();

      if (prefs) {
        await c.env.DB.prepare(
          'UPDATE user_preferences SET interests = ?, updatedAt = ? WHERE userId = ?'
        ).bind(JSON.stringify(interests), now, userId).run();
      } else {
        await c.env.DB.prepare(`
          INSERT INTO user_preferences (userId, interests, createdAt, updatedAt)
          VALUES (?, ?, ?, ?)
        `).bind(userId, JSON.stringify(interests), now, now).run();
      }

      return c.json({ success: true, interest: interests[category] });
    } catch (error) {
      console.error('Error setting interest:', error);
      return c.json({ error: 'Failed to set interest' }, 500);
    }
  });

  // DELETE /api/preferences/interests/:category - Remove interest
  app.delete('/api/preferences/interests/:category', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { category } = c.req.param();

      const prefs = await c.env.DB.prepare(
        'SELECT interests FROM user_preferences WHERE userId = ?'
      ).bind(userId).first();

      if (prefs) {
        const interests = JSON.parse(prefs.interests || '{}');
        delete interests[category];

        await c.env.DB.prepare(
          'UPDATE user_preferences SET interests = ?, updatedAt = ? WHERE userId = ?'
        ).bind(JSON.stringify(interests), Date.now(), userId).run();
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error removing interest:', error);
      return c.json({ error: 'Failed to remove interest' }, 500);
    }
  });

  // POST /api/preferences/reset - Reset preferences to default
  app.post('/api/preferences/reset', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await c.env.DB.prepare(
        'DELETE FROM user_preferences WHERE userId = ?'
      ).bind(userId).run();

      return c.json({ success: true, message: 'Preferences reset to defaults' });
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return c.json({ error: 'Failed to reset preferences' }, 500);
    }
  });

  // GET /api/theme - Get user theme preferences
  app.get('/api/theme', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let theme = await c.env.DB.prepare(
        'SELECT * FROM user_theme_preferences WHERE userId = ?'
      ).bind(userId).first();

      if (!theme) {
        theme = {
          userId,
          themeMode: 'auto',
          colorScheme: 'default',
          fontFamily: 'sans-serif',
          fontSize: 100,
          lineHeight: 1.5,
          contentWidth: 'medium',
          layoutStyle: 'spacious',
          customColors: null,
          sidebarCollapsed: false,
          animations: 'full',
          highContrast: false
        };
      } else {
        theme.customColors = theme.customColors ? JSON.parse(theme.customColors) : null;
      }

      return c.json(theme);
    } catch (error) {
      console.error('Error fetching theme:', error);
      return c.json({ error: 'Failed to fetch theme' }, 500);
    }
  });

  // PATCH /api/theme - Update theme preferences
  app.patch('/api/theme', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updates = await c.req.json();
      const now = Date.now();

      const existing = await c.env.DB.prepare(
        'SELECT userId FROM user_theme_preferences WHERE userId = ?'
      ).bind(userId).first();

      const allowedFields = [
        'themeMode', 'colorScheme', 'fontFamily', 'fontSize', 'lineHeight',
        'contentWidth', 'layoutStyle', 'customColors', 'sidebarCollapsed',
        'animations', 'highContrast'
      ];

      if (existing) {
        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            setClauses.push(`${field} = ?`);
            if (field === 'customColors' && typeof updates[field] === 'object') {
              values.push(JSON.stringify(updates[field]));
            } else {
              values.push(updates[field]);
            }
          }
        }

        if (setClauses.length > 0) {
          setClauses.push('updatedAt = ?');
          values.push(now);
          values.push(userId);

          await c.env.DB.prepare(
            `UPDATE user_theme_preferences SET ${setClauses.join(', ')} WHERE userId = ?`
          ).bind(...values).run();
        }
      } else {
        await c.env.DB.prepare(`
          INSERT INTO user_theme_preferences (
            userId, themeMode, colorScheme, fontFamily, fontSize, lineHeight,
            contentWidth, layoutStyle, customColors, sidebarCollapsed, animations, highContrast,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          updates.themeMode || 'auto',
          updates.colorScheme || 'default',
          updates.fontFamily || 'sans-serif',
          updates.fontSize || 100,
          updates.lineHeight || 1.5,
          updates.contentWidth || 'medium',
          updates.layoutStyle || 'spacious',
          updates.customColors ? JSON.stringify(updates.customColors) : null,
          updates.sidebarCollapsed ? 1 : 0,
          updates.animations || 'full',
          updates.highContrast ? 1 : 0,
          now,
          now
        ).run();
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating theme:', error);
      return c.json({ error: 'Failed to update theme' }, 500);
    }
  });

  // GET /api/theme/presets - Get available theme presets
  app.get('/api/theme/presets', async (c) => {
    const presets = [
      { name: 'default', label: 'Default', colors: { primary: '#3498db', background: '#ffffff', text: '#2c3e50' } },
      { name: 'dark', label: 'Dark Mode', colors: { primary: '#3498db', background: '#1a1a1a', text: '#ecf0f1' } },
      { name: 'sepia', label: 'Sepia', colors: { primary: '#b59d7a', background: '#f4efd3', text: '#5c4033' } },
      { name: 'forest', label: 'Forest', colors: { primary: '#27ae60', background: '#f0f5f0', text: '#2c3e50' } },
      { name: 'ocean', label: 'Ocean', colors: { primary: '#1abc9c', background: '#f5f9fa', text: '#2c3e50' } },
      { name: 'sunset', label: 'Sunset', colors: { primary: '#e74c3c', background: '#fdf5f3', text: '#2c3e50' } },
      { name: 'midnight', label: 'Midnight', colors: { primary: '#9b59b6', background: '#1a1a2e', text: '#eaeaea' } },
      { name: 'high-contrast', label: 'High Contrast', colors: { primary: '#000000', background: '#ffffff', text: '#000000' } }
    ];

    return c.json({ presets });
  });

  // GET /api/feed/personalized - Get personalized feed
  app.get('/api/feed/personalized', async (c) => {
    try {
      const userId = c.get('userId');
      const { page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get user preferences if logged in
      let userInterests = {};
      if (userId) {
        const prefs = await c.env.DB.prepare(
          'SELECT interests FROM user_preferences WHERE userId = ?'
        ).bind(userId).first();
        if (prefs) {
          userInterests = JSON.parse(prefs.interests || '{}');
        }
      }

      // Get articles with scoring
      // For now, simple category-based scoring
      const articles = await c.env.DB.prepare(`
        SELECT a.*, u.username as authorName
        FROM articles a
        LEFT JOIN users u ON a.authorId = u.id
        WHERE a.status = 'published'
        ORDER BY a.publishedAt DESC
        LIMIT ? OFFSET ?
      `).bind(parseInt(limit), offset).all();

      // Score and sort by relevance
      const scoredArticles = (articles.results || []).map(article => {
        let score = 0;

        // Interest matching
        if (userInterests[article.category]) {
          score += userInterests[article.category].weight || 20;
        }

        // Freshness (articles from last 24h get boost)
        const hoursSincePublish = (Date.now() - article.publishedAt) / 3600000;
        if (hoursSincePublish < 24) {
          score += Math.max(0, 30 - hoursSincePublish);
        }

        // Engagement
        score += (article.views / 100) * 2;
        score += (article.shares / 10) * 3;

        return { ...article, personalizedScore: score };
      });

      // Sort by personalized score if user has preferences
      if (Object.keys(userInterests).length > 0) {
        scoredArticles.sort((a, b) => b.personalizedScore - a.personalizedScore);
      }

      return c.json({
        articles: scoredArticles,
        page: parseInt(page),
        limit: parseInt(limit),
        algorithm: userId ? 'personalized' : 'latest'
      });
    } catch (error) {
      console.error('Error fetching personalized feed:', error);
      return c.json({ error: 'Failed to fetch feed' }, 500);
    }
  });

  // GET /api/feed/trending - Get trending articles
  app.get('/api/feed/trending', async (c) => {
    try {
      const { period = 'day', category, page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT t.*, a.title, a.slug, a.description, a.category, a.authorId, u.username as authorName
        FROM trending_articles t
        JOIN articles a ON t.articleId = a.id
        LEFT JOIN users u ON a.authorId = u.id
        WHERE t.expiresAt > ?
      `;
      const params = [Date.now()];

      if (category) {
        query += ' AND t.category = ?';
        params.push(category);
      }

      query += ' ORDER BY t.trendingScore DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const trending = await c.env.DB.prepare(query).bind(...params).all();

      return c.json({
        articles: trending.results || [],
        period,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching trending feed:', error);
      return c.json({ error: 'Failed to fetch trending' }, 500);
    }
  });

  // GET /api/insights/dashboard - Get user activity insights
  app.get('/api/insights/dashboard', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Get recent activity stats
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      const [articlesRead, comments, favorites, recentActivity] = await Promise.all([
        c.env.DB.prepare(`
          SELECT COUNT(*) as count FROM analytics_events
          WHERE userId = ? AND eventType = 'article_view' AND createdAt > ?
        `).bind(userId, thirtyDaysAgo).first(),

        c.env.DB.prepare(`
          SELECT COUNT(*) as count FROM comments WHERE authorId = ? AND createdAt > ?
        `).bind(userId, thirtyDaysAgo).first(),

        c.env.DB.prepare(`
          SELECT COUNT(*) as count FROM favorites WHERE userId = ? AND createdAt > ?
        `).bind(userId, thirtyDaysAgo).first(),

        c.env.DB.prepare(`
          SELECT * FROM activities WHERE userId = ? ORDER BY createdAt DESC LIMIT 10
        `).bind(userId).all()
      ]);

      // Get reading by category
      const categoryBreakdown = await c.env.DB.prepare(`
        SELECT a.category, COUNT(*) as count
        FROM analytics_events ae
        JOIN articles a ON ae.resourceId = a.id
        WHERE ae.userId = ? AND ae.eventType = 'article_view' AND ae.createdAt > ?
        GROUP BY a.category
        ORDER BY count DESC
        LIMIT 5
      `).bind(userId, thirtyDaysAgo).all();

      return c.json({
        period: '30 days',
        articlesRead: articlesRead?.count || 0,
        commentsPosted: comments?.count || 0,
        articlesFavorited: favorites?.count || 0,
        categoryBreakdown: categoryBreakdown.results || [],
        recentActivity: recentActivity.results || []
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
      return c.json({ error: 'Failed to fetch insights' }, 500);
    }
  });

  // GET /api/recommendations - Get content recommendations
  app.get('/api/recommendations', async (c) => {
    try {
      const userId = c.get('userId');
      const { page = 1, limit = 10 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (!userId) {
        // Return popular articles for anonymous users
        const popular = await c.env.DB.prepare(`
          SELECT a.*, u.username as authorName
          FROM articles a
          LEFT JOIN users u ON a.authorId = u.id
          WHERE a.status = 'published'
          ORDER BY a.views DESC
          LIMIT ? OFFSET ?
        `).bind(parseInt(limit), offset).all();

        return c.json({
          recommendations: (popular.results || []).map(a => ({
            ...a,
            reason: 'Popular on RS News'
          })),
          page: parseInt(page),
          limit: parseInt(limit)
        });
      }

      // Get user's reading history categories
      const readCategories = await c.env.DB.prepare(`
        SELECT a.category, COUNT(*) as count
        FROM analytics_events ae
        JOIN articles a ON ae.resourceId = a.id
        WHERE ae.userId = ? AND ae.eventType = 'article_view'
        GROUP BY a.category
        ORDER BY count DESC
        LIMIT 3
      `).bind(userId).all();

      const topCategories = (readCategories.results || []).map(r => r.category);

      if (topCategories.length === 0) {
        // Fall back to popular
        const popular = await c.env.DB.prepare(`
          SELECT a.*, u.username as authorName
          FROM articles a
          LEFT JOIN users u ON a.authorId = u.id
          WHERE a.status = 'published'
          ORDER BY a.views DESC
          LIMIT ? OFFSET ?
        `).bind(parseInt(limit), offset).all();

        return c.json({
          recommendations: (popular.results || []).map(a => ({
            ...a,
            reason: 'Popular on RS News'
          })),
          page: parseInt(page),
          limit: parseInt(limit)
        });
      }

      // Get articles from top categories the user hasn't read
      const placeholders = topCategories.map(() => '?').join(',');
      const recommendations = await c.env.DB.prepare(`
        SELECT a.*, u.username as authorName
        FROM articles a
        LEFT JOIN users u ON a.authorId = u.id
        WHERE a.status = 'published'
        AND a.category IN (${placeholders})
        AND a.id NOT IN (
          SELECT resourceId FROM analytics_events
          WHERE userId = ? AND eventType = 'article_view' AND resourceId IS NOT NULL
        )
        ORDER BY a.publishedAt DESC
        LIMIT ? OFFSET ?
      `).bind(...topCategories, userId, parseInt(limit), offset).all();

      return c.json({
        recommendations: (recommendations.results || []).map(a => ({
          ...a,
          reason: `Based on your interest in ${a.category}`
        })),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return c.json({ error: 'Failed to fetch recommendations' }, 500);
    }
  });
}

export { registerPreferenceRoutes };
