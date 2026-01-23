# Phase 4.4: Community Features & Engagement

**Status:** 🔜 Ready for Development
**Features:** 15 Total
**Timeline:** 4-5 days
**Complexity:** MEDIUM
**Dependencies:** Phase 3 Complete, Phase 2 Badges system

---

## 📋 Overview

Phase 4.4 transforms RS News into a vibrant community platform with discussion forums, reputation systems, and social engagement mechanics. This phase fosters user-to-user interaction, community building, and healthy competition through gamification.

---

## 🎯 Sub-Phase Goals

1. **Discussion Forums** - Create threaded conversations
2. **Reputation System** - Points-based user credibility
3. **Community Levels** - Tier-based user progression
4. **Leaderboards** - Competitive ranking displays
5. **Engagement Gamification** - Achievements and rewards

---

## 📊 Feature Breakdown

### Discussion Forums & Threads (4 Features)

**4.4.1 Forum Categories**
- Create forum categories (Technology, News Analysis, Meta, Off-Topic, etc.)
- Category descriptions and icons
- Category-specific rules/guidelines
- Category moderators assignment
- Category stats (thread count, post count, active users)
- Archive old forums
- Category permissions (public, member-only, moderator-only)
- Category custom fields
- Trending forums display
- Popular categories recommendation

**4.4.2 Forum Threads & Discussion**
- Create discussion thread (title, content, tags, category)
- Thread tagging system
- Pin threads (sticky threads at top)
- Lock threads (prevent new replies)
- Thread status (open, closed, archived)
- Thread priority levels (normal, important, urgent)
- Bookmark/watch threads for notifications
- Thread view count and engagement stats
- Sort threads (latest, most active, trending, unanswered)
- Search within forum

**4.4.3 Thread Replies & Conversations**
- Reply to thread with text and formatting
- Quote/reply to specific posts
- Edit and delete own posts (with history)
- Admin edit/delete any post
- Nested replies (threaded conversations)
- Reply notifications to thread subscribers
- Mark reply as helpful/solution
- Thread resolution marking
- Reply moderation queue for new users
- Spam/abuse report on replies

