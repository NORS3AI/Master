# Phase 3.2: Content Management & Publishing - Implementation Plan

**Status:** Ready for Development
**Timeline:** 4-5 days
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

---

## Feature Overview

Content Management System allows admins and editors to create, schedule, edit, and publish articles with advanced features like rich text editing, draft saving, revision history, and scheduled publishing. Authors can manage their content with version control and publication workflows.

---

## Database Models

### ArticleRevision Model
```javascript
{
  articleId: ObjectId (Reference to Article),
  revisionNumber: Number,
  title: String,
  description: String,
  content: String,
  author: ObjectId,
  changes: Object ({
    fields: [String],
    summary: String
  }),
  createdAt: Date,
  createdBy: ObjectId (Editor/Admin who made change),
  changeReason: String
}
```

### PublishSchedule Model
```javascript
{
  articleId: ObjectId,
  scheduledDate: Date,
  scheduledTime: String ("HH:MM"),
  timezone: String,
  status: String ("scheduled", "published", "cancelled"),
  createdBy: ObjectId,
  notifyAuthor: Boolean,
  socialMediaShare: Boolean,
  tags: [String],
  category: String,
  createdAt: Date
}
```

### ContentDraft Model
```javascript
{
  authorId: ObjectId,
  title: String,
  description: String,
  content: String,
  category: String,
  tags: [String],
  draftSavedAt: Date,
  lastEditedAt: Date,
  autoSaveCount: Number,
  status: String ("draft", "in_review", "scheduled", "published"),
  createdAt: Date
}
```

### ArticleTemplate Model
```javascript
{
  name: String,
  description: String,
  category: String,
  structure: Object ({
    sections: [String],
    placeholders: Object
  }),
  content: String,
  createdBy: ObjectId,
  isPublic: Boolean,
  createdAt: Date
}
```

---

## 18 Content Management Features

| Feature | Icon | Type | Purpose |
|---|---|---|---|
| Rich Text Editor | ✏️ | Editor | Create formatted articles with Quill/CKEditor |
| Article Preview | 👁️ | View | Preview article as it will appear |
| Auto-Save Drafts | 💾 | Function | Auto-save every 30 seconds |
| Save Draft Manually | 📌 | Button | Explicit draft saving |
| Version History | 📜 | List | View all article revisions |
| Rollback to Version | ↩️ | Action | Revert to previous version |
| Revision Comparison | 🔀 | View | Compare two versions side-by-side |
| Draft Management | 📂 | Dashboard | View all drafts with status |
| Schedule Publishing | 📅 | Form | Schedule article for future publish |
| Cancel Scheduled | ❌ | Action | Cancel scheduled publication |
| Category Assignment | 🏷️ | Selector | Assign article to category |
| Tag Management | 🏷️ | Input | Add/remove tags from article |
| Featured Article | ⭐ | Toggle | Mark article as featured |
| Author Assignment | 👤 | Dropdown | Assign article to author |
| SEO Settings | 🔍 | Form | Meta title, description, keywords |
| Social Share Preview | 📤 | Card | Preview Open Graph display |
| Content Calendar | 📋 | Calendar | View scheduled and published content |
| Bulk Actions | 🔄 | Toolbar | Publish/unpublish/delete multiple articles |

---

## API Endpoints

### POST /api/articles/create
- Create new article
- Rich text content support
- Auto-save to draft

### GET /api/articles/:articleId/drafts
- Get all drafts for user
- Sort by date modified
- Include auto-save count

### POST /api/articles/:articleId/save-draft
- Save article as draft
- Auto-save triggered every 30 seconds
- Return draft ID and timestamp

### POST /api/articles/:articleId/publish
- Publish article immediately
- OR schedule for future publish
- Set category, tags, featured status

### GET /api/articles/:articleId/revisions
- Get article revision history
- All versions with timestamps
- Change summaries

### GET /api/articles/:articleId/revisions/:revisionId
- Get specific revision details
- Full content and metadata

### POST /api/articles/:articleId/revert
- Revert article to specific revision
- Create new revision record
- Notify original author

### POST /api/articles/compare-revisions
- Compare two versions
- Return diff/changes
- Highlight modifications

### GET /api/articles/scheduled
- Get all scheduled articles
- Filter by author, date, category
- Show scheduled time and status

### POST /api/articles/:articleId/schedule
- Schedule article for publication
- Set date, time, timezone
- Enable social share scheduling

