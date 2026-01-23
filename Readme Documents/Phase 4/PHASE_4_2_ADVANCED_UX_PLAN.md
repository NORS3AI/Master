# Phase 4.2: Advanced User Experience & Personalization

**Status:** 🔜 Ready for Development
**Features:** 16 Total
**Timeline:** 4-5 days
**Complexity:** MEDIUM
**Dependencies:** Phase 3 Complete, Phase 4.1 partially (user preferences)

---

## 📋 Overview

Phase 4.2 transforms the RS News platform into a highly personalized experience tailored to each user's preferences, interests, and behavior. This phase includes theme customization, intelligent content feeds, discovery algorithms, and comprehensive usage analytics.

---

## 🎯 Sub-Phase Goals

1. **User Personalization** - Preference profiles and customization
2. **Theme System** - Dark/light mode with persistent storage
3. **Smart Feeds** - Personalized content discovery and ranking
4. **Trending Discovery** - Real-time trending content detection
5. **User Analytics** - Personal activity insights and statistics

---

## 📊 Feature Breakdown

### User Preferences & Customization (4 Features)

**4.2.1 User Preference Profile System**
- Comprehensive user preferences storage
- Interest/category preferences (rate interest level)
- Content type preferences (articles, videos, podcasts)
- Reading time availability (busy/moderate/leisure)
- Topic exclusions (don't show certain topics)
- Content language preferences
- Provider/source preferences (favor certain sources)
- Preference versioning and history
- Reset preferences to default
- Import preferences from other accounts

**4.2.2 Dark/Light Theme Support**
- Client-side theme detection (system preference)
- User theme selection (light, dark, auto)
- Persistent theme preference storage
- Real-time theme switching without page reload
- CSS custom properties for theming
- Theme-aware images (different versions for light/dark)
- Syntax highlighting theme support
- Chart colors theme-aware
- Email template theme versions
- Share theme preference across user's devices

**4.2.3 Customizable Homepage**
- Homepage layout options (grid, list, magazine)
- Widget system for homepage sections
- Drag-and-drop widget reordering
- Add/remove sections freely
- Custom section names
- Section-level preferences (collapsed, expanded)
- Save multiple homepage layouts/presets
- Share layouts with community
- Homepage preview before saving
- Reset to default layout

**4.2.4 User Experience Settings**
- Sidebar collapsible preference
- Compact vs spacious layout toggle
- Font size adjustment (90%-150%)
- Line height adjustment
- Content width preference (narrow/medium/wide)
- Card style preference (bordered, shadow, flat)
- Animation preferences (full, reduced, disabled)
- Accessibility options (high contrast, larger fonts)
- Right-to-left language support
- Ad frequency preferences

### Theme & Visual System (3 Features)

**4.2.5 Theming Engine**
- Central theme configuration system
- CSS-in-JS theme variable system
- Support for multiple color schemes
- Color palette customization
- Per-component theme overrides
- Theme provider context setup
- Theme switcher component
- Server-side theme detection from cookies
- Theme persistence across browser sessions
- Theme synchronization across tabs

**4.2.6 Reading Experience Personalization**
- Font family selection (serif, sans-serif, mono)
- Font size per article (independent of global)
- Line height preference per article
- Column width adjustment
- Background color (white, off-white, sepia, dark)
- Focus mode (highlight current paragraph)
- Reading time estimation display
- Estimated time to read
- Reading progress indicator
- Distraction-free mode (hide comments, sidebar)

**4.2.7 Visual Customization Options**
- Color scheme presets (light, dark, sepia, high contrast)
- Custom color picker for theme accent
- Custom color picker for background
- Preset themes (forest, ocean, sunset, midnight, etc.)
- Theme preview before applying
- Theme sync across all devices
- Share custom themes with other users
- Popular community themes showcase
- Theme ratings and reviews
- Import/export theme configurations

### Personalized Content Feed (4 Features)

**4.2.8 Intelligent Content Feed Algorithm**
- User interest matching with article categories/tags
- Content freshness scoring
- Engagement signal weighting
- Collaborative filtering (users like you enjoyed...)
- Diversity in feed (mix of top articles, new, trending)
- Feed ranking algorithm refinement
- A/B testing of feed algorithms
- Feed personalization toggle (personalized vs latest)
- Feed quality metrics tracking
- Time-based feed optimization (different times, different content)

**4.2.9 Interest-Based Content Curation**
- User interest profile (rate interests 1-5)
- Interest categories auto-detection
- Interest learning from reading history
- Interest trend over time
- Sub-interest/specialty topics within categories
- Interest-based recommendations
- Remove/ignore content from non-interests
- Boost content from strong interests
- Interest weight adjustment by user
- Interest analytics and insights

**4.2.10 Personalized Category Feeds**
- Following system per category (already exists)
- Custom category feed ordering
- Category importance weighting
- Category-specific notification preferences
- Category-based article grouping
- Recommendation for new categories based on interests
- Category trending within personalized view
- Category subscription tier options
- Category mute option (still follow but don't show)
- Quick category switching in sidebar

**4.2.11 Homepage Content Blocks**
- "Trending Today" block (24h trending articles)
- "Recommended For You" block (personalized)
- "Recent in [Category]" blocks (by interest)
- "Popular This Week" block
- "Editors' Picks" block (featured content)
- "New from Authors You Follow" block
- "Similar to Your Reading" block
- "Catch Up" block (articles you missed)
- "Community Highlights" block (from spotlights)
- "Learning Path" block (curated series)

### Discovery & Trending (3 Features)

**4.2.12 Trending Content Discovery**
- Real-time trending calculation
- Trending articles leaderboard (hourly, daily, weekly)
- Trending categories
- Trending authors/creators
- Regional trending (geo-based)
- Trending by content type
- New trending indicators in feed
- Trending score algorithm (view count + engagement)
- Trending history and analytics
- Trending notifications for users who follow category

**4.2.13 Discovery Page**
- Dedicated discovery page/section
- Browse trending by time period (today, this week, this month)
- Browse trending by category
- Browse trending by content type (article, video, podcast)
- Explore new categories recommendation
- "Explore More Like This" for any article
- Related articles sidebar
- Discovery filters (most viewed, most shared, most commented)
- Discovery search within trending
- Save discoveries to reading list

**4.2.14 Content Recommendation Engine**
- Recommendation based on reading history
- Recommendation based on user interests
- Recommendation based on user location/region
- Recommendation based on similar users
- Recommendation score calculation
- "You might like" section on article pages
- Related articles at end of article
- Recommendation refresh logic
- Recommendation tracking for evaluation
- Recommendation feedback (helpful/not helpful)

### User Analytics & Insights (2 Features)

**4.2.15 User Activity Dashboard**
- Personal activity overview
- Reading statistics (articles read, total time spent)
- Engagement statistics (comments, favorites, shares)
- Category reading breakdown (pie chart)
- Reading history timeline
- Author following count and statistics
- Reading streak tracking
- Personal leaderboard position (if enabled)
- Badges earned and progress
- Monthly/yearly reading goals and progress

**4.2.16 Reading Insights & Statistics**
- Total articles read lifetime
- Average articles per day/week/month
- Reading time statistics (daily average, total)
- Most read categories (top 5)
- Most read authors (top 5)
- Peak reading hours (when user reads most)
- Reading consistency score
- Reading diversity score (variety in categories)
- Favorite article word clouds
- Reading goals (set and track goals)
- Export reading statistics
- Year in review report (annual)

---

## 🗄️ Database Models Required

### New Models

**UserPreference**
```
Schema:
- userId (ObjectId, ref: User, unique) - User reference
- interests {
  category: { level: 1-5, weight: Number, lastUpdated: Date }
} - Interest profiles
- excludeTopics [String] - Topics to exclude from feed
- contentTypePreferences {
  articles: Boolean,
  videos: Boolean,
  podcasts: Boolean
} - Content type preferences
- readingTimeAvailability (String, enum) - busy|moderate|leisure
- languagePreference [String] - Languages to show
- sourcePreferences {
  source: { favor: Boolean, weight: Number }
} - Source preferences
- feedAlgorithm (String) - personalized|latest|trending
- createdAt, updatedAt
```

**UserThemePreference**
```
Schema:
- userId (ObjectId, ref: User, unique) - User reference
- themeMode (String, enum) - light|dark|auto
- colorScheme (String) - preset theme name
- fontFamily (String) - serif|sans-serif|mono
- fontSize (Number) - 90-150 percentage
- lineHeight (Number) - 1-2.5
- contentWidth (String) - narrow|medium|wide
- layoutStyle (String) - compact|spacious
- customColors {
  accent: String,
  background: String,
  text: String
} - Custom color overrides
- sidebarCollapsed (Boolean)
- animations (String, enum) - full|reduced|disabled
- highContrast (Boolean)
- textColor (String)
- createdAt, updatedAt
```

**UserHomepageLayout**
```
Schema:
- userId (ObjectId, ref: User, unique) - User reference
- layoutMode (String, enum) - grid|list|magazine
- sections [{
  id: String,
  type: String (trending|recommended|category|editors|following|similar),
  order: Number,
  visible: Boolean,
  customName: String,
  collapsed: Boolean,
  itemsPerRow: Number
}] - Ordered section layout
- widgetOrder [String] - Widget IDs in order
- isDefault (Boolean)
- presetName (String) - Named layout preset
- createdAt, updatedAt
```

**PersonalizedFeed**
```
Schema:
- userId (ObjectId, ref: User, index)
- feedId (ObjectId, unique per user per day) - Daily feed snapshot
- articles [{ articleId, reason, rank, score }] - Ranked articles
- generatedAt (Date, index) - When feed was generated
- algorithm (String) - Algorithm version used
- diversity {
  categories: Number,
  authors: Number,
  sources: Number
} - Feed diversity metrics
- quality: {
  avgViewCount: Number,
  avgEngagement: Number
} - Quality metrics
- expiresAt (Date, index) - TTL: 24 hours
```

**TrendingArticle**
```
Schema:
- articleId (ObjectId, ref: Article, index)
- trendingScore (Number) - 0-100 score
- viewsLastHour (Number)
- viewsLastDay (Number)
- sharesLastDay (Number)
- commentsLastDay (Number)
- favoritesLastDay (Number)
- trend (String, enum) - rising|peak|falling|stable
- category (String, index)
- contentType (String)
- region (String) - Optional geolocation
- calculatedAt (Date, index)
- expiresAt (Date, index) - TTL: 7 days
```

**UserActivityInsight**
```
Schema:
- userId (ObjectId, ref: User, unique)
- periodType (String, enum) - daily|weekly|monthly|yearly
- periodStart (Date)
- periodEnd (Date)
- articlesRead (Number)
- totalReadingTime (Number) - minutes
- articlesCommented (Number)
- articlesFavorited (Number)
- articlesShared (Number)
- categoriesRead {
  category: { count: Number, timeSpent: Number }
}
- authorsRead {
  authorId: { count: Number, totalViews: Number }
}
- peakReadingHour (Number) - 0-23
- readingConsistency (Number) - 0-100
- readingDiversity (Number) - 0-100
- readingStreak (Number) - consecutive days
- badges [{
  badgeId,
  earnedAt,
  earnedForStat: String
}]
- createdAt, updatedAt
```

**ContentRecommendation**
```
Schema:
- userId (ObjectId, ref: User, index)
- articleId (ObjectId, ref: Article, index)
- reason (String) - algorithm explanation
- recommendationType (String) - personalized|trending|similar|collaborative
- score (Number) - 0-100
- displayPosition (Number) - where in feed/recommendations
- clicked (Boolean)
- clickedAt (Date)
- feedback (String, enum) - helpful|notHelpful|null
- impressionCount (Number)
- createdAt (Date, index)
- expiresAt (Date, index) - TTL: 30 days
```

### Modified Models

**User Model - Add Fields**
```
- preferenceId: ObjectId (ref: UserPreference)
- themePreferenceId: ObjectId (ref: UserThemePreference)
- homepageLayoutId: ObjectId (ref: UserHomepageLayout)
- readingGoal: Number (articles per month)
- readingGoalProgress: Number
- readingStreak: Number
- lastReadAt: Date
```

**Article Model - Add Fields**
```
- trendingScore: Number (0-100)
- personalizedScore: Map<userId, Number> (cached)
- viewsLastHour: Number (for trending calc)
- sharesLastDay: Number (for trending calc)
```

---

## 🔌 API Endpoints Required

### User Preferences

```
GET /api/preferences
- Get user's preferences
- Response: UserPreference object

PATCH /api/preferences
- Update user preferences
- Body: interests, excludeTopics, contentTypePreferences, etc.
- Response: updated preferences

POST /api/preferences/interests/:category
- Set interest level for category
- Body: level (1-5)
- Response: updated interest

DELETE /api/preferences/interests/:category
- Remove interest in category
- Response: success message

GET /api/preferences/recommended-interests
- Get recommended interests based on reading history
- Response: list of recommended categories with match scores

POST /api/preferences/reset
- Reset all preferences to default
- Response: reset confirmation
```

### Theme Preferences

```
GET /api/theme
- Get user's theme preference
- Response: UserThemePreference object

PATCH /api/theme
- Update theme preference
- Body: themeMode, colorScheme, fontSize, etc.
- Response: updated theme

POST /api/theme/presets/:presetName
- Apply a preset theme
- Response: applied theme

GET /api/theme/presets
- Get available theme presets
- Response: list of themes with previews

POST /api/theme/custom
- Save custom theme
- Body: colors, name, customization values
- Response: saved custom theme

DELETE /api/theme/custom/:themeId
- Delete custom theme
- Response: success message

POST /api/theme/export
- Export theme configuration
- Response: theme JSON/file
```

### Homepage Layout

```
GET /api/homepage/layout
- Get user's homepage layout
- Response: UserHomepageLayout object

PATCH /api/homepage/layout
- Update homepage layout
- Body: sections, layoutMode, etc.
- Response: updated layout

POST /api/homepage/layout/reset
- Reset to default layout
- Response: reset confirmation

POST /api/homepage/layout/presets/:presetName
- Apply layout preset
- Response: applied layout

GET /api/homepage/layout/presets
- Get available layout presets
- Response: list of preset layouts

POST /api/homepage/layout/save-as-preset
- Save current layout as preset
- Body: presetName
- Response: preset saved
```

### Personalized Feed

```
GET /api/feed/personalized
- Get personalized feed for user
- Query: page, limit, type
- Response: paginated articles with personalization data

GET /api/feed/trending
- Get trending articles
- Query: period (hour|day|week), category, page, limit
- Response: trending articles with scores

GET /api/feed/discover
- Get discovery recommendations
- Query: page, limit
- Response: discovery articles with reasons

POST /api/feed/prefer/:articleId
- Mark preference for article (for learning)
- Body: helpful (boolean)
- Response: preference recorded

GET /api/feed/algorithm
- Get feed algorithm details for user
- Response: algorithm version, personalization factors
```

### Trending & Discovery

```
GET /api/trending
- Get trending articles across platform
- Query: period (hour|day|week), category, limit
- Response: trending articles with scores

GET /api/trending/:category
- Get trending articles in category
- Query: period, limit
- Response: category trending articles

GET /api/trending/categories
- Get trending categories
- Query: limit
- Response: trending category list with scores

GET /api/discover
- Get discovery page data
- Query: category, contentType, page
- Response: discovery articles with filters

GET /api/discover/related/:articleId
- Get articles related to specific article
- Response: related articles

GET /api/discover/explore
- Get new categories to explore
- Response: recommended new categories with reasons
```

### Recommendations

```
GET /api/recommendations
- Get content recommendations for user
- Query: page, limit
- Response: recommended articles with reasons

GET /api/recommendations/:articleId
- Get recommendations similar to article
- Query: limit
- Response: similar articles

POST /api/recommendations/:articleId/feedback
- Provide feedback on recommendation
- Body: helpful (boolean), reason
- Response: feedback recorded

GET /api/recommendations/stats
- Get recommendation system performance
- Response: click rate, engagement, diversity metrics
```

### User Analytics

```
GET /api/insights/dashboard
- Get user's activity dashboard
- Response: reading stats, engagement, categories breakdown

GET /api/insights/reading-stats
- Get detailed reading statistics
- Query: period (day|week|month|year)
- Response: comprehensive reading metrics

GET /api/insights/categories
- Get reading breakdown by category
- Query: period
- Response: category reading statistics

GET /api/insights/authors
- Get reading breakdown by author
- Query: limit, period
- Response: author reading statistics

GET /api/insights/timeline
- Get reading history timeline
- Query: page, limit, period
- Response: paginated reading history

GET /api/insights/goals
- Get user's reading goals and progress
- Response: goal settings and progress

PATCH /api/insights/goals
- Update reading goals
- Body: goalType, goalValue, goalPeriod
- Response: updated goals

GET /api/insights/yearly-review
- Get year in review report
- Response: comprehensive yearly stats and insights

POST /api/insights/export
- Export reading statistics
- Query: format (csv|json|pdf)
- Response: exported file
```

---

## 🎨 Frontend Components Required

### Views/Pages

1. **Preferences Page** (`/preferences`)
   - Interest selector with star rating
   - Content type checkboxes
   - Reading time availability select
   - Topic exclusion multi-select
   - Language preferences
   - Provider preferences
   - Feed algorithm selection (personalized/latest/trending)
   - Save and reset buttons

2. **Theme/Settings Page** (`/settings/appearance`)
   - Theme mode selector (light/dark/auto)
   - Preset theme gallery with preview
   - Custom color pickers
   - Font family selector
   - Font size slider
   - Line height slider
   - Content width selector
   - Layout style selection
   - Accessibility options
   - Live preview panel

3. **Homepage Customization** (`/customize-homepage`)
   - Drag-and-drop section reordering
   - Toggle section visibility
   - Section configuration modals
   - Layout mode selector (grid/list/magazine)
   - Preview of layout changes
   - Save and reset buttons
   - Preset layout selector

4. **Discovery Page** (`/discover`)
   - Trending articles by period
   - Trending categories
   - Browse by content type
   - Recommended categories to explore
   - Filter controls
   - Search within trending
   - Save to reading list button

5. **User Insights Dashboard** (`/insights`)
   - Reading statistics cards (articles, time, engagement)
   - Reading by category pie chart
   - Top authors widget
   - Reading streak display
   - Reading goal progress bar
   - Peak reading hours heatmap
   - Monthly reading timeline
   - Badges earned display
   - Export data button

6. **Year in Review** (`/insights/year-review`)
   - Annual summary statistics
   - Most read categories visualization
   - Top authors of the year
   - Reading milestones achieved
   - Badges earned this year
   - Reading consistency graph
   - Share to social button

### JavaScript Managers

```javascript
// PreferenceManager
class PreferenceManager {
  - loadPreferences()
  - updateInterestLevel(category, level)
  - toggleContentType(type, enabled)
  - setReadingTimeAvailability(level)
  - addExcludedTopic(topic)
  - removeExcludedTopic(topic)
  - setFeedAlgorithm(algorithm)
  - getRecommendedInterests()
  - resetAllPreferences()
}

// ThemeManager
class ThemeManager {
  - setTheme(themeMode)
  - getSystemTheme()
  - applyPresetTheme(presetName)
  - applyCustomTheme(customColors)
  - saveCustomTheme(name, colors)
  - deleteCustomTheme(themeId)
  - exportTheme()
  - updateFontSize(percentage)
  - updateLineHeight(value)
  - toggleHighContrast()
}

// HomepageLayoutManager
class HomepageLayoutManager {
  - loadLayout()
  - updateSectionOrder(sections)
  - toggleSectionVisibility(sectionId, visible)
  - setLayoutMode(mode)
  - saveAsPreset(name)
  - applyPreset(presetName)
  - resetToDefault()
  - previewLayout()
  - configureSection(sectionId, config)
}

// FeedManager
class FeedManager {
  - loadPersonalizedFeed(page)
  - loadTrendingFeed(period)
  - loadDiscoveryFeed(category)
  - provideFeedback(articleId, helpful)
  - getFeedAlgorithmInfo()
  - refreshFeed()
  - loadMoreFeed()
}

// InsightsManager
class InsightsManager {
  - loadDashboard()
  - loadReadingStats(period)
  - loadCategoryBreakdown(period)
  - loadAuthorStats(period)
  - loadTimeline(period)
  - loadGoals()
  - updateGoal(goalType, value)
  - generateYearReview()
  - exportStats(format)
}

// DiscoveryManager
class DiscoveryManager {
  - loadTrendingArticles(period, category)
  - loadTrendingCategories(limit)
  - loadRelatedArticles(articleId)
  - loadExploreRecommendations()
  - getRecommendedCategories()
  - searchTrendingContent(query)
}
```

---

## 🔧 Technical Implementation Details

### Feed Personalization Algorithm

```javascript
async function generatePersonalizedFeed(userId, limit = 20) {
  // 1. Get user preferences and interests
  const userPrefs = await UserPreference.findOne({ userId });
  const readingHistory = await Activity.find({ userId }).limit(100);

  // 2. Score articles based on:
  // - User interest match (categories, tags)
  // - Content freshness
  // - Engagement metrics
  // - Diversity (avoid same author/source)

  const scoredArticles = await Article.find().lean().then(articles => {
    return articles.map(article => {
      let score = 0;

      // Interest matching
      userPrefs.interests.forEach(interest => {
        if (article.category === interest.category) {
          score += interest.level * 20;
        }
      });

      // Freshness
      const hoursSincePublish = (Date.now() - article.publishedAt) / 3600000;
      score += Math.max(0, 30 - hoursSincePublish);

      // Engagement
      score += (article.views / 100) * 2;
      score += (article.shares / 10) * 3;

      // Diversity bonus
      if (!articles.map(a => a.category).includes(article.category)) {
        score += 10;
      }

      return { ...article, score };
    });
  });

  // 3. Rank and return
  return scoredArticles
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

### Theme System with CSS Variables

```javascript
// theme.js
const themes = {
  light: {
    primary: '#3498db',
    background: '#ffffff',
    text: '#2c3e50',
    border: '#ecf0f1'
  },
  dark: {
    primary: '#3498db',
    background: '#1a1a1a',
    text: '#ecf0f1',
    border: '#2c3e50'
  },
  sepia: {
    primary: '#b59d7a',
    background: '#f4efd3',
    text: '#5c4033',
    border: '#d2b48c'
  }
};

// Apply theme
function applyTheme(themeName) {
  const theme = themes[themeName];
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}

// CSS usage
/* root.css */
:root {
  --primary: #3498db;
  --background: #ffffff;
  --text: #2c3e50;
  --border: #ecf0f1;
}

body {
  background-color: var(--background);
  color: var(--text);
}
```

### Trending Score Calculation

```javascript
async function calculateTrendingScores() {
  const articles = await Article.find({ publishedAt: { $gte: 24hAgo } });

  articles.forEach(article => {
    const viewsLastHour = article.viewsLastHour || 0;
    const viewsLastDay = article.viewsLastDay || 0;
    const sharesLastDay = article.sharesLastDay || 0;
    const commentsLastDay = article.commentsLastDay || 0;

    // Calculate trend score (0-100)
    const score =
      (viewsLastHour / 10) * 0.3 +  // 30% from recent views
      (sharesLastDay / 5) * 0.3 +   // 30% from shares
      (commentsLastDay / 5) * 0.2 + // 20% from comments
      (viewsLastDay / 100) * 0.2;   // 20% from total views

    article.trendingScore = Math.min(100, score);

    // Determine trend direction
    if (viewsLastHour > viewsLastDay / 24 * 1.5) {
      article.trend = 'rising';
    } else if (viewsLastHour < viewsLastDay / 24 * 0.7) {
      article.trend = 'falling';
    } else {
      article.trend = 'stable';
    }

    article.save();
  });
}

// Run every hour
setInterval(calculateTrendingScores, 3600000);
```

---

## 📈 Expected Outcomes

### User Engagement Improvements
- 35% increase in daily active users (with personalization)
- 40% increase in content discovery
- 45% increase in article reads per session
- 25% increase in time spent on platform

### Personalization Metrics
- Feed click-through rate: 40%+ (vs 20% non-personalized)
- Theme adoption: 60%+ users customize appearance
- Interest accuracy: 85%+ relevance score

### Technical Performance
- Feed generation: <500ms per user
- Theme switching: <100ms (instant)
- Analytics dashboard load: <1s
- Trending calculation: <30s for all articles

---

## 🚀 Development Order

1. Create database models (UserPreference, UserThemePreference, etc.)
2. Implement user preference management API
3. Build theme system with CSS variables
4. Create theme preferences API and UI
5. Implement homepage customization system
6. Build personalized feed algorithm
7. Create trending calculation system
8. Implement discovery page and APIs
9. Build user analytics dashboard
10. Create insights UI components
11. Implement year-in-review feature
12. Testing and optimization

---

## 📝 Notes

- Theme switching should persist across user sessions and devices
- Personalized feed should cache at least 1 hour to reduce calculation
- Trending scores should update every hour automatically
- User preferences should auto-learn from reading history
- Theme should respect system preference if user selects "auto"
- Analytics should be calculated nightly for performance
- Feed diversity important to prevent filter bubbles
- All personalization should have opt-out option

---

**Status:** Ready for Development
**Version:** 4.2.0 (Planning)
**Next:** Begin implementation after plan approval

---
