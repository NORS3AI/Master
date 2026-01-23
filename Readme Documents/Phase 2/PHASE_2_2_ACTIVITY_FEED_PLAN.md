# Phase 2.2: Activity Feed & Timeline - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

---

## Feature Overview

Activity feed displays user actions (follows, comments, favorites, articles posted, badges earned) in chronological order, personalized based on who the current user follows.

---

## Database Models

### Activity Model
```javascript
{
  userId: ObjectId (User who performed action),
  type: String ("follow", "comment", "favorite", "article_created", "badge_earned"),
  targetId: ObjectId (polymorphic - can be Article, User, Comment, etc),
  targetType: String ("user", "article", "comment", "badge"),
  description: String (display text),
  metadata: Object (flexible for different activity types),
  isPublic: Boolean (default: true),
  createdAt: Date
}
```

---

## API Endpoints

### GET /api/activity/feed
- Returns activity feed for current user
- Filters by users current user follows
- Pagination support
- Returns 20 items per page

### GET /api/activity/:userId
- Returns user's public activity
- Respects privacy settings
- Pagination support

### POST /api/activity (Internal)
- Logs activity action
- Called by other endpoints
- Not exposed to frontend directly

### GET /api/activity/stats/:userId
- Returns activity statistics
- Total followers gained
- Total articles posted
- Total comments made
- Total badges earned

---

## Implementation Steps

### Step 1: Create Activity Model
- User reference
- Type enum
- Target references
- Metadata object
- Public/private flag

### Step 2: Create Activity Routes
- Feed endpoint with follow-based filtering
- User activity endpoint
- Activity logging helper
- Statistics endpoint

### Step 3: Integrate Activity Logging
- When user follows someone → log activity
- When user comments → log activity
- When user favorites article → log activity
- When user posts article → log activity
- When user earns badge → log activity

### Step 4: Create Feed Frontend
- Activity feed page (`/feed`)
- Real-time activity display
- Filter by activity type
- Infinite scroll or pagination
- Activity detail views

### Step 5: Add CSS Styling
- Activity feed container
- Activity item cards
- User info display
- Activity icons
- Responsive design

### Step 6: Testing & Refinement
- Test all activity logging
- Test feed filtering
- Test privacy controls
- Performance optimization

---

## Files to Create/Modify

**New:**
- `/models/Activity.js`
- `/routes/activity.js`
- `/views/pages/feed.ejs`
- `/public/js/feed.js`

**Modified:**
- `/routes/follows.js` - Add activity logging
- `/routes/comments.js` - Add activity logging
- `/routes/articles.js` - Add activity logging
- `/server.js` - Register activity routes
- `/views/layout.ejs` - Add feed link in nav
- `/public/css/style.css` - Add feed styles

---

## Features

### Activity Feed Display
- Shows user actions from followed users
- Chronological order (newest first)
- Activity icons for different types
- User information
- Timestamp with "time ago" format
- Links to related content

### Activity Types
1. **Follow** - User followed another user
2. **Comment** - User commented on article
3. **Favorite** - User favorited article
4. **Article Created** - User posted new article
5. **Badge Earned** - User earned achievement

### Privacy Controls
- User can hide activity
- Respect privacy settings
- Only show public activities
- Followers-only option

### Feed Algorithm
- Chronological primary sort
- Filter by users being followed
- Exclude hidden activities
- Limit to recent (30 days)

---

## Example Activity Items

```
User A followed User B
30 minutes ago

User C commented on "Breaking News Article"
2 hours ago

User D favorited "Industry Update"
1 day ago

User E earned "Community Voice" badge
1 day ago

User F posted new article "Monthly Summary"
2 days ago
```

---

## Success Criteria

- [ ] Activity model created and tested
- [ ] All activity types logging correctly
- [ ] Feed displays user's followed activity
- [ ] Feed respects privacy settings
- [ ] UI responsive on all devices
- [ ] Performance: Feed loads < 1 second
- [ ] Pagination/infinite scroll works
- [ ] Activity filtering works

---

**Estimated Effort:** 12-15 hours
**Priority:** HIGH (Core Phase 2 feature)