### DELETE /api/articles/:articleId/schedule
- Cancel scheduled publication
- Optionally keep as draft
- Notify author of cancellation

### GET /api/articles/calendar
- Content calendar view
- Show published, scheduled, draft counts
- By date and category

### POST /api/articles/bulk-publish
- Publish multiple articles
- Select articles and confirm
- Log bulk action

### POST /api/articles/bulk-unpublish
- Unpublish multiple articles
- Keep as draft
- Log bulk action

### POST /api/articles/bulk-delete
- Delete multiple articles
- Move to trash first
- Permanent delete with admin approval

### GET /api/articles/templates
- Get all content templates
- Filter by category
- Admin and user templates

### POST /api/articles/templates
- Create new template
- Save article structure
- Make public or private

### POST /api/articles/from-template/:templateId
- Create article from template
- Pre-fill structure and sections
- Ready for editing

---

## Implementation Steps

### Step 1: Install Rich Text Editor
- Add Quill.js or CKEditor 5
- Configure toolbar options
- Setup image upload to editor

### Step 2: Create Content Models
- ArticleRevision schema
- PublishSchedule schema
- ContentDraft schema
- ArticleTemplate schema

### Step 3: Create Content Routes
- Article creation endpoint
- Draft save endpoint (auto-save)
- Schedule publish endpoint
- Revision history endpoints
- Revision comparison endpoint

### Step 4: Create Editor Page
- views/pages/admin/editor.ejs
- Rich text editor integration
- Draft/publish buttons
- Preview button

### Step 5: Create Draft Management
- Draft list page with filters
- Draft editing interface
- Auto-save indicator
- Draft publication workflow

### Step 6: Create Scheduling Interface
- Schedule publish modal
- Date/time picker
- Timezone selector
- Social media sharing options

### Step 7: Create Revision Dashboard
- Revision history list
- Timeline view of changes
- Side-by-side comparison
- Rollback confirmation

### Step 8: Create Content Calendar
- Calendar view of content
- Filter by status (draft, scheduled, published)
- Drag to reschedule (future enhancement)
- Stats by date and category

### Step 9: Add Auto-Save System
- Save draft every 30 seconds
- Show save indicator
- Notify on unsaved changes
- Recovery from browser crashes

### Step 10: Create Bulk Operations
- Multi-select articles
- Bulk publish/unpublish
- Bulk delete with confirmation
- Bulk tag/category assignment

### Step 11: Add SEO Management
- Meta title editor
- Meta description editor
- Keyword input
- OG image upload/selection
- SEO preview

### Step 12: Create Templates System
- Template editor
- Save article as template
- Template library view
- Create from template flow

---

## Files to Create/Modify

**New:**
- `/models/ArticleRevision.js`
- `/models/PublishSchedule.js`
- `/models/ContentDraft.js`
- `/models/ArticleTemplate.js`
- `/routes/content-management.js`
- `/views/pages/admin/editor.ejs`
- `/views/pages/admin/drafts.ejs`
- `/views/pages/admin/revisions.ejs`
- `/views/pages/admin/content-calendar.ejs`
- `/views/pages/admin/templates.ejs`
- `/public/js/editor.js` (Rich text editor logic)
- `/public/js/draft-manager.js`
- `/public/css/editor.css`

**Modified:**
- `/models/Article.js` - Add fields: revisionCount, isScheduled, publishedDate
- `/routes/articles.js` - Update with new publishing logic
- `/server.js` - Register content management routes

---

## Auto-Save Implementation

```javascript
// Save draft every 30 seconds
setInterval(async () => {
  const content = editor.getContents();
  const title = document.getElementById('title').value;

  await fetch(`/api/articles/${articleId}/save-draft`, {
    method: 'POST',
    body: JSON.stringify({ content, title }),
    headers: { 'Content-Type': 'application/json' }
  });
}, 30000);
```

---

## Success Criteria

- [ ] Rich text editor rendering correctly
- [ ] Auto-save triggering every 30 seconds
- [ ] Draft saving and loading working
- [ ] Revision history capturing all changes
- [ ] Version comparison showing diffs
- [ ] Schedule publish working with timezone
- [ ] Content calendar displaying all statuses
- [ ] Bulk operations functional
- [ ] SEO settings saving correctly
- [ ] Templates creating articles with structure
- [ ] Social preview showing correct OG tags
- [ ] Revision rollback restoring content correctly

---

**Estimated Effort:** 16-20 hours
**Priority:** HIGH (Core content creation feature)
**Complexity:** MEDIUM-HIGH
