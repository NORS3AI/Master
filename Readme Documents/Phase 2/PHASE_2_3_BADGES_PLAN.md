# Phase 2.3: Badges & Achievements System - Implementation Plan

**Status:** Ready for Development
**Timeline:** 2-3 days
**Priority:** HIGH
**Complexity:** MEDIUM

---

## Feature Overview

Badges reward user engagement and milestones. Users earn badges automatically when they reach certain criteria (10 followers, 5 comments, etc). Badges display on profiles and create achievement notifications.

---

## Database Models

### Badge Model
```javascript
{
  name: String (unique, "Social Butterfly"),
  description: String ("Gained 10 followers"),
  icon: String (emoji or icon name, "🦋"),
  category: String ("engagement", "contributor", "community", "milestone"),
  criteria: Object ({
    type: "followerCount", value: 10
  }),
  rarity: String ("common", "uncommon", "rare", "legendary"),
  color: String (hex color for badge),
  order: Number (display order),
  createdAt: Date
}
```

### UserBadge Model
```javascript
{
  userId: ObjectId (User who earned badge),
  badgeId: ObjectId (Badge reference),
  earnedAt: Date,
  progress: Number (0-100, for progressive badges),
  notificationSent: Boolean
}
```

---

## 12 Initial Badges

| Badge | Icon | Criteria | Rarity | Category |
|-------|------|----------|--------|----------|
| Welcome | 👋 | First login | Common | milestone |
| Commentator | 💬 | 5+ comments | Common | engagement |
| Article Lover | ❤️ | 10+ favorites | Common | engagement |
| Social Butterfly | 🦋 | 10+ followers | Uncommon | community |
| Influencer | ⭐ | 50+ followers | Rare | community |
| Community Voice | 🗣️ | 25+ helpful comments (likes) | Uncommon | contributor |
| Consistency | 📅 | 10+ days active in month | Common | milestone |
| Spotlight Star | 🌟 | Featured in spotlight | Rare | milestone |
| Engaged Reader | 📖 | 50+ articles viewed | Common | engagement |
| Trendsetter | 🔥 | Comment on trending article | Uncommon | contributor |
| Helper | 🤝 | Received 10+ comment likes | Uncommon | community |
| Pioneer | 🚀 | Early user (within first month) | Legendary | milestone |

---

## API Endpoints

### GET /api/badges
- Returns all badges available
- Includes criteria and icons

### GET /api/badges/:userId
- Returns user's earned badges
- Shows progress for progressive badges
- Ordered by earn date

### POST /api/badges/:badgeId/check (Internal)
- Checks if user qualifies for badge
- Awards if criteria met
- Sends notification

### GET /api/badges/leaderboard
- Top users by badge count
- Organized by rarity level

---

## Implementation Steps

### Step 1: Create Badge Models
- Badge schema with criteria
- UserBadge schema for awards
- Color and rarity fields

### Step 2: Create Badge Routes
- Get all badges endpoint
- Get user badges endpoint
- Check criteria endpoint
- Leaderboard endpoint

### Step 3: Create Badge Logic
- Criteria evaluation functions
- Award badge function
- Check each type (followers, comments, etc)

### Step 4: Integrate Badge Checking
- After user gains follower → check Social Butterfly
- After user comments → check Commentator
- After user favorites → check Article Lover
- On login → check Consistency
- Monitor article views → check Engaged Reader

### Step 5: Create Badge UI
- Badge display on profile
- Badge showcase page
- Badge list/collection
- Badge progress indicators
- Earn notifications

### Step 6: Add Styling
- Badge icons and colors
- Rarity level styling
- Badge cards
- Leaderboard display

---

## Files to Create/Modify

**New:**
- `/models/Badge.js`
- `/models/UserBadge.js`
- `/routes/badges.js`
- `/views/pages/badges.ejs`
- `/public/js/badges.js`

**Modified:**
- `/routes/follows.js` - Check Social Butterfly/Influencer
- `/routes/comments.js` - Check Commentator/Community Voice
- `/routes/articles.js` - Check Article Lover/Engaged Reader
- `/routes/auth.js` - Check Welcome/Pioneer on signup
- `/public/css/style.css` - Badge styling
- `/server.js` - Register badge routes
- `/views/layout.ejs` - Add badges link

---

## Badge Earning Examples

```
User follows someone → Check if now have 10+ followers → Award Social Butterfly
User comments → Like count increases → Check if 10+ comment likes → Award Helper
User logs in → Count days active → Check if 10+ days in month → Award Consistency
User makes 25 helpful comments → Award Community Voice
User views 50 articles → Award Engaged Reader
```

---

## Success Criteria

- [ ] Badge models created
- [ ] All 12 badges seeded
- [ ] Automatic badge checking working
- [ ] Badges display on profiles
- [ ] Badge notifications sent
- [ ] Badge leaderboard working
- [ ] Badge showcase page responsive
- [ ] No performance issues with badge checking

---

**Estimated Effort:** 10-12 hours
**Priority:** HIGH (Core Phase 2 feature)
