/**
 * Phase 4.5: Advanced Search & Discovery Routes
 * Handles full-text search, saved searches, collections, and trending
 */

/**
 * Register search routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerSearchRoutes(app) {

  // GET /api/search - Full-text search
  app.get('/api/search', async (c) => {
    try {
      const userId = c.get('userId');
      const { q, category, author, dateFrom, dateTo, sort = 'relevance', page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (!q || q.length < 2) {
        return c.json({ error: 'Query must be at least 2 characters' }, 400);
      }

      let query = `
        SELECT a.*, u.username as authorName
        FROM articles a
        LEFT JOIN users u ON a.authorId = u.id
        WHERE a.status = 'published'
        AND (a.title LIKE ? OR a.content LIKE ? OR a.description LIKE ?)
      `;
      const searchTerm = `%${q}%`;
      const params = [searchTerm, searchTerm, searchTerm];

      if (category) {
        query += ' AND a.category = ?';
        params.push(category);
      }

      if (author) {
        query += ' AND a.authorId = ?';
        params.push(author);
      }

      if (dateFrom) {
        query += ' AND a.publishedAt >= ?';
        params.push(parseInt(dateFrom));
      }

      if (dateTo) {
        query += ' AND a.publishedAt <= ?';
        params.push(parseInt(dateTo));
      }

      // Sort
      if (sort === 'relevance') {
        // Simple relevance: title matches rank higher
        query += ' ORDER BY CASE WHEN a.title LIKE ? THEN 0 ELSE 1 END, a.publishedAt DESC';
        params.push(searchTerm);
      } else if (sort === 'newest') {
        query += ' ORDER BY a.publishedAt DESC';
      } else if (sort === 'oldest') {
        query += ' ORDER BY a.publishedAt ASC';
      } else if (sort === 'popular') {
        query += ' ORDER BY a.views DESC';
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const results = await c.env.DB.prepare(query).bind(...params).all();

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total FROM articles a
        WHERE a.status = 'published'
        AND (a.title LIKE ? OR a.content LIKE ? OR a.description LIKE ?)
      `;
      const countParams = [searchTerm, searchTerm, searchTerm];

      if (category) {
        countQuery += ' AND a.category = ?';
        countParams.push(category);
      }

      const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first();

      // Log search query
      const now = Date.now();
      await c.env.DB.prepare(`
        INSERT INTO search_queries (id, userId, query, resultsCount, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), userId || null, q, countResult?.total || 0, now).run();

      // Highlight search terms in results
      const highlightedResults = (results.results || []).map(article => ({
        ...article,
        highlights: {
          title: highlightText(article.title, q),
          description: highlightText(article.description || '', q)
        }
      }));

      return c.json({
        query: q,
        results: highlightedResults,
        total: countResult?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        filters: { category, author, dateFrom, dateTo },
        sort
      });
    } catch (error) {
      console.error('Error searching:', error);
      return c.json({ error: 'Search failed' }, 500);
    }
  });

  // GET /api/search/autocomplete - Get search suggestions
  app.get('/api/search/autocomplete', async (c) => {
    try {
      const userId = c.get('userId');
      const { q, limit = 10 } = c.req.query();

      if (!q || q.length < 2) {
        return c.json({ queries: [], articles: [], categories: [] });
      }

      const searchTerm = `${q}%`;

      // Get matching article titles
      const articles = await c.env.DB.prepare(`
        SELECT id, title, slug FROM articles
        WHERE status = 'published' AND title LIKE ?
        ORDER BY views DESC
        LIMIT ?
      `).bind(searchTerm, parseInt(limit)).all();

      // Get matching categories
      const categories = await c.env.DB.prepare(`
        SELECT DISTINCT category FROM articles
        WHERE status = 'published' AND category LIKE ?
        LIMIT 5
      `).bind(searchTerm).all();

      // Get recent searches by this user
      let recentSearches = [];
      if (userId) {
        const recent = await c.env.DB.prepare(`
          SELECT DISTINCT query FROM search_queries
          WHERE userId = ? AND query LIKE ?
          ORDER BY createdAt DESC
          LIMIT 5
        `).bind(userId, searchTerm).all();
        recentSearches = (recent.results || []).map(r => r.query);
      }

      // Get popular searches
      const popular = await c.env.DB.prepare(`
        SELECT query, COUNT(*) as count FROM search_queries
        WHERE query LIKE ?
        GROUP BY query
        ORDER BY count DESC
        LIMIT 5
      `).bind(searchTerm).all();

      return c.json({
        articles: (articles.results || []).map(a => ({ id: a.id, title: a.title, slug: a.slug })),
        categories: (categories.results || []).map(c => c.category),
        recentSearches,
        popularSearches: (popular.results || []).map(p => p.query)
      });
    } catch (error) {
      console.error('Error fetching autocomplete:', error);
      return c.json({ error: 'Failed to fetch suggestions' }, 500);
    }
  });

  // GET /api/search/history - Get user's search history
  app.get('/api/search/history', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const history = await c.env.DB.prepare(`
        SELECT DISTINCT query, MAX(createdAt) as lastSearched
        FROM search_queries
        WHERE userId = ?
        GROUP BY query
        ORDER BY lastSearched DESC
        LIMIT 20
      `).bind(userId).all();

      return c.json({
        searches: history.results || []
      });
    } catch (error) {
      console.error('Error fetching search history:', error);
      return c.json({ error: 'Failed to fetch history' }, 500);
    }
  });

  // DELETE /api/search/history - Clear search history
  app.delete('/api/search/history', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await c.env.DB.prepare(
        'DELETE FROM search_queries WHERE userId = ?'
      ).bind(userId).run();

      return c.json({ success: true, message: 'Search history cleared' });
    } catch (error) {
      console.error('Error clearing history:', error);
      return c.json({ error: 'Failed to clear history' }, 500);
    }
  });

  // GET /api/saved-searches - Get saved searches
  app.get('/api/saved-searches', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const searches = await c.env.DB.prepare(`
        SELECT * FROM saved_searches WHERE userId = ?
        ORDER BY createdAt DESC
      `).bind(userId).all();

      return c.json({
        savedSearches: (searches.results || []).map(s => ({
          ...s,
          filters: JSON.parse(s.filters || '{}')
        }))
      });
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return c.json({ error: 'Failed to fetch saved searches' }, 500);
    }
  });

  // POST /api/saved-searches - Save a search
  app.post('/api/saved-searches', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { name, query, filters } = await c.req.json();

      if (!name || !query) {
        return c.json({ error: 'Name and query are required' }, 400);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO saved_searches (id, userId, name, query, filters, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, userId, name, query, JSON.stringify(filters || {}), now).run();

      return c.json({ id, success: true }, 201);
    } catch (error) {
      console.error('Error saving search:', error);
      return c.json({ error: 'Failed to save search' }, 500);
    }
  });

  // DELETE /api/saved-searches/:id - Delete saved search
  app.delete('/api/saved-searches/:id', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM saved_searches WHERE id = ? AND userId = ?'
      ).bind(id, userId).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return c.json({ error: 'Failed to delete saved search' }, 500);
    }
  });

  // GET /api/collections - List collections
  app.get('/api/collections', async (c) => {
    try {
      const { category, type, page = 1, limit = 20, sort = 'newest' } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT c.*, u.username as creatorName
        FROM content_collections c
        LEFT JOIN users u ON c.createdBy = u.id
        WHERE c.isPublic = 1
      `;
      const params = [];

      if (type) {
        query += ' AND c.type = ?';
        params.push(type);
      }

      if (sort === 'newest') {
        query += ' ORDER BY c.createdAt DESC';
      } else if (sort === 'popular') {
        query += ' ORDER BY c.views DESC';
      } else if (sort === 'rating') {
        query += ' ORDER BY c.rating DESC';
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const collections = await c.env.DB.prepare(query).bind(...params).all();

      return c.json({
        collections: (collections.results || []).map(col => ({
          ...col,
          articles: JSON.parse(col.articles || '[]')
        })),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
      return c.json({ error: 'Failed to fetch collections' }, 500);
    }
  });

  // GET /api/collections/:id - Get collection details
  app.get('/api/collections/:id', async (c) => {
    try {
      const { id } = c.req.param();

      const collection = await c.env.DB.prepare(`
        SELECT c.*, u.username as creatorName
        FROM content_collections c
        LEFT JOIN users u ON c.createdBy = u.id
        WHERE c.id = ? OR c.slug = ?
      `).bind(id, id).first();

      if (!collection) {
        return c.json({ error: 'Collection not found' }, 404);
      }

      // Increment view count
      await c.env.DB.prepare(
        'UPDATE content_collections SET views = views + 1 WHERE id = ?'
      ).bind(collection.id).run();

      // Get article details
      const articleIds = JSON.parse(collection.articles || '[]');
      let articles = [];

      if (articleIds.length > 0) {
        const placeholders = articleIds.map(() => '?').join(',');
        const articleResults = await c.env.DB.prepare(`
          SELECT a.*, u.username as authorName
          FROM articles a
          LEFT JOIN users u ON a.authorId = u.id
          WHERE a.id IN (${placeholders})
        `).bind(...articleIds).all();
        articles = articleResults.results || [];
      }

      return c.json({
        ...collection,
        articles
      });
    } catch (error) {
      console.error('Error fetching collection:', error);
      return c.json({ error: 'Failed to fetch collection' }, 500);
    }
  });

  // POST /api/collections - Create collection
  app.post('/api/collections', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { title, description, articles, type, isPublic } = await c.req.json();

      if (!title) {
        return c.json({ error: 'Title is required' }, 400);
      }

      const id = crypto.randomUUID();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 8);
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO content_collections (id, title, slug, description, articles, createdBy, isPublic, type, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        title,
        slug,
        description || null,
        JSON.stringify(articles || []),
        userId,
        isPublic !== false ? 1 : 0,
        type || 'curated',
        now
      ).run();

      return c.json({ id, slug, success: true }, 201);
    } catch (error) {
      console.error('Error creating collection:', error);
      return c.json({ error: 'Failed to create collection' }, 500);
    }
  });

  // POST /api/collections/:id/articles/:articleId - Add article to collection
  app.post('/api/collections/:id/articles/:articleId', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id, articleId } = c.req.param();

      const collection = await c.env.DB.prepare(
        'SELECT articles, createdBy FROM content_collections WHERE id = ?'
      ).bind(id).first();

      if (!collection) {
        return c.json({ error: 'Collection not found' }, 404);
      }

      if (collection.createdBy !== userId) {
        return c.json({ error: 'Not authorized to modify this collection' }, 403);
      }

      const articles = JSON.parse(collection.articles || '[]');

      if (!articles.includes(articleId)) {
        articles.push(articleId);

        await c.env.DB.prepare(
          'UPDATE content_collections SET articles = ? WHERE id = ?'
        ).bind(JSON.stringify(articles), id).run();
      }

      return c.json({ success: true, articleCount: articles.length });
    } catch (error) {
      console.error('Error adding article to collection:', error);
      return c.json({ error: 'Failed to add article' }, 500);
    }
  });

  // GET /api/trending-topics - Get trending topics
  app.get('/api/trending-topics', async (c) => {
    try {
      const { limit = 10 } = c.req.query();

      const topics = await c.env.DB.prepare(`
        SELECT * FROM trending_topics
        WHERE expiresAt > ?
        ORDER BY momentum DESC
        LIMIT ?
      `).bind(Date.now(), parseInt(limit)).all();

      return c.json({
        topics: (topics.results || []).map(t => ({
          ...t,
          articles: JSON.parse(t.articles || '[]')
        }))
      });
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return c.json({ error: 'Failed to fetch trending topics' }, 500);
    }
  });

  // GET /api/trending-searches - Get trending searches
  app.get('/api/trending-searches', async (c) => {
    try {
      const { limit = 10, period = 'day' } = c.req.query();

      let since = Date.now() - 86400000; // 24 hours
      if (period === 'week') since = Date.now() - 604800000;
      if (period === 'hour') since = Date.now() - 3600000;

      const trending = await c.env.DB.prepare(`
        SELECT query, COUNT(*) as count
        FROM search_queries
        WHERE createdAt > ?
        GROUP BY query
        ORDER BY count DESC
        LIMIT ?
      `).bind(since, parseInt(limit)).all();

      return c.json({
        trendingSearches: (trending.results || []).map(t => ({
          query: t.query,
          count: t.count
        })),
        period
      });
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      return c.json({ error: 'Failed to fetch trending searches' }, 500);
    }
  });
}

/**
 * Highlight search terms in text
 */
function highlightText(text, query) {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export { registerSearchRoutes };
