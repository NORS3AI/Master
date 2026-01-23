# RS News - Phase 2: Community Building Development Plan

**Status:** Ready for Approval
**Timeline:** Weeks 4-6
**Priority:** HIGH
**Focus:** Community features and user engagement

---

## Phase 2 Overview

Phase 2 shifts focus from article discovery to community building. Users will be able to follow each other, see activity feeds, earn badges, and participate in spotlight features. This creates deeper engagement and retention.

---

## Implementation Tasks

### 1. User Follow/Subscription System
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated Effort:** 8-10 hours

#### 1.1 Database Models
- **User Model Update**
  - Add `followers` array (user IDs)
  - Add `following` array (user IDs)
  - Add `followersCount` and `followingCount` counters
  - Add `isPublic` boolean for profile visibility

- **Follow Model** (new)
  ```
  - follower: ObjectId (User)
  - following: ObjectId (User)
  - createdAt: Date
  - status: "active", "blocked"
  ```

#### 1.2 API Routes (`/routes/follows.js`)
- `POST /follow/:userId` - Follow a user
- `POST /unfollow/:userId` - Unfollow a user
- `POST /block/:userId` - Block a user
- `GET /followers/:userId` - Get user's followers
- `GET /following/:userId` - Get user's followers list
- `GET /mutual-follows/:userId` - Get mutual followers

#### 1.3 Frontend Components
- Follow/Unfollow button on user profiles
- Followers/Following modals with user lists
- Follow recommendations widget
- Block user functionality

#### 1.4 Features
- Prevent self-follows
- Handle follower notifications
- Privacy controls (public vs private profiles)
- Block/unblock functionality

---

### 2. Activity Feed/Timeline
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH
**Estimated Effort:** 12-15 hours

#### 2.1 Database Models
- **Activity Model** (new)
  ```
  - userId: ObjectId (User)
  - type: "follow", "comment", "favorite", "article_created", "badge_earned"
  - targetId: ObjectId (polymorphic - can be Article, User, etc)
  - targetType: "user", "article", "comment"
  - description: String
  - metadata: Object (flexible for different activity types)
  - createdAt: Date
  - isPublic: Boolean
  ```

#### 2.2 API Routes (`/routes/activity.js`)
- `GET /feed` - Get activity feed for current user
- `GET /feed/:userId` - Get user's public activity
- `POST /activity` - Log activity (internal)
- `DELETE /activity/:activityId` - Delete activity

#### 2.3 Frontend Components
- Activity feed page (`/views/pages/feed.ejs`)
- Activity timeline widget
- Activity filtering (by type)
- Activity detail views
- Infinite scroll or pagination

#### 2.4 Features
- Feed algorithm (chronological + weighted by follows)
- Real-time activity updates (Socket.io ready)
- Activity types: User follows, Comments, Favorites, Articles posted, Badges earned
- Privacy controls (show/hide activity)
- Activity permissions (followers-only, public, private)

---

### 3. Badges/Achievements System
**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated Effort:** 10-12 hours

#### 3.1 Database Models
- **Badge Model** (new)
  ```
  - name: String (unique)
  - description: String
  - icon: String (emoji or icon name)
  - category: "engagement", "contributor", "community", "milestone"
  - criteria: Object (conditions to earn badge)
  - rarity: "common", "uncommon", "rare", "legendary"
  - createdAt: Date
  ```

- **UserBadge Model** (new)
  ```
  - userId: ObjectId (User)
  - badgeId: ObjectId (Badge)
  - earnedAt: Date
  - progress: Number (0-100, for progressive badges)
  ```

#### 3.2 Predefined Badges (12 initial)
1. **Welcome** - First login
2. **Commentator** - 5+ comments
3. **Article Lover** - 10+ favorites
4. **Social Butterfly** - 10+ followers
5. **Influencer** - 50+ followers
6. **Community Voice** - 25+ helpful comments
7. **Consistency** - 10+ days active in a month
8. **Spotlight Star** - Featured in spotlight
9. **Newbie** - First article comment
10. **Engaged Reader** - 50+ articles viewed
11. **Trendsetter** - Comment on trending article
12. **Helper** - Helped another user (via comment likes)

#### 3.3 Badge Logic
- Track user actions and automatically award badges
- Display badge progress to users
- Show badge on user profile
- Notify users when badge earned
- Badge tiers (common → legendary)

#### 3.4 Frontend Components
- Badge display on user profiles
- Badge showcase/collection page
- Badge notifications
- Badge progress indicators
- Badge leaderboards (optional)

---

### 4. Customer Spotlight Feature
**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated Effort:** 10-12 hours

#### 4.1 Database Models
- **CustomerSpotlight Model** (new)
  ```
  - userId: ObjectId (User - the featured customer)
  - title: String
  - description: String
  - bio: String
  - favoriteArticles: [ObjectId]
  - storyTitle: String
  - storyContent: String (markdown or rich text)
  - image: String (profile image)
  - social: { twitter, linkedin, instagram }
  - nominations: Number
  - votes: Number
  - status: "active", "archived", "pending"
  - startDate: Date
  - endDate: Date
  - createdAt: Date
  ```

#### 4.2 API Routes (`/routes/customer-spotlight.js`)
- `GET /customer-spotlight` - Get current/active spotlight
- `GET /customer-spotlight/history` - Get past spotlights
- `POST /customer-spotlight/nominate` - Submit nomination
- `POST /customer-spotlight/:id/vote` - Vote for customer
- `GET /customer-spotlight/nominees` - Get current nominees
- `POST /customer-spotlight/:id/approve` (admin) - Admin approve

