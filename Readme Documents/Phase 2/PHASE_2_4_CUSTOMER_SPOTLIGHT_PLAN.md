# Phase 2.4: Customer Spotlight System - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

---

## Feature Overview

Customer Spotlight highlights active, engaged community members. Community members can be nominated and featured based on activity metrics. Featured customers receive recognition, increased visibility, and exclusive community perks. This drives engagement and builds community culture around top contributors.

---

## Database Models

### CustomerSpotlight Model
```javascript
{
  userId: ObjectId (Featured user reference),
  title: String ("Community Star", "Helpful Contributor", etc),
  description: String (Why they're featured, 500 chars),
  imageUrl: String (Optional custom image),
  category: String ("engagement", "contribution", "leadership"),
  featuredUntil: Date (When spotlight ends),
  views: Number (Tracking spotlight visibility),
  nominations: Number (How many times nominated),
  awards: String[] (Badges earned while featured),
  stats: Object ({
    followersGained: Number,
    articlesCreated: Number,
    commentsHelpful: Number,
    articlesFavorited: Number
  }),
  pinnedAt: Date (When featured),
  createdBy: ObjectId (Admin who featured),
  createdAt: Date
}
```

### CustomerNomination Model
```javascript
{
  userId: ObjectId (User being nominated),
  nominatedBy: ObjectId (User who nominated),
  reason: String (Max 1000 chars),
  category: String ("engagement", "contribution", "leadership"),
  votes: Number (Community votes for nomination),
  status: String ("pending", "approved", "rejected", "featured"),
  featuredId: ObjectId (Reference to CustomerSpotlight if featured),
  createdAt: Date
}
```

---

## 8 Customer Spotlight Types

| Spotlight Type | Icon | Criteria | Duration | Rarity |
|---|---|---|---|---|
| Community Star | ⭐ | 50+ followers, 25+ helpful comments | 30 days | Uncommon |
| Engagement Champion | 🔥 | 100+ article views this month, 50+ interactions | 30 days | Uncommon |
| Helpful Expert | 🤝 | 50+ comment likes, 25+ comments | 30 days | Rare |
| Trending Contributor | 📈 | Featured in trending, 20+ comments this week | 14 days | Uncommon |
| Innovation Leader | 💡 | 10+ original articles, 100+ comments | 60 days | Rare |
| Community Builder | 👥 | 100+ followers, helped 20+ new users | 60 days | Legendary |
| Rising Star | 🚀 | New user with 25+ comments, 500+ views in month | 14 days | Common |
| Balanced Contributor | ⚖️ | 50+ articles, 50+ comments, 50+ follows | 45 days | Rare |

---

## API Endpoints

### GET /api/spotlight/featured
- Returns currently featured customers
- Includes stats and duration remaining
- Paginated (12 per page)
- Optional filter by category

### GET /api/spotlight/featured/:userId
- Get specific customer's current spotlight
- Shows all metrics and info

### GET /api/spotlight/leaderboard
- Top featured customers this month/quarter/all-time
- Ranked by impact and views
- Shows spotlight history

### POST /api/spotlight/nominate (Authenticated)
- Submit nomination for community member
- Requires reason and category
- Max 1 nomination per user per week

### GET /api/spotlight/nominations
- Admin endpoint: view pending nominations
- Filter by status and category
- Vote counts visible

### POST /api/spotlight/nominations/:nominationId/approve (Admin)
- Approve nomination and feature customer
- Set duration (14-60 days)
- Optionally create custom spotlight profile

### POST /api/spotlight/nominations/:nominationId/reject (Admin)
- Reject nomination with reason
- Auto-archive rejected nominations

### GET /api/spotlight/history/:userId
- Get customer's spotlight history
- All past featured appearances
- Earned spotlights with dates

---

## Implementation Steps

### Step 1: Create Spotlight Models
- CustomerSpotlight schema with metrics tracking
- CustomerNomination schema with voting
- Categories (engagement, contribution, leadership)
- Status management (pending, approved, featured, archived)

### Step 2: Create Spotlight Routes
- Featured customers listing endpoint
- Nomination submission endpoint
- Admin approval/rejection endpoints
- Leaderboard and history endpoints

### Step 3: Create Spotlight Logic
- Nomination validation and limits
- Automatic spotlight criteria checking
- Stats aggregation from user activities
- Duration and expiration handling

### Step 4: Create Nomination System UI
- Nomination modal with form
- Category selection with descriptions
- Reason textarea with character count
- Confirmation and submission feedback

### Step 5: Create Spotlight Display Pages
- Featured customers showcase page
- Individual spotlight profile with user info
- Spotlight badge on user profiles
- Leaderboard with rankings and stats

### Step 6: Create Admin Management Interface
- Pending nominations queue
- Approval/rejection interface
- Featured customers management (edit, remove, extend)
- Nomination voting/filtering

### Step 7: Add Styling & Animations
- Spotlight card designs with rarity styling
- Featured badge animations
- Modal transitions
- Responsive leaderboard

### Step 8: Integrate Notifications
- Notification when nominated
- Notification when featured/rejected
- Email for new spotlight feature
- Activity feed updates for spotlight changes

---

## Files to Create/Modify

**New:**
- `/models/CustomerSpotlight.js`
- `/models/CustomerNomination.js`
- `/routes/spotlight.js`
- `/views/pages/spotlight.ejs` (Showcase page)
- `/views/pages/spotlight-profile.ejs` (Individual spotlight)
- `/views/admin/spotlight-nominations.ejs` (Admin panel)
- `/public/js/spotlight.js` (Client logic)
- `/public/css/spotlight.css` (Spotlight styling)

**Modified:**
- `/views/components/user-card.ejs` - Add spotlight badge if featured
- `/views/pages/profile.ejs` - Display spotlight history
- `/public/css/style.css` - Add spotlight badge styling
- `/routes/auth.js` - Check auto-feature criteria on login
- `/server.js` - Register spotlight routes
- `/views/layout.ejs` - Add spotlight link in nav

---

## Spotlight Earning Examples

```
User gains 50 followers → Check if meets Community Star criteria → Featured for 30 days
User receives 50 comment likes → Check if meets Helpful Expert → Featured for 30 days
New user has 25+ comments in first month → Check Rising Star → Featured for 14 days
User creates 10 original articles → Check Innovation Leader → Featured for 60 days
User nominated by community → Manual review → Featured if approved
User is featured → Gets spotlight badge, email notification, activity feed post
Spotlight expires → Badge removed, history archived, can be re-nominated later
```

---

## Success Criteria

- [ ] Spotlight models created with complete schemas
- [ ] Nomination system working (submit, vote, view)
- [ ] Admin approval/rejection interface functional
- [ ] Featured customers showcase page responsive
- [ ] Spotlight badges display on profiles correctly
- [ ] Spotlight history tracking and display working
- [ ] Notifications sent for nominations and features
- [ ] Leaderboard showing rankings by impact
- [ ] Auto-feature criteria checking on login
- [ ] Spotlight duration/expiration management working

---

**Estimated Effort:** 14-16 hours
**Priority:** HIGH (Core Phase 2 feature)
