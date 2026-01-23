# Phase 2.5: Employee Spotlight System - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

---

## Feature Overview

Employee Spotlight showcases RS company employees and partners who are actively engaged in the community. Employees can be featured based on their contributions: articles written, community support, moderation, partnerships. This builds brand trust, employee recognition, and strengthens customer relationships by highlighting the humans behind RS.

---

## Database Models

### EmployeeSpotlight Model
```javascript
{
  userId: ObjectId (Featured employee),
  jobTitle: String ("Product Manager", "Community Manager", etc),
  department: String ("Sales", "Engineering", "Support", "Marketing"),
  bio: String (Professional bio, 300 chars),
  imageUrl: String (Professional headshot),
  featuredRole: String ("author", "moderator", "ambassador", "partner"),
  category: String ("leadership", "content", "support", "partnership"),
  featuredUntil: Date (Spotlight duration),
  views: Number (Visibility tracking),
  articleCount: Number (Articles written while featured),
  helpfulComments: Number (Support/helpful comments count),
  moderationActions: Number (Community moderation count),
  stats: Object ({
    articlesWritten: Number,
    communityHelpful: Number,
    moderationActions: Number,
    communityLikes: Number
  }),
  socialLinks: Object ({
    twitter: String,
    linkedin: String,
    website: String
  }),
  pinnedAt: Date,
  isActive: Boolean (Actively engaged),
  createdAt: Date
}
```

### EmployeeRole Model
```javascript
{
  userId: ObjectId,
  jobTitle: String,
  department: String,
  reportingTo: ObjectId (Manager reference),
  responsibilities: String[],
  permissions: String[] (admin, moderator, content-creator),
  joinedAt: Date,
  isActive: Boolean
}
```

---

## 6 Employee Spotlight Roles

| Role | Icon | Focus | Requirements | Badge |
|---|---|---|---|---|
| Community Author | ✍️ | Article writing | 5+ published articles | Author Badge |
| Support Champion | 🤝 | Customer support | 50+ helpful comments | Helper Badge |
| Community Moderator | 🛡️ | Community management | Active moderation, 20+ actions | Moderator Badge |
| Brand Ambassador | 📢 | Community engagement | 100+ interactions, active follower | Ambassador Badge |
| Product Expert | 🎯 | Product knowledge | Expert comments, Q&A responses | Expert Badge |
| Community Partner | 🔗 | Partnerships | Partner content, collaborations | Partner Badge |

---

## API Endpoints

### GET /api/employee-spotlight/featured
- Returns currently featured employees
- Includes role, department, stats
- Filter by role or department
- Paginated (12 per page)

### GET /api/employee-spotlight/featured/:userId
- Get specific employee's spotlight details
- Shows all metrics and engagement stats

### GET /api/employee-spotlight/by-department/:department
- Featured employees filtered by department
- Shows department contributions overview
- Sortable by various metrics

### GET /api/employee-spotlight/leaderboard
- Top employees by contributions
- Ranked by articles, moderation, engagement
- Month/quarter/all-time filters

### POST /api/employee-spotlight/:userId/feature (Admin)
- Create new employee spotlight
- Set role, department, duration
- Upload custom bio and image

### PATCH /api/employee-spotlight/:spotlightId (Admin)
- Update existing spotlight
- Edit bio, role, stats, duration
- Refresh stats from user activity

### DELETE /api/employee-spotlight/:spotlightId (Admin)
- Remove employee from spotlight
- Archive spotlight record

### GET /api/employee-spotlight/roles
- List all available employee roles with descriptions
- Permissions for each role

---

## Implementation Steps

### Step 1: Create Employee Models
- EmployeeSpotlight schema with role-based stats
- EmployeeRole schema for employee tracking
- Department and role categorization
- Permission management structure

### Step 2: Create Employee Routes
- Featured employees listing with filters
- Department-based discovery
- Leaderboard and rankings
- Admin management endpoints

### Step 3: Create Employee Role System
- Role assignment logic
- Permission checking for actions
- Role-based badge awarding
- Activity tracking by role

### Step 4: Create Employee Admin Panel
- Add/remove employees from spotlight
- Edit employee information and roles
- View department breakdown
- Manage employee permissions

### Step 5: Create Employee Showcase Page
- Featured employees grid/list
- Filter by role or department
- Click-through to employee profile
- Employee bio and stats display
- Social link integration

### Step 6: Create Employee Profile Cards
- Department display with styling
- Role badges and icons
- Article and activity counts
- Social media links
- "Follow" button for each employee

### Step 7: Create Leaderboard & Rankings
- Top employees by contributions
- Department-based rankings
- Monthly/quarterly achievements
- Interactive filtering and sorting

### Step 8: Add Styling & Visual Hierarchy
- Employee card designs
- Department color coding
- Role-based badge styling
- Professional portfolio styling
- Responsive employee grid

---

## Files to Create/Modify

**New:**
- `/models/EmployeeSpotlight.js`
- `/models/EmployeeRole.js`
- `/routes/employee-spotlight.js`
- `/views/pages/employee-spotlight.ejs` (Showcase page)
- `/views/pages/employee-directory.ejs` (Directory by department)
- `/views/admin/employee-management.ejs` (Admin panel)
- `/public/js/employee-spotlight.js` (Client logic)
- `/public/css/employee-spotlight.css` (Styling)

**Modified:**
- `/views/components/user-card.ejs` - Add employee badge if featured
- `/views/pages/profile.ejs` - Show employee info if applicable
- `/routes/auth.js` - Load employee data on login
- `/public/css/style.css` - Employee badge styling
- `/server.js` - Register employee-spotlight routes
- `/views/layout.ejs` - Add employee directory link

---

## Employee Spotlight Examples

```
Employee creates 5 published articles → Auto-featured as Community Author
Employee receives 50 helpful comments on support questions → Featured as Support Champion
Employee moderates 20+ comments in month → Featured as Community Moderator
Employee maintains 100+ interactions with community → Featured as Brand Ambassador
Employee featured → Badge added to profile, email notification sent
Employee featured → Appears in employee directory, searchable by department
Leaderboard updated monthly → Shows top contributors by role
Employee spotlight shared → Social links prominent, increased visibility
Department view → Shows all featured employees in that department
Employee leaves RS → Spotlight archived, badge removed, history preserved
```

---

## Success Criteria

- [ ] Employee models and role system created
- [ ] Employee admin management interface working
- [ ] Featured employees showcase page responsive
- [ ] Employee directory filterable by department
- [ ] Employee role badges display correctly
- [ ] Leaderboard showing employee rankings working
- [ ] Social media links displaying properly
- [ ] Employee permission system functional
- [ ] Stats aggregation and tracking working
- [ ] All employee profile pages styled professionally

---

## Integration Points with Phase 2.2-2.3

**Activity Feed Connection:**
- Log when employees are featured
- Track employee article publications
- Show employee help/support activities
- Highlight employee moderation actions

**Badge System Connection:**
- Employees earn badges for community actions
- Special "Employee" category badges
- Role-specific achievement badges
- Featured employee achievement badge

---

**Estimated Effort:** 14-16 hours
**Priority:** HIGH (Core Phase 2 feature)
