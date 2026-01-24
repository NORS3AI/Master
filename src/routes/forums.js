/**
 * Phase 4.4: Forums & Community Routes
 * Handles forum categories, threads, posts, reputation, and leaderboards
 */

/**
 * Register forum routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerForumRoutes(app) {

  // GET /api/forums - List all forum categories
  app.get('/api/forums', async (c) => {
    try {
      const categories = await c.env.DB.prepare(`
        SELECT * FROM forum_categories
        ORDER BY sort_order ASC, name ASC
      `).all();

      return c.json({
        categories: categories.results || []
      });
    } catch (error) {
      console.error('Error fetching forums:', error);
      return c.json({ error: 'Failed to fetch forums' }, 500);
    }
  });

  // GET /api/forums/:slug - Get forum category details
  app.get('/api/forums/:slug', async (c) => {
    try {
      const { slug } = c.req.param();

      const category = await c.env.DB.prepare(
        'SELECT * FROM forum_categories WHERE slug = ?'
      ).bind(slug).first();

      if (!category) {
        return c.json({ error: 'Forum not found' }, 404);
      }

      return c.json(category);
    } catch (error) {
      console.error('Error fetching forum:', error);
      return c.json({ error: 'Failed to fetch forum' }, 500);
    }
  });

  // POST /api/forums - Create forum category (admin only)
  app.post('/api/forums', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { name, description, icon, visibility } = await c.req.json();

      if (!name) {
        return c.json({ error: 'Name is required' }, 400);
      }

      const id = crypto.randomUUID();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO forum_categories (id, name, slug, description, icon, visibility, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, name, slug, description || null, icon || null, visibility || 'public', now).run();

      return c.json({ id, slug, success: true }, 201);
    } catch (error) {
      console.error('Error creating forum:', error);
      return c.json({ error: 'Failed to create forum' }, 500);
    }
  });

  // GET /api/forums/:categoryId/threads - List threads in category
  app.get('/api/forums/:categoryId/threads', async (c) => {
    try {
      const { categoryId } = c.req.param();
      const { page = 1, limit = 20, sort = 'latest' } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let orderBy = 'createdAt DESC';
      if (sort === 'popular') orderBy = 'views DESC';
      if (sort === 'replies') orderBy = 'replies DESC';

      const threads = await c.env.DB.prepare(`
        SELECT t.*, u.username as authorName
        FROM forum_threads t
        LEFT JOIN users u ON t.authorId = u.id
        WHERE t.categoryId = ?
        ORDER BY t.isPinned DESC, ${orderBy}
        LIMIT ? OFFSET ?
      `).bind(categoryId, parseInt(limit), offset).all();

      return c.json({
        threads: threads.results || [],
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching threads:', error);
      return c.json({ error: 'Failed to fetch threads' }, 500);
    }
  });

  // POST /api/forums/:categoryId/threads - Create thread
  app.post('/api/forums/:categoryId/threads', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { categoryId } = c.req.param();
      const { title, content, tags } = await c.req.json();

      if (!title || !content) {
        return c.json({ error: 'Title and content are required' }, 400);
      }

      const id = crypto.randomUUID();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 8);
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO forum_threads (id, title, slug, categoryId, authorId, content, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, title, slug, categoryId, userId, content, now).run();

      // Update category thread count
      await c.env.DB.prepare(
        'UPDATE forum_categories SET threadCount = threadCount + 1 WHERE id = ?'
      ).bind(categoryId).run();

      return c.json({ id, slug, success: true }, 201);
    } catch (error) {
      console.error('Error creating thread:', error);
      return c.json({ error: 'Failed to create thread' }, 500);
    }
  });

  // GET /api/forums/threads/:threadId - Get thread with posts
  app.get('/api/forums/threads/:threadId', async (c) => {
    try {
      const { threadId } = c.req.param();
      const { page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const thread = await c.env.DB.prepare(`
        SELECT t.*, u.username as authorName, fc.name as categoryName
        FROM forum_threads t
        LEFT JOIN users u ON t.authorId = u.id
        LEFT JOIN forum_categories fc ON t.categoryId = fc.id
        WHERE t.id = ? OR t.slug = ?
      `).bind(threadId, threadId).first();

      if (!thread) {
        return c.json({ error: 'Thread not found' }, 404);
      }

      // Increment view count
      await c.env.DB.prepare(
        'UPDATE forum_threads SET views = views + 1 WHERE id = ?'
      ).bind(thread.id).run();

      // Get posts
      const posts = await c.env.DB.prepare(`
        SELECT p.*, u.username as authorName
        FROM forum_posts p
        LEFT JOIN users u ON p.authorId = u.id
        WHERE p.threadId = ?
        ORDER BY p.createdAt ASC
        LIMIT ? OFFSET ?
      `).bind(thread.id, parseInt(limit), offset).all();

      return c.json({
        thread,
        posts: posts.results || [],
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching thread:', error);
      return c.json({ error: 'Failed to fetch thread' }, 500);
    }
  });

  // POST /api/forums/threads/:threadId/posts - Reply to thread
  app.post('/api/forums/threads/:threadId/posts', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { threadId } = c.req.param();
      const { content } = await c.req.json();

      if (!content) {
        return c.json({ error: 'Content is required' }, 400);
      }

      // Check thread exists and not locked
      const thread = await c.env.DB.prepare(
        'SELECT id, isLocked, categoryId FROM forum_threads WHERE id = ?'
      ).bind(threadId).first();

      if (!thread) {
        return c.json({ error: 'Thread not found' }, 404);
      }

      if (thread.isLocked) {
        return c.json({ error: 'Thread is locked' }, 403);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO forum_posts (id, threadId, authorId, content, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, threadId, userId, content, now).run();

      // Update thread reply count
      await c.env.DB.prepare(
        'UPDATE forum_threads SET replies = replies + 1 WHERE id = ?'
      ).bind(threadId).run();

      // Update category post count
      await c.env.DB.prepare(
        'UPDATE forum_categories SET postCount = postCount + 1 WHERE id = ?'
      ).bind(thread.categoryId).run();

      return c.json({ id, success: true }, 201);
    } catch (error) {
      console.error('Error creating post:', error);
      return c.json({ error: 'Failed to create post' }, 500);
    }
  });

  // POST /api/forums/posts/:postId/vote - Vote on post
  app.post('/api/forums/posts/:postId/vote', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { postId } = c.req.param();
      const { vote } = await c.req.json(); // 1 for helpful, -1 for unhelpful

      if (vote !== 1 && vote !== -1 && vote !== 0) {
        return c.json({ error: 'Vote must be 1, -1, or 0' }, 400);
      }

      if (vote === 1) {
        await c.env.DB.prepare(
          'UPDATE forum_posts SET helpful = helpful + 1 WHERE id = ?'
        ).bind(postId).run();
      } else if (vote === -1) {
        await c.env.DB.prepare(
          'UPDATE forum_posts SET unhelpful = unhelpful + 1 WHERE id = ?'
        ).bind(postId).run();
      }

      const post = await c.env.DB.prepare(
        'SELECT helpful, unhelpful FROM forum_posts WHERE id = ?'
      ).bind(postId).first();

      return c.json({
        helpful: post?.helpful || 0,
        unhelpful: post?.unhelpful || 0
      });
    } catch (error) {
      console.error('Error voting on post:', error);
      return c.json({ error: 'Failed to vote' }, 500);
    }
  });

  // POST /api/forums/threads/:threadId/lock - Lock thread (admin/mod)
  app.post('/api/forums/threads/:threadId/lock', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || (userRole !== 'admin' && userRole !== 'moderator')) {
        return c.json({ error: 'Moderator access required' }, 403);
      }

      const { threadId } = c.req.param();

      await c.env.DB.prepare(
        'UPDATE forum_threads SET isLocked = 1 WHERE id = ?'
      ).bind(threadId).run();

      return c.json({ success: true, locked: true });
    } catch (error) {
      console.error('Error locking thread:', error);
      return c.json({ error: 'Failed to lock thread' }, 500);
    }
  });

  // POST /api/forums/threads/:threadId/pin - Pin thread (admin/mod)
  app.post('/api/forums/threads/:threadId/pin', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || (userRole !== 'admin' && userRole !== 'moderator')) {
        return c.json({ error: 'Moderator access required' }, 403);
      }

      const { threadId } = c.req.param();

      await c.env.DB.prepare(
        'UPDATE forum_threads SET isPinned = 1 WHERE id = ?'
      ).bind(threadId).run();

      return c.json({ success: true, pinned: true });
    } catch (error) {
      console.error('Error pinning thread:', error);
      return c.json({ error: 'Failed to pin thread' }, 500);
    }
  });

  // GET /api/reputation/:userId - Get user reputation
  app.get('/api/reputation/:userId', async (c) => {
    try {
      const { userId } = c.req.param();

      let reputation = await c.env.DB.prepare(
        'SELECT * FROM user_reputation WHERE userId = ?'
      ).bind(userId).first();

      if (!reputation) {
        reputation = {
          userId,
          totalReputation: 0,
          level: 1
        };
      }

      // Calculate level from reputation
      const levels = [0, 50, 150, 400, 1000, 2500, 5000, 10000, 20000, 50000];
      let level = 1;
      for (let i = levels.length - 1; i >= 0; i--) {
        if (reputation.totalReputation >= levels[i]) {
          level = i + 1;
          break;
        }
      }

      return c.json({
        ...reputation,
        level,
        nextLevelAt: levels[level] || null,
        progress: level < 10 ? Math.round((reputation.totalReputation / levels[level]) * 100) : 100
      });
    } catch (error) {
      console.error('Error fetching reputation:', error);
      return c.json({ error: 'Failed to fetch reputation' }, 500);
    }
  });

  // GET /api/leaderboard/:type - Get leaderboard
  app.get('/api/leaderboard/:type', async (c) => {
    try {
      const { type } = c.req.param();
      const { period = 'allTime', limit = 100 } = c.req.query();

      // Check for cached leaderboard
      const cached = await c.env.DB.prepare(
        'SELECT rankings, generatedAt FROM leaderboard_cache WHERE type = ? AND period = ?'
      ).bind(type, period).first();

      const oneHourAgo = Date.now() - 3600000;

      if (cached && cached.generatedAt > oneHourAgo) {
        return c.json({
          type,
          period,
          rankings: JSON.parse(cached.rankings),
          generatedAt: cached.generatedAt
        });
      }

      // Generate leaderboard
      let query = '';
      if (type === 'reputation') {
        query = `
          SELECT u.id as userId, u.username, COALESCE(ur.totalReputation, 0) as score
          FROM users u
          LEFT JOIN user_reputation ur ON u.id = ur.userId
          ORDER BY score DESC
          LIMIT ?
        `;
      } else if (type === 'articles') {
        query = `
          SELECT authorId as userId, u.username, COUNT(*) as score
          FROM articles a
          JOIN users u ON a.authorId = u.id
          WHERE a.status = 'published'
          GROUP BY authorId
          ORDER BY score DESC
          LIMIT ?
        `;
      } else if (type === 'engagement') {
        query = `
          SELECT userId, u.username, COUNT(*) as score
          FROM activities a
          JOIN users u ON a.userId = u.id
          GROUP BY userId
          ORDER BY score DESC
          LIMIT ?
        `;
      } else {
        return c.json({ error: 'Invalid leaderboard type' }, 400);
      }

      const results = await c.env.DB.prepare(query).bind(parseInt(limit)).all();

      const rankings = (results.results || []).map((r, index) => ({
        rank: index + 1,
        userId: r.userId,
        username: r.username,
        score: r.score
      }));

      // Cache the leaderboard
      const now = Date.now();
      await c.env.DB.prepare(`
        INSERT INTO leaderboard_cache (id, type, period, rankings, generatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(type, period) DO UPDATE SET rankings = excluded.rankings, generatedAt = excluded.generatedAt
      `).bind(crypto.randomUUID(), type, period, JSON.stringify(rankings), now).run();

      return c.json({
        type,
        period,
        rankings,
        generatedAt: now
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return c.json({ error: 'Failed to fetch leaderboard' }, 500);
    }
  });

  // GET /api/events - List community events
  app.get('/api/events', async (c) => {
    try {
      const { status, page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = 'SELECT * FROM community_events WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY startDate DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const events = await c.env.DB.prepare(query).bind(...params).all();

      return c.json({
        events: (events.results || []).map(e => ({
          ...e,
          rules: JSON.parse(e.rules || '[]'),
          prizes: JSON.parse(e.prizes || '[]'),
          participants: JSON.parse(e.participants || '[]'),
          entries: JSON.parse(e.entries || '[]'),
          winners: JSON.parse(e.winners || '[]')
        })),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }
  });

  // POST /api/events/:eventId/join - Join an event
  app.post('/api/events/:eventId/join', async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { eventId } = c.req.param();

      const event = await c.env.DB.prepare(
        'SELECT participants, maxParticipants, status FROM community_events WHERE id = ?'
      ).bind(eventId).first();

      if (!event) {
        return c.json({ error: 'Event not found' }, 404);
      }

      if (event.status !== 'upcoming' && event.status !== 'active') {
        return c.json({ error: 'Event is not accepting participants' }, 400);
      }

      const participants = JSON.parse(event.participants || '[]');

      if (participants.includes(userId)) {
        return c.json({ error: 'Already joined this event' }, 400);
      }

      if (event.maxParticipants && participants.length >= event.maxParticipants) {
        return c.json({ error: 'Event is full' }, 400);
      }

      participants.push(userId);

      await c.env.DB.prepare(
        'UPDATE community_events SET participants = ?, updatedAt = ? WHERE id = ?'
      ).bind(JSON.stringify(participants), Date.now(), eventId).run();

      return c.json({ success: true, joined: true });
    } catch (error) {
      console.error('Error joining event:', error);
      return c.json({ error: 'Failed to join event' }, 500);
    }
  });
}

/**
 * Add reputation to a user
 * @param {D1Database} db - The D1 database instance
 * @param {string} userId - User ID
 * @param {number} points - Points to add (can be negative)
 */
async function addReputation(db, userId, points) {
  const now = Date.now();

  // Upsert reputation
  await db.prepare(`
    INSERT INTO user_reputation (userId, totalReputation, level, createdAt, updatedAt)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      totalReputation = MAX(0, totalReputation + ?),
      updatedAt = ?
  `).bind(userId, Math.max(0, points), now, now, points, now).run();
}

export { registerForumRoutes, addReputation };