#### 4.3 Frontend Components
- Customer Spotlight landing page (`/views/pages/customer-spotlight.ejs`)
- Customer profile featured section
- Nomination form
- Voting system
- Customer showcase carousel
- Customer stories page

#### 4.4 Features
- User nomination system with email notifications
- Public voting (1 vote per user per month)
- Featured customer section on homepage
- Customer story/interview section
- Social sharing for featured customer
- Admin approval before featuring
- Monthly rotation system

---

### 5. Employee Spotlight Feature
**Priority:** MEDIUM
**Complexity:** LOW-MEDIUM
**Estimated Effort:** 8-10 hours

#### 5.1 Database Models
- **EmployeeSpotlight Model** (new)
  ```
  - name: String
  - department: String
  - title: String
  - image: String
  - bio: String
  - role: String (RS staff role)
  - story: String
  - funFacts: [String]
  - achievements: [String]
  - socialLinks: { twitter, linkedin }
  - featuredStartDate: Date
  - featuredEndDate: Date
  - status: "active", "archived"
  - createdAt: Date
  ```

#### 5.2 API Routes (`/routes/employee-spotlight.js`)
- `GET /employee-spotlight` - Get current featured employee
- `GET /employee-spotlight/history` - Get past employees
- `POST /employee-spotlight` (admin) - Create spotlight
- `PUT /employee-spotlight/:id` (admin) - Update spotlight
- `DELETE /employee-spotlight/:id` (admin) - Delete spotlight

#### 5.3 Frontend Components
- Employee Spotlight page (`/views/pages/employee-spotlight.ejs`)
- Employee profile card
- Employee timeline/carousel
- Team directory integration

#### 5.4 Features
- Monthly employee feature
- Admin-managed (internal only)
- Social media templates
- Employee story format
- Fun facts section
- Achievement tracking
- Integration with team directory

---

## Database Changes Summary

### New Collections
1. `follows` - User follow relationships
2. `activities` - User activity feed
3. `badges` - Badge definitions
4. `userbadges` - User badge awards
5. `customerspotlights` - Customer spotlight data
6. `employeespotlights` - Employee spotlight data

### Modified Collections
1. `users` - Add followers, following, followersCount, followingCount, isPublic, badges

---

## Frontend Pages to Create

1. `/views/pages/feed.ejs` - Activity feed page
2. `/views/pages/customer-spotlight.ejs` - Customer spotlight page
3. `/views/pages/employee-spotlight.ejs` - Employee spotlight page
4. `/views/components/badge-display.ejs` - Badge component (reusable)
5. `/views/components/follow-button.ejs` - Follow button component (reusable)

## API Route Files

1. `/routes/follows.js` - Follow system endpoints
2. `/routes/activity.js` - Activity feed endpoints
3. `/routes/badges.js` - Badge system endpoints
4. `/routes/customer-spotlight.js` - Customer spotlight endpoints
5. `/routes/employee-spotlight.js` - Employee spotlight endpoints

## JavaScript Files

1. `/public/js/feed.js` - Feed page logic
2. `/public/js/badges.js` - Badge system logic
3. `/public/js/follows.js` - Follow system logic

## CSS Updates

1. `/public/css/style.css` - Add styles for:
   - Activity feed layout
   - Badge displays
   - Follow buttons
   - Customer/Employee spotlight cards

---

## Implementation Order

### Week 1: Foundation (Days 1-3)
1. Create all database models
2. Set up API routes (skeleton)
3. Create badge system logic

### Week 1-2: Follow System (Days 4-5)
1. Implement follow/unfollow endpoints
2. Add follow UI components
3. Add follow notifications
4. Test follow system

### Week 2: Activity Feed (Days 6-7)
1. Implement activity logging
2. Create feed endpoints
3. Build feed frontend
4. Add activity components
5. Test feed system

### Week 2-3: Badges (Days 8)
1. Implement badge earning logic
2. Create badge display components
3. Build badge notifications
4. Test badge system

### Week 3: Spotlights (Days 9-10)
1. Build Customer Spotlight feature
2. Build Employee Spotlight feature
3. Test both spotlight systems
4. Integration testing

### Final: Testing & Polish (Days 11)
1. End-to-end testing
2. Bug fixes
3. Performance optimization
4. Code review
5. Commit and push

---

## Testing Checklist

- [ ] User can follow/unfollow other users
- [ ] Follower counts update correctly
- [ ] Activity feed shows correct activities
- [ ] Badges award automatically when criteria met
- [ ] Users notified when earning badges
- [ ] Customer spotlight nomination works
- [ ] Customer spotlight voting works
- [ ] Employee spotlight displays correctly
- [ ] All API endpoints tested
- [ ] All UI components render correctly
- [ ] Mobile responsive on all new pages
- [ ] Performance acceptable with large datasets
- [ ] No console errors

---

## Success Metrics

- **User Engagement**: 30%+ of users follow at least one other user
- **Activity Feed**: Users view feed 2+ times per week average
- **Badges**: Users work toward earning badges
- **Customer Spotlight**: 100%+ increase in customer participation
- **Employee Spotlight**: Monthly feature maintained

---

## Notes

- All new features integrate with existing comment system
- Badge system is extensible for future badges
- Customer/Employee spotlights can be expanded to other categories later
- Activity feed uses same glassmorphic design as existing UI
- Follow system respects privacy controls
- All features include proper error handling
- Email notifications for key events (new follower, badge earned, featured)

---

## Branch Information

- **Development Branch**: `claude/shipping-news-site-setup-1LuoS`
- **Commits Per Feature**: 1-2 commits (logical grouping)
- **Testing**: Test each feature before final commit

---

**Ready for Approval**: ✅
**Estimated Completion**: 3-4 weeks
**Next Phase**: Phase 3 - Admin & Content Management