**4.4.4 Forum Moderation & Management**
- Move threads between forums
- Merge duplicate threads
- Soft delete threads (hide but keep data)
- Permanent delete threads (admin only)
- Spam filtering and auto-moderation
- User muting (don't show posts from user)
- Topic bans (prevent user from discussing topic)
- Thread locks (no new replies)
- Category subscription (get notified of new threads)
- Moderation log (who did what when)

### Reputation & User Credibility (4 Features)

**4.4.5 Reputation Points System**
- Earn reputation from:
  - Article published (+10 points)
  - Comment gets upvote (+2 points)
  - Thread post gets helpful mark (+5 points)
  - Answer marked as solution (+10 points)
  - Share article (+1 point)
  - Profile visited (+0.5 point, capped per day)
- Lose reputation from:
  - Post flagged as spam/abuse (-5 points)
  - Account warning (-10 points)
  - Downvote on comment (-2 points)
- Reputation minimum floor (never below 0)
- Reputation history and transactions
- Reputation leaderboard
- Reputation badge thresholds

**4.4.6 User Credibility Scoring**
- Credibility score calculation (reputation + activity + quality)
- Activity score (posts, comments, interactions)
- Quality score (helpfulness ratings, engagement)
- Trustworthiness factor (account age, verification)
- Downvote credibility impact
- Credibility display on user profiles
- Credibility-based content ranking
- High credibility = featured posts
- Credibility requirements for certain features
- Credibility loss recovery path

**4.4.7 Community Levels & Progression**
- 10-level tier system:
  - Level 1: Newcomer (0-50 reputation)
  - Level 2: Active Member (50-150 reputation)
  - Level 3: Contributor (150-400 reputation)
  - Level 4: Expert (400-1000 reputation)
  - Level 5: Authority (1000-2500 reputation)
  - Level 6: Sage (2500-5000 reputation)
  - Level 7: Master (5000-10000 reputation)
  - Level 8: Legend (10000-20000 reputation)
  - Level 9: Icon (20000-50000 reputation)
  - Level 10: Founder (50000+ reputation)
- Level-specific badges
- Level up notifications
- Unlock features per level:
  - Level 2: Can create threads
  - Level 3: Can moderate comments
  - Level 4: Can create forum posts
  - Level 5: Recommended for moderation
  - Level 10: Can create categories
- Level-down on account suspension
- Progress bar to next level
- Level achievement celebration

**4.4.8 User Achievements & Milestones**
- Achievement system integration with Phase 2 badges
- Milestones:
  - First Comment (1 comment total)
  - Century Club (100 points)
  - Thousand Points (1000 points)
  - First Article (1 article published)
  - Ten Articles (10 articles published)
  - First Thread (1 forum thread)
  - Helpful Soul (10 helpful marks)
  - Expert Helper (50 helpful marks)
  - Streak Master (7-day posting streak)
  - Night Owl (post midnight)
  - Early Bird (post 6am-8am)
- Achievement notifications
- Achievement display on profile
- Rarity tiers for achievements
- Progress tracking for multi-step achievements
- Achievement showcase on homepage
- Share achievements on social media

### Leaderboards & Ranking (2 Features)

**4.4.9 Global Leaderboards**
- Reputation leaderboard (weekly, monthly, all-time)
- Activity leaderboard (posts per week)
- Quality leaderboard (helpful marks ratio)
- Article author leaderboard (by views, engagement)
- Engagement leaderboard (comments, shares, interactions)
- New members leaderboard (fastest growing)
- Geographical leaderboards (by country/region)
- Category-specific leaderboards (per forum)
- Leaderboard ranking decay (older scores matter less)
- Top 100 users per leaderboard
- Leaderboard filtering (time period, category)

**4.4.10 User Stats & Rankings**
- Personal ranking display (global and category)
- Percentile ranking (top X% of platform)
- Comparison with friends
- Ranking badges/medals
- Rank change notification (promoted/demoted)
- Historical ranking data
- Rank goals and achievements
- Seasonal rankings (reset monthly/yearly)
- Rank display on user badge/profile
- Privacy option to hide ranking

### User Profiles & Social Features (2 Features)

**4.4.11 Enhanced User Profiles**
- User bio/about section (rich text)
- Profile picture (avatar)
- Cover photo
- Expertise tags (users tag themselves)
- Interests display (from preferences)
- Social media links (Twitter, GitHub, LinkedIn, etc.)
- Verified email badge
- Verified user status (manual admin verification)
- Public/private profile option
- Profile views count and history
- Account creation date badge
- Member since indicator
- Activity heatmap (contributions by day/month)
- Recent activity stream on profile
- User's articles and comments
- User's reading lists
- User's achievements display

**4.4.12 User Following & Network**
- Follow other users (already exists from Phase 2)
- Followers/following list
- Follow notifications
- Block/unblock users
- Private messaging system (DMs)
- Mention system (@username)
- Mention notifications
- Follow-only content (VIP posts)
- Mutual follow indicator
- Network suggestions based on interests
- Followers only replies (on specific posts)
- Suggested users to follow
- Follow activity notification (when someone you follow posts)
- Unfollow with confirmation

### Community Engagement & Features (3 Features)

**4.4.13 Voting & Feedback System**
- Upvote/downvote comments (already exists)
- Upvote/downvote forum posts
- Voting history (what user voted on)
- Voting restrictions (minimum level to vote)
- Prevent self-voting
- Downvote reasons (off-topic, spam, rude, etc.)
- Dispute downvotes (appeal mechanism)
- Vote counts visible to all
- Vote breakdown (up vs down)
- Controversial badges (more downvotes than upvotes)
- Helpful voting (mark as helpful vs unhelpful)
- Sorting by votes/helpfulness
- Most helpful comments featured
- Community voting for deletions (flag + votes = removal)

**4.4.14 Content Moderation by Community**
- Community flag/report system (already exists)
- Vote-based content removal (X downvotes = hidden)
- Community moderation queue
- Community moderator elections (peer voting)
- Moderator powers delegation
- Action appeals (user disputes action)
- Moderation transparency log (public)
- Disputed action review by admins
- Three-strike moderation system
- Dispute resolution voting

**4.4.15 Community Events & Contests**
- Create community events/contests
- Event registration system
- Event countdown and schedule
- Event prizes (reputation, badges, trophies)
- Voting on community poll/contest entries
- Winner announcement and celebration
- Recurring events (weekly discussions, themes)
- Event archives and statistics
- Community voting for event topics
- Sponsor/partner integration for events
- Event notifications to community
- Leaderboard during active events

---

## 🗄️ Database Models Required

### New Models

**ForumCategory**
```
Schema:
- name (String, unique, index) - Category name
- description (String) - Category description
- icon (String) - Icon/emoji
- slug (String, unique) - URL slug
- order (Number) - Display order
- visibility (String, enum) - public|member|moderator
- moderators [ObjectId] - Moderator user IDs
- rules [String] - Category-specific rules
- threadCount (Number) - Cached count
- postCount (Number) - Cached count
- activeUsersMonth (Number) - Monthly active users
- lastActivityAt (Date)
- archivedAt (Date) - null if active
- createdAt, updatedAt
```

**ForumThread**
```
Schema:
- title (String, index)
- content (String)
- authorId (ObjectId, ref: User, index)
- categoryId (ObjectId, ref: ForumCategory, index)
- tags [String] - Thread tags
- status (String, enum) - open|closed|archived|pinned
- priority (String, enum) - normal|important|urgent
- isPinned (Boolean, index) - Sticky thread
- isLocked (Boolean) - No new replies
- solved (Boolean) - Has accepted solution
- solvedBy (ObjectId) - Solution post ID
- views (Number)
- replies (Number)
- helpful (Number) - Upvote count
- helpful_voters [ObjectId] - Who marked helpful
- bookmarks [ObjectId] - Who bookmarked
- watchers [ObjectId] - Subscribed users
- slug (String, unique) - URL slug
- createdAt (Date, index)
- updatedAt (Date, index)
```

**ForumPost**
```
Schema:
- threadId (ObjectId, ref: ForumThread, index)
- content (String)
- authorId (ObjectId, ref: User, index)
- quotePostId (ObjectId) - Replying to this post
- helpful (Number) - Upvote count
- unhelpful (Number) - Downvote count
- voters {
  helpful: [ObjectId],
  unhelpful: [ObjectId],
  downvoteReasons: {userId: String}
}
- isMarkedSolution (Boolean)
- markedAt (Date)
- isModerated (Boolean)
- moderationReason (String)
- editedAt (Date)
- editedBy (ObjectId)
- editHistory [{content, editedAt, editedBy}]
- deletedAt (Date)
- deletedBy (ObjectId)
- flagReportId (ObjectId, ref: FlagReport)
- createdAt (Date, index)
```

**UserReputation**
```
Schema:
- userId (ObjectId, ref: User, unique)
- totalReputation (Number, index)
- transactions [{
  action: String,
  points: Number,
  description: String,
  relatedId: ObjectId,
  timestamp: Date
}]
- monthlyReputation (Number) - Current month
- weeklyReputation (Number) - Current week
- reputationLevel (Number) - 0-100 for badge tiers
- reputationHistoryByMonth {
  'YYYY-MM': Number
}
- reputationFactors {
  articlesPublished: Number,
  commentUpvotes: Number,
  solutionsMarked: Number,
  helpfulMarks: Number,
  shares: Number
}
- createdAt (Date)
- updatedAt (Date, index)
```

**UserLevel**
```
Schema:
- userId (ObjectId, ref: User, unique)
- level (Number, 1-10, index) - Current level
- nextLevelRepRequired (Number) - Reputation needed for next level
- levelHistory [{
  level: Number,
  achievedAt: Date,
  reputationAt: Date
}]
- levelBadges [String] - Badges for current level
- unlockedFeatures [String] - Features unlocked by level
- levelProgress (Number) - 0-100 percentage to next level
- updatedAt (Date, index)
```

**UserAchievement**
```
Schema:
- userId (ObjectId, ref: User, index)
- achievementId (ObjectId, ref: Achievement, index)
- earnedAt (Date, index)
- progress {
  current: Number,
  required: Number,
  percentage: 0-100
} - For multi-step achievements
- milestone (Boolean) - Is major achievement
- notificationSent (Boolean)
- sharedAt (Date) - If shared to social
- createdAt (Date)
```

**Leaderboard** (snapshot-based for performance)
```
Schema:
- type (String, index, enum) - reputation|activity|quality|articles|engagement
- period (String, enum) - weekly|monthly|yearly|allTime
- rankings [{
  userId: ObjectId,
  username: String,
  rank: Number,
  score: Number,
  change: Number (from previous period)
}]
- generatedAt (Date)
- expiresAt (Date, index) - TTL: varies by period
```

**UserProfile** (extension of User model)
```
Schema:
- userId (ObjectId, ref: User, unique)
- bio (String, maxlength: 500)
- profilePicture (String)
- coverPhoto (String)
- expertiseTags [String]
- socialLinks {
  twitter: String,
  github: String,
  linkedin: String,
  website: String
}
- isVerified (Boolean)
- verifiedAt (Date)
- verifiedBy (ObjectId)
- isPublic (Boolean)
- profileViews (Number)
- profileViewHistory [{
  viewedBy: ObjectId,
  viewedAt: Date
}]
- followerCount (Number)
- followingCount (Number)
- followers [ObjectId]
- following [ObjectId]
- blocked [ObjectId] - Blocked users
- blockedBy [ObjectId] - Who blocked this user
- badges [ObjectId] - Achievement/badge refs
- createdAt, updatedAt
```

**CommunityEvent**
```
Schema:
- title (String)
- description (String)
- eventType (String, enum) - contest|challenge|discussion|voting
- category (String)
- startDate (Date, index)
- endDate (Date, index)
- rules [String]
- prizes [{
  place: Number,
  reward: String
}]
- maxParticipants (Number)
- participants [ObjectId]
- entries [{
  userId: ObjectId,
  content: String,
  votes: Number,
  createdAt: Date
}]
- winners [ObjectId]
- status (String, enum) - upcoming|active|completed
- createdBy (ObjectId, ref: User)
- featured (Boolean)
- createdAt, updatedAt
```

### Modified Models

**User Model - Add Fields**
```
- reputationId: ObjectId (ref: UserReputation)
- levelId: ObjectId (ref: UserLevel)
- profileId: ObjectId (ref: UserProfile)
- achievements [ObjectId] (ref: UserAchievement)
- forumPostCount: Number
- forumThreadCount: Number
```

---

## 🔌 API Endpoints Required

### Forum Categories

```
GET /api/forums
- List all forum categories
- Response: paginated categories with stats

GET /api/forums/:categorySlug
- Get single category details
- Response: category with rules and moderators

POST /api/forums (admin)
- Create new forum category
- Body: name, description, icon, visibility
- Response: created category

PATCH /api/forums/:categoryId (admin)
- Update category
- Response: updated category

DELETE /api/forums/:categoryId (admin)
- Delete category
- Response: success message
```

### Forum Threads

```
GET /api/forums/:categoryId/threads
- List category threads
- Query: page, sort, status
- Response: paginated threads

POST /api/forums/:categoryId/threads
- Create new thread
- Body: title, content, tags
- Response: created thread

GET /api/forums/threads/:threadId
- Get thread details with posts
- Query: page (for posts)
- Response: thread with paginated posts

PATCH /api/forums/threads/:threadId
- Update thread (edit content, change status)
- Body: content, status, priority
- Response: updated thread

DELETE /api/forums/threads/:threadId
- Delete thread
- Response: success message

POST /api/forums/threads/:threadId/pin (moderator)
- Pin thread
- Response: success message

POST /api/forums/threads/:threadId/lock (moderator)
- Lock thread
- Response: success message

POST /api/forums/threads/:threadId/watch
- Subscribe to thread updates
- Response: subscribed confirmation

POST /api/forums/threads/:threadId/mark-solved/:postId
- Mark post as solution
- Response: success message
```

### Forum Posts

```
POST /api/forums/threads/:threadId/posts
- Reply to thread
- Body: content, quotePostId (optional)
- Response: created post

PATCH /api/forums/posts/:postId
- Edit post
- Body: content
- Response: updated post

DELETE /api/forums/posts/:postId
- Delete post
- Response: success message

POST /api/forums/posts/:postId/vote
- Upvote/downvote post
- Body: vote (1|-1|0)
- Response: updated votes

POST /api/forums/posts/:postId/helpful
- Mark post as helpful
- Body: helpful (true|false)
- Response: updated count

GET /api/forums/posts/:postId/history
- Get edit history
- Response: list of edits
```

### Reputation & Levels

```
GET /api/reputation/:userId
- Get user's reputation info
- Response: UserReputation object

GET /api/levels/:userId
- Get user's level info
- Response: UserLevel object

GET /api/leaderboard/:type
- Get leaderboard
- Query: period, category, limit
- Response: ranked user list

GET /api/leaderboard/:type/user/:userId
- Get user's ranking
- Response: user rank and surrounding users

POST /api/achievements/:userId/check
- Check for new achievements
- Response: newly earned achievements
```

### User Profiles & Network

```
GET /api/users/:userId/profile
- Get user profile
- Response: UserProfile object

PATCH /api/users/:userId/profile
- Update profile
- Body: bio, profilePicture, socialLinks, etc.
- Response: updated profile

GET /api/users/:userId/followers
- Get user's followers
- Response: list of follower users

GET /api/users/:userId/following
- Get user's following list
- Response: list of followed users

POST /api/users/:userId/follow
- Follow user
- Response: success message

POST /api/users/:userId/unfollow
- Unfollow user
- Response: success message

POST /api/users/:userId/block
- Block user
- Response: success message

GET /api/users/:userId/stats
- Get user's activity stats
- Response: posts, comments, articles, achievements

POST /api/messages
- Send direct message
- Body: recipientId, content
- Response: message created

GET /api/messages/conversations
- Get user's message conversations
- Response: conversation list
```

### Community Events

```
GET /api/events
- List community events
- Query: status, category
- Response: paginated events

POST /api/events (admin)
- Create new event
- Body: title, description, startDate, endDate, etc.
- Response: created event

GET /api/events/:eventId
- Get event details
- Response: event with entries

POST /api/events/:eventId/join
- Join event
- Response: joined confirmation

POST /api/events/:eventId/submit
- Submit entry to contest
- Body: content
- Response: created entry

POST /api/events/:eventId/entries/:entryId/vote
- Vote for contest entry
- Response: updated vote count
```

---

## 🎨 Frontend Components Required

### Views/Pages

1. **Forum Homepage** (`/forums`)
   - Category list with stats
   - Recent threads widget
   - Most active users this week
   - Featured threads
   - Create thread button

2. **Forum Category** (`/forums/:categorySlug`)
   - Thread list with sorting options
   - Create new thread button
   - Category info panel
   - Category rules display
   - Active users in category

3. **Forum Thread** (`/forums/threads/:threadSlug`)
   - Thread details and content
   - Paginated posts/replies
   - Reply form with formatting
   - Vote/helpful buttons
   - Thread status indicators
   - Solution marking UI

4. **User Profile** (`/profile/:userId`)
   - User bio and avatar
   - Reputation and level badge
   - Achievements display
   - Social links
   - Follower/following counts
   - Recent activity timeline
   - Articles and posts list

5. **Leaderboards** (`/leaderboards`)
   - Multiple leaderboard tabs (reputation, activity, etc.)
   - Time period selector (weekly/monthly/all-time)
   - Top 100 ranking display
   - User's personal rank highlight
   - Rank change arrows

6. **Community Events** (`/events`)
   - Upcoming events display
   - Active contests
   - Event details modal
   - Entry submissions
   - Contest voting interface

### JavaScript Managers

```javascript
// ForumManager
class ForumManager {
  - loadForums()
  - loadCategory(categoryId)
  - loadThread(threadId)
  - createThread(data)
  - createPost(threadId, data)
  - editPost(postId, content)
  - deletePost(postId)
  - votePost(postId, vote)
  - markHelpful(postId)
  - pinThread(threadId)
  - lockThread(threadId)
  - watchThread(threadId)
  - markSolved(threadId, postId)
}

// ReputationManager
class ReputationManager {
  - loadReputation(userId)
  - loadLeaderboard(type, period)
  - getUserRank(userId)
  - checkAchievements(userId)
  - logReputationTransaction(action, points)
}

// UserProfileManager
class UserProfileManager {
  - loadProfile(userId)
  - updateProfile(data)
  - followUser(userId)
  - unfollowUser(userId)
  - blockUser(userId)
  - sendMessage(recipientId, content)
  - loadFollowers(userId)
  - loadFollowing(userId)
}

// CommunityEventManager
class CommunityEventManager {
  - loadEvents(filter)
  - loadEventDetails(eventId)
  - joinEvent(eventId)
  - submitEntry(eventId, content)
  - voteEntry(eventId, entryId)
}
```

---

## 🔧 Technical Implementation Details

### Reputation Calculation Algorithm

```javascript
async function calculateReputation(userId) {
  const repLog = await UserReputation.findOne({ userId });
  let totalRep = 0;

  // Articles published: +10 each
  const articles = await Article.countDocuments({ authorId: userId });
  totalRep += articles * 10;

  // Comment upvotes: +2 each
  const commentUpvotes = await Comment.aggregate([
    { $match: { authorId: userId } },
    { $group: { _id: null, totalUpvotes: { $sum: '$helpful' } } }
  ]);
  totalRep += (commentUpvotes[0]?.totalUpvotes || 0) * 2;

  // Forum posts marked helpful: +5 each
  const helpfulPosts = await ForumPost.countDocuments({
    authorId: userId,
    helpful: { $gte: 1 }
  });
  totalRep += helpfulPosts * 5;

  // Solutions marked: +10 each
  const solutions = await ForumPost.countDocuments({
    authorId: userId,
    isMarkedSolution: true
  });
  totalRep += solutions * 10;

  repLog.totalReputation = totalRep;
  await repLog.save();

  // Check for level up
  await checkLevelUp(userId, totalRep);
}

// Run after reputation-affecting actions
```

### Level Progression System

```javascript
const LEVEL_THRESHOLDS = [
  0,        // Level 1
  50,       // Level 2
  150,      // Level 3
  400,      // Level 4
  1000,     // Level 5
  2500,     // Level 6
  5000,     // Level 7
  10000,    // Level 8
  20000,    // Level 9
  50000     // Level 10
];

const LEVEL_FEATURES = {
  2: ['create_threads'],
  3: ['moderate_comments'],
  4: ['create_forum_posts'],
  5: ['moderator_candidate'],
  10: ['create_categories']
};

async function checkLevelUp(userId, reputation) {
  const userLevel = await UserLevel.findOne({ userId });
  let newLevel = 1;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (reputation >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
      break;
    }
  }

  if (newLevel > userLevel.level) {
    userLevel.level = newLevel;
    userLevel.levelHistory.push({
      level: newLevel,
      achievedAt: new Date(),
      reputationAt: reputation
    });
    userLevel.unlockedFeatures = LEVEL_FEATURES[newLevel] || [];
    await userLevel.save();

    // Send notification
    await sendNotification(userId, {
      type: 'level_up',
      message: `You've reached Level ${newLevel}!`,
      level: newLevel
    });
  }
}
```

### Leaderboard Generation

```javascript
async function generateLeaderboards() {
  const types = ['reputation', 'activity', 'quality', 'articles'];

  for (const type of types) {
    const query = type === 'reputation'
      ? { totalReputation: -1 }
      : type === 'activity'
      ? { forumPostCount: -1 }
      : type === 'quality'
      ? { credibilityScore: -1 }
      : { articleCount: -1 };

    const rankings = await User.find()
      .sort(query)
      .limit(100)
      .lean();

    const leaderboard = await Leaderboard.findOneAndUpdate(
      { type, period: 'allTime' },
      {
        rankings: rankings.map((user, idx) => ({
          userId: user._id,
          username: user.username,
          rank: idx + 1,
          score: query[Object.keys(query)[0]] > 0
            ? user[Object.keys(query)[0]]
            : user[Object.keys(query)[0]]
        })),
        generatedAt: new Date()
      },
      { upsert: true }
    );
  }
}

