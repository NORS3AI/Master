-- RS News D1 Database Schema
-- This schema includes all tables for the RS News platform

-- ============================================================
-- Users & Authentication
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  profilePicture TEXT,
  bio TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  lastLoginAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt DESC);

-- ============================================================
-- Articles & Content
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  authorId TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array as string
  status TEXT DEFAULT 'published',
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  publishedAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_authorId ON articles(authorId);
CREATE INDEX IF NOT EXISTS idx_articles_publishedAt ON articles(publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_articles_createdAt ON articles(createdAt DESC);

-- ============================================================
-- Comments & Interactions
-- ============================================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  articleId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful INTEGER DEFAULT 0,
  unhelpful INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (articleId) REFERENCES articles(id),
  FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_articleId ON comments(articleId);
CREATE INDEX IF NOT EXISTS idx_comments_authorId ON comments(authorId);
CREATE INDEX IF NOT EXISTS idx_comments_createdAt ON comments(createdAt DESC);

-- ============================================================
-- Analytics & Events
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  userId TEXT,
  eventType TEXT NOT NULL,
  resourceId TEXT,
  resourceType TEXT,
  metadata TEXT, -- JSON
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_events_userId ON analytics_events(userId);
CREATE INDEX IF NOT EXISTS idx_events_eventType ON analytics_events(eventType);
CREATE INDEX IF NOT EXISTS idx_events_createdAt ON analytics_events(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_events_resourceId ON analytics_events(resourceId);

-- ============================================================
-- Favorites & User Interactions
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  articleId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (articleId) REFERENCES articles(id),
  UNIQUE(userId, articleId)
);

CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
CREATE INDEX IF NOT EXISTS idx_favorites_articleId ON favorites(articleId);

-- ============================================================
-- Following System
-- ============================================================

CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  followerId TEXT NOT NULL,
  followingId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (followerId) REFERENCES users(id),
  FOREIGN KEY (followingId) REFERENCES users(id),
  UNIQUE(followerId, followingId)
);

CREATE INDEX IF NOT EXISTS idx_follows_followerId ON follows(followerId);
CREATE INDEX IF NOT EXISTS idx_follows_followingId ON follows(followingId);

-- ============================================================
-- Categories
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order);

-- ============================================================
-- Badges & Achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  rarity TEXT,
  color TEXT,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  badgeId TEXT NOT NULL,
  earnedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (badgeId) REFERENCES badges(id),
  UNIQUE(userId, badgeId)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_userId ON user_badges(userId);
CREATE INDEX IF NOT EXISTS idx_user_badges_badgeId ON user_badges(badgeId);

-- ============================================================
-- Activity Feed
-- ============================================================

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  targetId TEXT,
  targetType TEXT,
  isPublic BOOLEAN DEFAULT 1,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_createdAt ON activities(createdAt DESC);

-- ============================================================
-- Spotlights
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_spotlights (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT,
  description TEXT,
  imageUrl TEXT,
  category TEXT,
  views INTEGER DEFAULT 0,
  nominations INTEGER DEFAULT 0,
  featuredUntil INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_spotlights_userId ON customer_spotlights(userId);
CREATE INDEX IF NOT EXISTS idx_spotlights_featuredUntil ON customer_spotlights(featuredUntil);

-- ============================================================
-- Forum Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS forum_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  visibility TEXT DEFAULT 'public',
  threadCount INTEGER DEFAULT 0,
  postCount INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);

CREATE TABLE IF NOT EXISTS forum_threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoryId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  isPinned BOOLEAN DEFAULT 0,
  isLocked BOOLEAN DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES forum_categories(id),
  FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_categoryId ON forum_threads(categoryId);
CREATE INDEX IF NOT EXISTS idx_forum_threads_createdAt ON forum_threads(createdAt DESC);

CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  threadId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful INTEGER DEFAULT 0,
  unhelpful INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (threadId) REFERENCES forum_threads(id),
  FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_threadId ON forum_posts(threadId);
CREATE INDEX IF NOT EXISTS idx_forum_posts_authorId ON forum_posts(authorId);

-- ============================================================
-- Reputation & Levels
-- ============================================================

CREATE TABLE IF NOT EXISTS user_reputation (
  userId TEXT PRIMARY KEY,
  totalReputation INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  period TEXT NOT NULL,
  rankings TEXT NOT NULL, -- JSON array
  generatedAt INTEGER NOT NULL,
  UNIQUE(type, period)
);

-- ============================================================
-- Search & Collections
-- ============================================================

CREATE TABLE IF NOT EXISTS search_queries (
  id TEXT PRIMARY KEY,
  userId TEXT,
  query TEXT NOT NULL,
  resultsCount INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_search_queries_userId ON search_queries(userId);
CREATE INDEX IF NOT EXISTS idx_search_queries_createdAt ON search_queries(createdAt DESC);

CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters TEXT, -- JSON
  isPublic BOOLEAN DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_userId ON saved_searches(userId);

CREATE TABLE IF NOT EXISTS content_collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  articles TEXT NOT NULL, -- JSON array of article IDs
  createdBy TEXT NOT NULL,
  isPublic BOOLEAN DEFAULT 1,
  type TEXT DEFAULT 'curated',
  views INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON content_collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_createdBy ON content_collections(createdBy);

-- ============================================================
-- Moderation
-- ============================================================

CREATE TABLE IF NOT EXISTS flag_reports (
  id TEXT PRIMARY KEY,
  reportType TEXT NOT NULL,
  reportedId TEXT NOT NULL,
  reportedBy TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  severity TEXT DEFAULT 'medium',
  resolvedBy TEXT,
  resolution TEXT,
  createdAt INTEGER NOT NULL,
  resolvedAt INTEGER,
  FOREIGN KEY (reportedBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON flag_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON flag_reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_createdAt ON flag_reports(createdAt DESC);

CREATE TABLE IF NOT EXISTS user_warnings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  reason TEXT NOT NULL,
  issuedBy TEXT NOT NULL,
  severity TEXT DEFAULT 'moderate',
  expiresAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (issuedBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_warnings_userId ON user_warnings(userId);
CREATE INDEX IF NOT EXISTS idx_warnings_createdAt ON user_warnings(createdAt DESC);

-- ============================================================
-- Audit Logging
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  adminId TEXT NOT NULL,
  action TEXT NOT NULL,
  resourceType TEXT,
  resourceId TEXT,
  changes TEXT, -- JSON
  reason TEXT,
  ipAddress TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (adminId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_adminId ON audit_logs(adminId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_createdAt ON audit_logs(createdAt DESC);

-- ============================================================
-- Notifications (Analytics Engine preferred, but backup here)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  relatedId TEXT,
  relatedType TEXT,
  isRead BOOLEAN DEFAULT 0,
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt DESC);

-- ============================================================
-- End of Schema
-- ============================================================

-- Verify table creation
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
