# Cloudflare Analytics Engine Setup - RS News

Comprehensive guide to configure and use Cloudflare Analytics Engine for RS News tracking and reporting.

---

## 📊 Analytics Engine Overview

Cloudflare Analytics Engine provides:
- Real-time analytics collection at the edge
- High-volume event ingestion (billions of events)
- Built-in time series data aggregation
- Simple REST API for queries
- Integrated with Workers runtime

---

## 🔧 Configuration

### 1. wrangler.toml Setup

Already configured in `wrangler.toml`:

```toml
# Default Analytics binding
[[analytics_engine_datasets]]
binding = "ANALYTICS"

# Staging environment
[env.staging.analytics_engine_datasets]
[env.staging.analytics_engine_datasets.ANALYTICS]
binding = "ANALYTICS_STAGING"

# Production environment
[env.production.analytics_engine_datasets]
[env.production.analytics_engine_datasets.ANALYTICS]
binding = "ANALYTICS"
```

### 2. Worker Code Integration

Your worker (`src/workers/index.js`) already includes:

```javascript
// Write analytics event
await env.ANALYTICS.writeDataPoint({
  indexes: ['article_view', articleId],
  blobs: [userAgent],
  doubles: [Date.now()]
});
```

---

## 📈 Analytics Data Points

### Write Format

```javascript
env.ANALYTICS.writeDataPoint({
  indexes: [index1, index2, ...],  // String values for filtering
  blobs: [blob1, blob2, ...],      // Text data
  doubles: [double1, double2, ...] // Numeric values (64-bit floats)
});
```

### Example Events

#### Article View Event
```javascript
await env.ANALYTICS.writeDataPoint({
  indexes: [
    'article_view',           // Event type
    articleId,                // Article ID
    authorId,                 // Author ID
    userRegion                // Geographic region
  ],
  blobs: [
    userAgent,                // Browser info
    referrer                  // Where came from
  ],
  doubles: [
    Date.now(),               // Timestamp
    readingTime,              // How long on page
    scrollDepth               // How far scrolled
  ]
});
```

#### Comment Created Event
```javascript
await env.ANALYTICS.writeDataPoint({
  indexes: ['comment_created', articleId, userId, sentiment],
  blobs: [commentText],
  doubles: [Date.now(), wordCount]
});
```

#### Search Event
```javascript
await env.ANALYTICS.writeDataPoint({
  indexes: ['search', searchQuery, userRegion, resultCount],
  blobs: [userAgent],
  doubles: [Date.now(), queryTime]
});
```

#### User Action Event
```javascript
await env.ANALYTICS.writeDataPoint({
  indexes: ['user_action', actionType, userId, resourceType],
  blobs: [resourceId],
  doubles: [Date.now(), duration]
});
```

---

## 🔍 Query Analytics Data

### Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Select Workers > Analytics
3. View aggregated data
4. Filter by time range and dataset

### Query via API (Future Implementation)

```javascript
// Example query in future phases
const response = await env.ANALYTICS.query({
  indexes: ['article_view'],
  filters: ['articleId = "article-123"']
});
```

---

## 📋 Sample Analytics Events to Track

### Content Events
- `article_view` - User views article
- `article_scroll` - User scrolls article
- `article_share` - User shares article
- `article_favorite` - User favorites article
- `article_comment` - User comments on article
- `article_search` - Search term used

### User Events
- `user_login` - User logs in
- `user_logout` - User logs out
- `user_register` - New user registration
- `user_profile_update` - User updates profile
- `user_follow` - User follows another user
- `user_notification` - User receives notification

### Engagement Events
- `feed_load` - Feed page loaded
- `feed_scroll` - User scrolls feed
- `trending_view` - Trending page viewed
- `search_perform` - Search executed
- `collection_view` - Collection viewed
- `forum_post_view` - Forum post viewed

### Technical Events
- `error_occurred` - Application error
- `api_call` - API endpoint called
- `cache_hit` - Cache hit
- `cache_miss` - Cache miss
- `db_query` - Database query
- `worker_duration` - Worker execution time

### Business Events
- `email_sent` - Email delivered
- `email_opened` - Email opened
- `email_clicked` - Email link clicked
- `newsletter_signup` - Newsletter subscription
- `promotion_viewed` - Promotion displayed
- `conversion_event` - User conversion event

---

## 📊 Analytics Dashboard Queries

### View Analytics in Dashboard

1. **Real-time Metrics**
   - Requests per second
   - Errors per second
   - Average response time

2. **Custom Metrics**
   - Article views by category
   - Search queries over time
   - User engagement patterns
   - Error rate trends

3. **Time Series Data**
   - Hourly aggregations
   - Daily trends
   - Weekly patterns
   - Monthly reports

---

## 🔐 Security & Privacy

### Data Retention

Cloudflare Analytics Engine stores data:
- Real-time data: 6 hours
- Hourly aggregations: 30 days
- Daily aggregations: 1 year

### Privacy