// Run daily
setInterval(generateLeaderboards, 86400000);
```

---

## 📈 Expected Outcomes

### Community Engagement
- 50% increase in user-to-user interactions
- 40% increase in forum activity
- 30% increase in repeat visits
- 25% increase in average session duration

### User Retention
- Gamification increases 6-month retention by 35%
- Community features increase network effects
- Leaderboards drive competitive engagement

### Platform Quality
- Reputation system promotes quality content
- Community moderation reduces moderation burden
- Expert identification improves visibility of quality contributors

---

## 🚀 Development Order

1. Create database models (ForumCategory, ForumThread, ForumPost, UserReputation, etc.)
2. Implement forum API endpoints
3. Build forum UI (category, thread, post pages)
4. Implement reputation calculation system
5. Create leaderboard system and snapshots
6. Implement level progression
7. Build achievement system integration
8. Create user profile pages
9. Implement following/blocking system
10. Build community events system
11. Create voting and moderation features
12. Build leaderboard UI components
13. Testing and optimization

---

## 📝 Notes

- Reputation transactions should be logged for transparency
- Leaderboard snapshots prevent real-time calculation overhead
- Level progression should be visible and motivating
- Community events drive engagement spikes
- Moderation tools should be transparent to prevent abuse
- Achievement unlocking should feel rewarding
- User profiles are key to social discovery
- Forums should have clear moderation policies

---

**Status:** Ready for Development
**Version:** 4.4.0 (Planning)
**Next:** Begin implementation after plan approval

---
