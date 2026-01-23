# Phase 3.1: Admin Dashboard & Analytics - Implementation Plan

**Status:** Ready for Development
**Timeline:** 4-5 days
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

---

## Feature Overview

Admin Dashboard provides comprehensive platform analytics, user metrics, content performance, and engagement tracking. Admins get real-time insights into platform health, content performance, and community engagement through visual dashboards and detailed reports.

---

## Database Models

### AdminDashboard Model
```javascript
{
  adminId: ObjectId,
  dateRange: String ("today", "week", "month", "year", "custom"),
  startDate: Date,
  endDate: Date,
  metrics: Object ({
    totalUsers: Number,
    newUsers: Number,
    activeUsers: Number,
    totalArticles: Number,
    totalComments: Number,
    totalViews: Number,
    totalShares: Number,
    totalFavorites: Number
  }),
  topArticles: Array,
  topAuthors: Array,
  topCategories: Array,
  engagementRate: Number,
  createdAt: Date
}
```

### AnalyticsEvent Model
```javascript
{
  eventType: String ("page_view", "article_view", "comment", "favorite", "share", "follow", "login"),
  userId: ObjectId,
  resourceId: ObjectId,
  resourceType: String,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  index: Date (TTL index for auto-cleanup after 90 days)
}
```

### AuditLog Model
```javascript
{
  adminId: ObjectId,
  action: String,
  resourceType: String,
  resourceId: ObjectId,
  changes: Object ({
    before: Object,
    after: Object
  }),
  reason: String,
  ipAddress: String,
  timestamp: Date
}
```

---

## 15 Dashboard Features

| Feature | Icon | Type | Purpose |
|---|---|---|---|
| Key Metrics Cards | 📊 | Widget | Display total users, articles, comments, views |
| User Growth Chart | 📈 | Chart | Line graph showing user growth over time |
| Engagement Timeline | 📉 | Chart | Engagement metrics tracking |
| Top Articles Widget | 🔥 | List | Most viewed/shared articles this month |
| Top Authors Widget | 👥 | List | Most active authors this month |
| Top Categories Widget | 🏷️ | List | Most popular categories |
| Real-time Activity | ⚡ | Feed | Live activity stream |
| User Demographics | 👤 | Chart | User location, activity level distribution |
| Content Distribution | 📚 | Pie Chart | Articles by category |
| Share Performance | 📤 | Chart | Shares by platform (Twitter, Facebook, LinkedIn, Email) |
| Favorite Trends | ❤️ | Chart | Favorite activity over time |
| Comment Sentiment | 💬 | Widget | Comment volume and engagement |
| Performance Metrics | ⚙️ | Widget | Page load times, API response times |
| Revenue/Growth | 💰 | Chart | Growth metrics (if applicable) |
| Custom Date Range | 📅 | Selector | Filter all metrics by date range |

---

## API Endpoints

### GET /api/admin/dashboard/metrics
- Get current dashboard metrics
- Optional date range parameters
- Returns aggregated statistics

### GET /api/admin/dashboard/charts/user-growth
- User growth over time
- Daily/weekly/monthly aggregation
- 90-day history default

### GET /api/admin/dashboard/charts/engagement
- Engagement metrics over time
- Articles, comments, favorites, shares
- Customizable time periods

### GET /api/admin/dashboard/top-articles
- Top articles by views/shares/favorites
- Filter by date range and category
- Returns top 20

### GET /api/admin/dashboard/top-authors
- Most active authors by metrics
- Article count, comment count, engagement
- Returns top 50

### GET /api/admin/dashboard/top-categories
- Category popularity metrics
- Articles per category, engagement
- Returns all categories with stats

### GET /api/admin/dashboard/real-time
- Live activity stream
- Last 100 activities across platform
- WebSocket ready for future enhancement

### POST /api/admin/dashboard/export
- Export dashboard data to CSV/PDF
- Customizable metrics selection
- Date range filtering

### GET /api/admin/analytics/user-demographics
- User location distribution
- Activity level distribution (new, casual, active, power)
- Join date distribution

