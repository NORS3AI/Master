# Phase 3.4: Advanced Article Features - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** MEDIUM
**Complexity:** MEDIUM

---

## Feature Overview

Advanced Article Features enhance content discovery, SEO performance, and reading experience. Includes article recommendations, related articles, reading lists, reading time tracking, and advanced SEO optimization for better search engine visibility and user engagement.

---

## Database Models

### ArticleRecommendation Model
```javascript
{
  sourceArticleId: ObjectId,
  recommendedArticleId: ObjectId,
  reason: String ("similar_category", "similar_tags", "same_author", "trending", "user_history"),
  score: Number (0-100),
  clickThroughs: Number,
  createdAt: Date
}
```

### ReadingList Model
```javascript
{
  userId: ObjectId,
  name: String,
  description: String,
  articles: [ObjectId],
  isPublic: Boolean,
  followers: [ObjectId],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### ArticleReadingSession Model
```javascript
{
  userId: ObjectId,
  articleId: ObjectId,
  sessionStarted: Date,
  sessionEnded: Date,
  timeSpent: Number (milliseconds),
  scrollDepth: Number (0-100),
  completed: Boolean,
  bookmarked: Boolean
}
```

### SEOMetadata Model
```javascript
{
  articleId: ObjectId,
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  canonicalUrl: String,
  robotsIndex: String ("index", "noindex"),
  robotsFollow: String ("follow", "nofollow"),
  structuredData: Object (JSON-LD),
  schemaType: String ("Article", "NewsArticle", "BlogPosting"),
  lastUpdated: Date
}
```

---

## 15 Advanced Article Features

| Feature | Icon | Type | Purpose |
|---|---|---|---|
| Related Articles | 🔗 | Widget | Show similar articles below content |
| Recommendations Engine | 🤖 | Algorithm | ML-based content recommendations |
| Recommended For You | 💡 | Section | Personalized recommendations |
| Reading Lists | 📚 | Feature | Create custom reading lists |
| Share Reading List | 👥 | Action | Share list with other users |
| Reading Time Tracking | ⏱️ | Metric | Track time spent reading |
| Article Bookmarks | 🔖 | Action | Bookmark articles to read later |
| Continue Reading | ➡️ | Feature | Resume from where you left off |
| Reading Progress | 📊 | Bar | Show scroll progress through article |
| Scroll Depth Tracking | 📈 | Metric | Track how deep reader scrolled |
| SEO Meta Tags | 🔍 | Settings | Title, description, keywords |
| Open Graph Tags | 🌐 | Tags | Rich social media previews |
| Structured Data (JSON-LD) | 📋 | Schema | Search engine rich snippets |
| Article Schema | 📄 | Markup | NewsArticle schema markup |
| Sitemap Generation | 🗺️ | File | Auto-generated XML sitemap |

---

## API Endpoints

### GET /api/articles/:articleId/related
- Get related articles
- Based on tags, category, author
- Return top 5-8 related articles
- Include similarity score

### GET /api/articles/:articleId/recommendations
- Personalized article recommendations
- Based on reading history
- Based on liked articles
- Based on followed authors
- Return top 10 recommendations

### GET /api/user/recommendations
- User-specific recommendations
- Based on reading history
- Based on preferences
- Based on engagement

### GET /api/reading-lists
- Get user's reading lists
- With article count
- Paginated with sorting

### POST /api/reading-lists
- Create new reading list
- Set name, description, visibility
- Return list ID

### POST /api/reading-lists/:listId/articles
- Add article to reading list
- Check for duplicates
- Return updated list

### DELETE /api/reading-lists/:listId/articles/:articleId
- Remove article from reading list

### POST /api/reading-lists/:listId/share
- Share reading list with user/public
- Generate share link
- Track shares

### GET /api/reading-lists/:listId
- Get reading list details
- With all articles and stats
- View count and engagement

### POST /api/articles/:articleId/bookmark
- Bookmark article
- Add to "Reading Later" list
- Track bookmark time

### GET /api/user/bookmarks
- Get user's bookmarked articles
- Paginated and sorted
- Mark as read

### POST /api/articles/:articleId/reading-session
- Log reading session start
- Track time spent
- Track scroll depth

### PATCH /api/articles/:articleId/reading-session
- Update reading session
- Record completion status
- Final scroll depth

### GET /api/articles/:articleId/seo
- Get SEO metadata for article
- All meta tags and schema

### POST /api/articles/:articleId/seo
- Create/update SEO metadata
- Meta tags
- Structured data

### GET /sitemap.xml
- Generate XML sitemap
- All published articles
- Auto-updated daily

### GET /robots.txt
- Generate robots.txt
- Allow/disallow rules
- Sitemap reference

---

## Implementation Steps

### Step 1: Create Models for Advanced Features
- ArticleRecommendation model
- ReadingList model
- ArticleReadingSession model
- SEOMetadata model

### Step 2: Create Recommendation Algorithm
- Similarity calculation (tags, category, author)
- User reading history analysis
- Preference-based scoring
- Trend calculation

### Step 3: Create Reading List Feature
- Create/edit reading list endpoints
- Add/remove articles from lists
- Share reading list functionality
- Public reading list discovery

### Step 4: Create Reading Session Tracking
- Session start/end logging
- Time spent calculation
- Scroll depth tracking
- Completion tracking

### Step 5: Create Related Articles Widget
- Fetch related articles
- Display below article content
- Show similarity score
- Click tracking

### Step 6: Create Recommendation Widget
- Display personalized recommendations
- "Recommended for you" section
- Top recommendations carousel
- Click-through tracking

### Step 7: Add Bookmarking Feature
- Bookmark button on article
- View bookmarked articles
- Remove bookmarks
- "Read Later" collection

### Step 8: Add SEO Settings
- Meta title/description editor
- Open Graph settings
- Canonical URL input
- Keywords input

### Step 9: Generate Structured Data
- JSON-LD schema generation
- Article schema markup
- News article schema option
- Blog posting schema option

### Step 10: Create Sitemap
- Generate XML sitemap
- Include all articles
- Set update frequency
- Include last modified date

### Step 11: Create Robots.txt
- Auto-generate robots.txt
- Disallow crawling of admin areas
- Allow search engine bots
- Specify sitemap location

### Step 12: Add SEO Page
- Article SEO settings page
- Meta preview display
- Keyword density checker
- SEO score indicator

---

## Files to Create/Modify

**New:**
- `/models/ArticleRecommendation.js`
- `/models/ReadingList.js`
- `/models/ArticleReadingSession.js`
- `/models/SEOMetadata.js`
- `/routes/recommendations.js`
- `/routes/reading-lists.js`
- `/routes/seo.js`
- `/views/pages/reading-lists.ejs`
- `/views/pages/reading-list-detail.ejs`
- `/views/components/reading-progress.ejs`
- `/views/components/related-articles.ejs`
- `/public/js/reading-tracker.js`
- `/public/js/recommendations.js`
- `/public/css/reading-lists.css`

**Modified:**
- `/models/Article.js` - Add SEO fields
- `/views/pages/article-detail.ejs` - Add related articles, recommendations
- `/server.js` - Register new routes, add sitemap and robots.txt
- `/views/layout.ejs` - Add JSON-LD schema in head

---

## Recommendation Algorithm Example

```javascript
async function getRecommendations(userId, articleId) {
  const article = await Article.findById(articleId);
  const userHistory = await ArticleReadingSession.find({ userId })
    .populate('articleId')
    .limit(10);

  const scores = {};

  // Similar tags
  Article.find({ tags: { $in: article.tags } }).forEach(a => {
    scores[a._id] = (scores[a._id] || 0) + 20;
  });

  // Same category
  Article.find({ category: article.category }).forEach(a => {
    scores[a._id] = (scores[a._id] || 0) + 15;
  });

  // Same author
  Article.find({ createdBy: article.createdBy }).forEach(a => {
    scores[a._id] = (scores[a._id] || 0) + 10;
  });

  // Based on user history
  userHistory.forEach(session => {
    Article.find({
      tags: { $in: session.articleId.tags }
    }).forEach(a => {
      scores[a._id] = (scores[a._id] || 0) + 5;
    });
  });

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
}
```

---

## SEO Checklist

- [ ] Meta titles (50-60 characters)
- [ ] Meta descriptions (150-160 characters)
- [ ] Keywords (3-5 relevant keywords)
- [ ] Open Graph tags for social sharing
- [ ] Canonical URL (prevent duplicates)
- [ ] Article schema (JSON-LD markup)
- [ ] Image alt text on all images
- [ ] Internal linking strategy
- [ ] Mobile responsive design
- [ ] Page load speed optimization
- [ ] XML sitemap generation
- [ ] Robots.txt file

---

## Success Criteria

- [ ] Recommendation algorithm returning relevant articles
- [ ] Related articles displaying on article page
- [ ] Reading lists creating and managing correctly
- [ ] Bookmark feature working smoothly
- [ ] Reading time tracking accurate
- [ ] Scroll depth recording properly
- [ ] SEO metadata saving correctly
- [ ] JSON-LD schema valid and rendering
- [ ] Sitemap generating daily
- [ ] Robots.txt file accessible
- [ ] Social media previews showing OG tags
- [ ] Performance metrics tracked

---

**Estimated Effort:** 12-16 hours
**Priority:** MEDIUM (Improves UX and SEO)
**Complexity:** MEDIUM