- No personal data in analytics
- Anonymized user information
- Compliant with privacy regulations
- GDPR and CCPA compatible

### Access Control

- Cloudflare account authentication required
- Role-based access control (if applicable)
- API token authentication for programmatic access

---

## 📈 Implementation Examples

### Track Article Performance

```javascript
// In article view endpoint
app.get('/articles/:slug', async (req, res, next) => {
  const article = await Article.findBySlug(req.params.slug);

  // Track view in analytics
  ctx.waitUntil(
    env.ANALYTICS.writeDataPoint({
      indexes: [
        'article_view',
        article._id,
        article.authorId,
        req.headers.get('cf-connecting-ip')
      ],
      blobs: [req.headers.get('user-agent')],
      doubles: [Date.now()]
    })
  );

  res.render('article', { article });
});
```

### Track Search Performance

```javascript
// In search endpoint
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const results = await Article.search(q);

  // Track search
  ctx.waitUntil(
    env.ANALYTICS.writeDataPoint({
      indexes: ['search', q, 'search_results'],
      blobs: [req.headers.get('user-agent')],
      doubles: [Date.now(), results.length]
    })
  );

  res.json(results);
});
```

### Track User Engagement

```javascript
// In API middleware
app.use(async (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    ctx.waitUntil(
      env.ANALYTICS.writeDataPoint({
        indexes: [
          'api_request',
          req.method,
          req.path,
          res.statusCode.toString()
        ],
        blobs: [req.user?.id || 'anonymous'],
        doubles: [Date.now(), duration]
      })
    );
  });

  next();
});
```

---

## 🎯 Analytics Strategy

### Key Metrics to Track

1. **Content Performance**
   - Views per article
   - Average reading time
   - Share rate
   - Favorite rate

2. **User Behavior**
   - Session duration
   - Pages per session
   - Return rate
   - Engagement score

3. **Search & Discovery**
   - Popular search terms
   - Search success rate
   - No-results queries
   - Click-through rate

4. **System Performance**
   - API response times
   - Error rates
   - Cache hit rate
   - Worker CPU time

### Dashboard Insights

Create custom dashboards showing:
- Real-time user count
- Top articles this hour
- Trending searches
- System health
- Error alerts

---

## 🚀 Getting Started

### 1. Deploy Worker with Analytics

```bash
npm run wrangler:deploy:production
```

The worker will start collecting analytics automatically.

### 2. View Initial Data

1. Wait 5-10 minutes for data to aggregate
2. Go to Cloudflare Dashboard
3. Select Workers > Analytics
4. View collected data points

### 3. Monitor Analytics

```bash
# Stream real-time logs (includes analytics)
npm run wrangler:tail
```

### 4. Create Custom Queries

In future phases, implement custom analytics queries:

```javascript
// Example query
const data = await env.ANALYTICS.query({
  indexes: ['article_view'],
  groupBy: ['indexes[1]'],  // Group by article ID
  limit: 100
});
```

---

## 📊 Sample Analytics Dashboard

Create queries for:

```
Total Views (24h):      [Aggregated number]
Unique Visitors (24h):  [Distinct users]
Top Articles:           [List with view counts]
Popular Searches:       [Search terms with frequency]
API Errors (24h):       [Error count with types]
Avg Response Time:      [Milliseconds]
Cache Hit Rate:         [Percentage]
User Engagement:        [Engagement score]
```

---

## 🔄 Data Lifecycle

### Real-time Data
- Collected at edge (immediate)
- Available in dashboard within seconds
- Stored for 6 hours

### Hourly Aggregation
- Calculated every hour
- Stored for 30 days
- Used for trend analysis

### Daily Aggregation
- Calculated daily
- Stored for 1 year
- Used for long-term trends

### Retention Policy
- 6 hours: Raw events
- 30 days: Hourly summaries
- 1 year: Daily summaries
- Older data: Purged automatically

---

## 💡 Analytics Use Cases

1. **Content Strategy**
   - Identify popular topics
   - Optimize article placement
   - Improve search experience

2. **User Experience**
   - Track user journeys
   - Identify pain points
   - Optimize performance

3. **Business Intelligence**
   - Monitor engagement trends
   - Track conversion metrics
   - Report on KPIs

4. **Performance Optimization**
   - Monitor API performance
   - Track error rates
   - Cache effectiveness

5. **Security Monitoring**
   - Detect anomalies
   - Monitor DDoS attacks
   - Track suspicious activity

---

## 📞 Support & Resources

- **Analytics Engine Docs:** https://developers.cloudflare.com/analytics/analytics-engine/
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Wrangler Commands:** `npx wrangler analytics-engine --help`

---

## ✨ Next Steps

1. ✅ Deploy worker with analytics
2. ✅ Generate test events
3. ✅ View data in dashboard
4. ✅ Create custom dashboards
5. ✅ Implement analytics-driven features

---

**Setup Date:** January 2024
**Status:** Ready for Production
**Dataset Name:** ANALYTICS
**Environments:** development, staging, production

---