### GET /api/admin/analytics/content-performance
- Content by author, category, date range
- Performance metrics per content type
- Trending content

### POST /api/admin/audit-logs
- Get audit logs of admin actions
- Filter by action type, admin, date range
- Full change tracking

### DELETE /api/admin/analytics/events
- Clean up old analytics events (>90 days)
- Manual cleanup trigger

---

## Implementation Steps

### Step 1: Create Analytics Models
- AdminDashboard schema for storing snapshots
- AnalyticsEvent schema for tracking all events
- AuditLog schema for admin action tracking
- Create necessary indices for performance

### Step 2: Create Analytics Routes
- Dashboard metrics endpoint
- Chart data endpoints (growth, engagement, etc.)
- Top items endpoints (articles, authors, categories)
- Real-time activity feed endpoint
- Export functionality endpoint

### Step 3: Event Tracking System
- Middleware to track page views
- Article view tracking
- Comment tracking
- Favorite/share tracking
- Activity logging on all major actions

### Step 4: Create Dashboard Page
- admin/dashboard.ejs main page
- Dashboard layout with grid
- Responsive metric cards
- Chart containers

### Step 5: Create Chart Components
- User growth chart (Chart.js)
- Engagement timeline chart
- Category distribution pie chart
- Share platform distribution chart
- Real-time activity feed display

### Step 6: Create Top Items Widgets
- Top articles widget with table
- Top authors widget with avatars
- Top categories widget
- Sortable and filterable lists

### Step 7: Add Dashboard Styling
- dashboard.css with grid layout
- Card designs and styling
- Chart styling and responsive
- Dark mode support for dashboard

### Step 8: Create Admin Utilities
- Date range picker component
- Export to CSV functionality
- Dashboard data refresh logic
- Real-time update listeners

### Step 9: Add Audit Logging
- Log all admin actions
- Track content changes
- Store before/after data
- Display audit trail

### Step 10: Create Reports Section
- Generate custom reports
- Save report templates
- Schedule email reports
- Download report data

---

## Files to Create/Modify

**New:**
- `/models/AdminDashboard.js`
- `/models/AnalyticsEvent.js`
- `/models/AuditLog.js`
- `/routes/admin-dashboard.js`
- `/views/pages/admin/dashboard.ejs`
- `/views/pages/admin/analytics.ejs`
- `/views/pages/admin/audit-logs.ejs`
- `/public/js/dashboard.js` (Chart.js integration)
- `/public/css/dashboard.css`
- `/middleware/analytics.js` (Event tracking)

**Modified:**
- `/server.js` - Register analytics routes and middleware
- `/views/layout.ejs` - Add admin menu link
- All route files - Add analytics tracking calls

---

## Dashboard Example Data Structure

```javascript
{
  dateRange: "month",
  metrics: {
    totalUsers: 1250,
    newUsers: 45,
    activeUsers: 520,
    totalArticles: 3420,
    newArticles: 127,
    totalComments: 15680,
    totalViews: 89540,
    totalShares: 3210,
    totalFavorites: 8920,
    engagementRate: 28.5
  },
  topArticles: [
    { title: "...", views: 1200, shares: 89, favorites: 456 },
    ...
  ],
  topAuthors: [
    { username: "...", articleCount: 24, engagement: 450 },
    ...
  ],
  topCategories: [
    { name: "News", count: 450, engagement: 2340 },
    ...
  ]
}
```

---

## Success Criteria

- [ ] Analytics models created with proper indices
- [ ] Event tracking middleware working on all actions
- [ ] Dashboard metrics endpoint returning accurate data
- [ ] Charts rendering correctly with Chart.js
- [ ] Top items widgets displaying real data
- [ ] Real-time activity feed working
- [ ] Date range filtering functional
- [ ] Export to CSV/PDF working
- [ ] Audit logs tracking all admin actions
- [ ] Dashboard responsive on mobile/tablet
- [ ] Performance optimized (queries use indices)
- [ ] TTL index removing old events automatically

---

**Estimated Effort:** 16-20 hours
**Priority:** HIGH (Critical for platform management)
**Complexity:** MEDIUM-HIGH
