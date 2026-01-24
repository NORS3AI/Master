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
  sort_order INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(sort_order);

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
-- Phase 4.1: Notifications & Email
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  userId TEXT PRIMARY KEY,
  emailNotifications BOOLEAN DEFAULT 1,
  pushNotifications BOOLEAN DEFAULT 1,
  emailFrequency TEXT DEFAULT 'instant', -- instant, daily, weekly
  newFollower BOOLEAN DEFAULT 1,
  newComment BOOLEAN DEFAULT 1,
  articlePublished BOOLEAN DEFAULT 1,
  mentions BOOLEAN DEFAULT 1,
  newsletter BOOLEAN DEFAULT 1,
  marketingEmails BOOLEAN DEFAULT 0,
  quietHoursStart INTEGER, -- 0-23
  quietHoursEnd INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  htmlContent TEXT NOT NULL,
  textContent TEXT,
  category TEXT, -- transactional, marketing, notification
  variables TEXT, -- JSON array of variable names
  isActive BOOLEAN DEFAULT 1,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  templateId TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipientFilter TEXT, -- JSON filter criteria
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent, cancelled
  scheduledAt INTEGER,
  sentAt INTEGER,
  recipientCount INTEGER DEFAULT 0,
  openCount INTEGER DEFAULT 0,
  clickCount INTEGER DEFAULT 0,
  createdBy TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (templateId) REFERENCES email_templates(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduledAt ON email_campaigns(scheduledAt);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  deviceType TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE(userId, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_userId ON push_subscriptions(userId);

-- ============================================================
-- Phase 4.2: User Preferences & Personalization
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  userId TEXT PRIMARY KEY,
  interests TEXT, -- JSON: {category: {level: 1-5, weight: number}}
  excludeTopics TEXT, -- JSON array
  contentTypePreferences TEXT, -- JSON: {articles: bool, videos: bool}
  readingTimeAvailability TEXT DEFAULT 'moderate', -- busy, moderate, leisure
  languagePreference TEXT DEFAULT 'en',
  sourcePreferences TEXT, -- JSON
  feedAlgorithm TEXT DEFAULT 'personalized', -- personalized, latest, trending
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_theme_preferences (
  userId TEXT PRIMARY KEY,
  themeMode TEXT DEFAULT 'auto', -- light, dark, auto
  colorScheme TEXT DEFAULT 'default',
  fontFamily TEXT DEFAULT 'sans-serif',
  fontSize INTEGER DEFAULT 100, -- percentage
  lineHeight REAL DEFAULT 1.5,
  contentWidth TEXT DEFAULT 'medium', -- narrow, medium, wide
  layoutStyle TEXT DEFAULT 'spacious', -- compact, spacious
  customColors TEXT, -- JSON
  sidebarCollapsed BOOLEAN DEFAULT 0,
  animations TEXT DEFAULT 'full', -- full, reduced, disabled
  highContrast BOOLEAN DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_homepage_layouts (
  userId TEXT PRIMARY KEY,
  layoutMode TEXT DEFAULT 'grid', -- grid, list, magazine
  sections TEXT NOT NULL, -- JSON array of section configs
  widgetOrder TEXT, -- JSON array of widget IDs
  isDefault BOOLEAN DEFAULT 0,
  presetName TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS personalized_feeds (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  articles TEXT NOT NULL, -- JSON array: [{articleId, reason, rank, score}]
  algorithm TEXT,
  diversity TEXT, -- JSON
  quality TEXT, -- JSON
  generatedAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_personalized_feeds_userId ON personalized_feeds(userId);
CREATE INDEX IF NOT EXISTS idx_personalized_feeds_expiresAt ON personalized_feeds(expiresAt);

CREATE TABLE IF NOT EXISTS trending_articles (
  articleId TEXT PRIMARY KEY,
  trendingScore REAL DEFAULT 0,
  viewsLastHour INTEGER DEFAULT 0,
  viewsLastDay INTEGER DEFAULT 0,
  sharesLastDay INTEGER DEFAULT 0,
  commentsLastDay INTEGER DEFAULT 0,
  favoritesLastDay INTEGER DEFAULT 0,
  trend TEXT DEFAULT 'stable', -- rising, peak, falling, stable
  category TEXT,
  calculatedAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL,
  FOREIGN KEY (articleId) REFERENCES articles(id)
);

CREATE INDEX IF NOT EXISTS idx_trending_trendingScore ON trending_articles(trendingScore DESC);
CREATE INDEX IF NOT EXISTS idx_trending_calculatedAt ON trending_articles(calculatedAt);

CREATE TABLE IF NOT EXISTS user_activity_insights (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  periodType TEXT NOT NULL, -- daily, weekly, monthly, yearly
  periodStart INTEGER NOT NULL,
  periodEnd INTEGER NOT NULL,
  articlesRead INTEGER DEFAULT 0,
  totalReadingTime INTEGER DEFAULT 0, -- minutes
  articlesCommented INTEGER DEFAULT 0,
  articlesFavorited INTEGER DEFAULT 0,
  articlesShared INTEGER DEFAULT 0,
  categoriesRead TEXT, -- JSON
  authorsRead TEXT, -- JSON
  peakReadingHour INTEGER,
  readingConsistency REAL DEFAULT 0,
  readingDiversity REAL DEFAULT 0,
  readingStreak INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_insights_userId ON user_activity_insights(userId);
CREATE INDEX IF NOT EXISTS idx_insights_periodStart ON user_activity_insights(periodStart);

CREATE TABLE IF NOT EXISTS content_recommendations (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  articleId TEXT NOT NULL,
  reason TEXT,
  recommendationType TEXT, -- personalized, trending, similar, collaborative
  score REAL DEFAULT 0,
  displayPosition INTEGER,
  clicked BOOLEAN DEFAULT 0,
  clickedAt INTEGER,
  feedback TEXT, -- helpful, notHelpful, null
  impressionCount INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (articleId) REFERENCES articles(id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_userId ON content_recommendations(userId);
CREATE INDEX IF NOT EXISTS idx_recommendations_articleId ON content_recommendations(articleId);

-- ============================================================
-- Phase 4.3: Security & Technical
-- ============================================================

CREATE TABLE IF NOT EXISTS user_security_logs (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  eventType TEXT NOT NULL, -- login, logout, 2fa_enable, password_change, oauth_link
  success BOOLEAN DEFAULT 1,
  ipAddress TEXT,
  userAgent TEXT,
  deviceFingerprint TEXT,
  location TEXT, -- JSON: {country, city}
  details TEXT, -- JSON
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_security_logs_userId ON user_security_logs(userId);
CREATE INDEX IF NOT EXISTS idx_security_logs_eventType ON user_security_logs(eventType);
CREATE INDEX IF NOT EXISTS idx_security_logs_createdAt ON user_security_logs(createdAt DESC);

CREATE TABLE IF NOT EXISTS two_factor_auth (
  userId TEXT PRIMARY KEY,
  secret TEXT NOT NULL, -- encrypted TOTP secret
  enabled BOOLEAN DEFAULT 0,
  backupCodes TEXT, -- JSON array of hashed codes
  usedBackupCodes TEXT, -- JSON array
  lastUsedAt INTEGER,
  enabledAt INTEGER,
  method TEXT DEFAULT 'totp', -- totp, sms
  smsNumber TEXT,
  trustedDevices TEXT, -- JSON array
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  provider TEXT NOT NULL, -- google, facebook, github
  providerUserId TEXT NOT NULL,
  profileData TEXT, -- JSON
  accessToken TEXT, -- encrypted
  refreshToken TEXT, -- encrypted
  tokenExpiry INTEGER,
  email TEXT,
  displayName TEXT,
  profilePicture TEXT,
  linkedAt INTEGER NOT NULL,
  lastUsedAt INTEGER,
  isActive BOOLEAN DEFAULT 1,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE(provider, providerUserId)
);

CREATE INDEX IF NOT EXISTS idx_oauth_userId ON oauth_accounts(userId);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT, -- ms, bytes, count, percentage
  endpoint TEXT,
  timestamp INTEGER NOT NULL,
  tags TEXT, -- JSON
  expiresAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics(timestamp DESC);

-- ============================================================
-- Phase 4.4: Community Features
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  userId TEXT PRIMARY KEY,
  bio TEXT,
  profilePicture TEXT,
  coverPhoto TEXT,
  expertiseTags TEXT, -- JSON array
  socialLinks TEXT, -- JSON: {twitter, github, linkedin, website}
  isVerified BOOLEAN DEFAULT 0,
  verifiedAt INTEGER,
  verifiedBy TEXT,
  isPublic BOOLEAN DEFAULT 1,
  profileViews INTEGER DEFAULT 0,
  followerCount INTEGER DEFAULT 0,
  followingCount INTEGER DEFAULT 0,
  blocked TEXT, -- JSON array of blocked user IDs
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS community_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  eventType TEXT NOT NULL, -- contest, challenge, discussion, voting
  category TEXT,
  startDate INTEGER NOT NULL,
  endDate INTEGER NOT NULL,
  rules TEXT, -- JSON array
  prizes TEXT, -- JSON array
  maxParticipants INTEGER,
  participants TEXT, -- JSON array of user IDs
  entries TEXT, -- JSON array
  winners TEXT, -- JSON array of user IDs
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed
  createdBy TEXT NOT NULL,
  featured BOOLEAN DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_events_status ON community_events(status);
CREATE INDEX IF NOT EXISTS idx_events_startDate ON community_events(startDate);
CREATE INDEX IF NOT EXISTS idx_events_endDate ON community_events(endDate);

CREATE TABLE IF NOT EXISTS direct_messages (
  id TEXT PRIMARY KEY,
  senderId TEXT NOT NULL,
  recipientId TEXT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT 0,
  readAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (recipientId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_dm_senderId ON direct_messages(senderId);
CREATE INDEX IF NOT EXISTS idx_dm_recipientId ON direct_messages(recipientId);
CREATE INDEX IF NOT EXISTS idx_dm_createdAt ON direct_messages(createdAt DESC);

-- ============================================================
-- Phase 4.5: Search & Discovery
-- ============================================================

CREATE TABLE IF NOT EXISTS search_alerts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  savedSearchId TEXT,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily', -- instant, daily, weekly
  lastAlertSent INTEGER,
  nextAlertDate INTEGER,
  newResultCount INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT 1,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (savedSearchId) REFERENCES saved_searches(id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_userId ON search_alerts(userId);
CREATE INDEX IF NOT EXISTS idx_alerts_nextAlertDate ON search_alerts(nextAlertDate);

CREATE TABLE IF NOT EXISTS trending_topics (
  id TEXT PRIMARY KEY,
  topic TEXT UNIQUE NOT NULL,
  category TEXT,
  momentum REAL DEFAULT 0,
  searchCount INTEGER DEFAULT 0,
  searchCountPrevious INTEGER DEFAULT 0,
  articles TEXT, -- JSON array of article IDs
  trendingAt INTEGER NOT NULL,
  sentiment TEXT DEFAULT 'neutral', -- positive, negative, neutral
  mentions INTEGER DEFAULT 0,
  prediction TEXT,
  expiresAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_momentum ON trending_topics(momentum DESC);
CREATE INDEX IF NOT EXISTS idx_topics_trendingAt ON trending_topics(trendingAt);

CREATE TABLE IF NOT EXISTS search_analytics (
  id TEXT PRIMARY KEY,
  date INTEGER UNIQUE NOT NULL,
  totalSearches INTEGER DEFAULT 0,
  uniqueSearchers INTEGER DEFAULT 0,
  topQueries TEXT, -- JSON array
  noResultsQueries TEXT, -- JSON array
  avgResultsPerQuery REAL DEFAULT 0,
  avgClickThroughRate REAL DEFAULT 0,
  abandonmentRate REAL DEFAULT 0,
  searchesByCategory TEXT, -- JSON
  searchesByContentType TEXT, -- JSON
  createdAt INTEGER NOT NULL
);

-- ============================================================
-- Phase 4.6: Mobile & PWA
-- ============================================================

CREATE TABLE IF NOT EXISTS service_worker_cache (
  id TEXT PRIMARY KEY,
  userId TEXT,
  cacheVersion TEXT NOT NULL,
  cacheType TEXT DEFAULT 'all', -- offline, articles, images, all
  cachedItems TEXT, -- JSON array
  totalSize INTEGER DEFAULT 0,
  maxSize INTEGER DEFAULT 52428800, -- 50MB default
  lastCleanup INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sw_cache_userId ON service_worker_cache(userId);

CREATE TABLE IF NOT EXISTS offline_sync (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  actionType TEXT NOT NULL, -- post_comment, create_article, favorite, share
  targetId TEXT,
  targetType TEXT,
  payload TEXT, -- JSON
  status TEXT DEFAULT 'pending', -- pending, synced, failed
  attemptCount INTEGER DEFAULT 0,
  lastAttempt INTEGER,
  error TEXT,
  createdAt INTEGER NOT NULL,
  syncedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_userId ON offline_sync(userId);
CREATE INDEX IF NOT EXISTS idx_offline_sync_status ON offline_sync(status);

CREATE TABLE IF NOT EXISTS reading_progress (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  articleId TEXT NOT NULL,
  currentPosition REAL DEFAULT 0, -- scroll percentage
  timeSpent INTEGER DEFAULT 0, -- seconds
  lastReadAt INTEGER NOT NULL,
  isOffline BOOLEAN DEFAULT 0,
  syncedAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (articleId) REFERENCES articles(id),
  UNIQUE(userId, articleId)
);

CREATE INDEX IF NOT EXISTS idx_reading_userId ON reading_progress(userId);
CREATE INDEX IF NOT EXISTS idx_reading_articleId ON reading_progress(articleId);
CREATE INDEX IF NOT EXISTS idx_reading_lastReadAt ON reading_progress(lastReadAt DESC);

CREATE TABLE IF NOT EXISTS device_info (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  deviceId TEXT UNIQUE NOT NULL,
  deviceType TEXT, -- mobile, tablet, desktop
  osName TEXT,
  osVersion TEXT,
  browserName TEXT,
  screenWidth INTEGER,
  screenHeight INTEGER,
  dpi INTEGER,
  supportsPWA BOOLEAN DEFAULT 0,
  supportsServiceWorker BOOLEAN DEFAULT 0,
  supportsPushNotifications BOOLEAN DEFAULT 0,
  lastActiveAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_device_userId ON device_info(userId);
CREATE INDEX IF NOT EXISTS idx_device_lastActiveAt ON device_info(lastActiveAt DESC);

-- ============================================================
-- End of Schema
-- ============================================================

-- Verify table creation
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
