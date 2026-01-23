# Phase 3.5: Moderation & Governance - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** HIGH
**Complexity:** MEDIUM

---

## Feature Overview

Moderation & Governance System provides tools for content moderation, community standards enforcement, and platform governance. Moderators can review flagged content, take action on violations, and maintain community health. Includes warning system, dispute resolution, and appeals process.

---

## Database Models

### FlagReport Model
```javascript
{
  reportType: String (enum: "comment", "article", "user", "message"),
  reportedId: ObjectId,
  reportedBy: ObjectId,
  reportReason: String (enum: "spam", "harassment", "inappropriate", "misinformation", "copyright", "other"),
  reportDescription: String,
  evidence: [String] (URLs, screenshots)
  status: String (enum: "pending", "reviewing", "resolved", "dismissed"),
  severity: String (enum: "low", "medium", "high", "critical"),
  resolvedBy: ObjectId (Moderator),
  resolution: String,
  actionTaken: String (enum: "warning", "remove", "ban_user", "suspend", "none"),
  createdAt: Date,
  resolvedAt: Date
}
```

### UserWarning Model
```javascript
{
  userId: ObjectId,
  warningNumber: Number (1st, 2nd, 3rd warning),
  reason: String,
  issuedBy: ObjectId (Moderator),
  reportId: ObjectId (Reference to FlagReport),
  severity: String (enum: "minor", "moderate", "serious"),
  expiresAt: Date (Auto-dismiss after 90 days),
  acknowledged: Boolean,
  acknowledgedAt: Date,
  createdAt: Date
}
```

### AppealRequest Model
```javascript
{
  userId: ObjectId,
  appealType: String (enum: "warning", "suspension", "ban"),
  originalActionId: ObjectId (Reference to action being appealed),
  appealReason: String,
  evidence: [String],
  status: String (enum: "pending", "under_review", "approved", "denied"),
  reviewedBy: ObjectId,
  reviewNotes: String,
  decision: String,
  createdAt: Date,
  reviewedAt: Date
}
```

### ModerationQueue Model
```javascript
{
  itemId: ObjectId,
  itemType: String,
  action: String (flag_reason),
  priority: String (enum: "low", "medium", "high", "critical"),
  flags: [ObjectId] (Reference to FlagReports),
  totalFlags: Number,
  status: String (enum: "pending", "reviewing", "resolved"),
  assignedTo: ObjectId (Moderator),
  createdAt: Date,
  updatedAt: Date
}
```

### CommunityGuidelines Model
```javascript
{
  title: String,
  content: String,
  category: String,
  rules: [Object] ({
    rule: String,
    consequence: String,
    examples: [String]
  }),
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 18 Moderation & Governance Features

| Feature | Icon | Type | Purpose |
|---|---|---|---|
| Flag Content | 🚩 | Action | Report inappropriate content |
| Moderation Queue | 📋 | Dashboard | View all flagged items |
| Review Flagged Item | 👁️ | Action | Examine reported content |
| Take Action | ⚖️ | Decision | Remove, warn, or dismiss |
| Issue Warning | ⚠️ | Action | Give user warning |
| View User Warnings | 📊 | Page | See warning history |
| Auto-Ban on Warnings | 🚫 | System | Auto-ban after 3 warnings |
| Suspend User | ⏸️ | Action | Temporarily suspend account |
| Ban User | 🔒 | Action | Permanently ban from platform |
| Appeal Ban | 📞 | Feature | Allow users to appeal actions |
| Appeal Review | 📖 | Process | Moderator reviews appeals |
| Appeal Decision | ✅ | Action | Approve or deny appeal |
| Community Guidelines | 📚 | Page | Display platform rules |
| Guideline Versions | 📝 | History | Track guideline changes |
| Moderation Actions Log | 📋 | Log | Audit trail of all actions |
| Bulk Moderation | 🔄 | Toolbar | Moderate multiple items |
| Content Filter | 🔗 | System | Auto-flag inappropriate words |
| Automated Warnings | 🤖 | System | Auto-warn for repeated violations |

---

## API Endpoints

### POST /api/moderation/flag
- Submit content flag report
- Require reason and optional evidence
- Auto-assign to queue

### GET /api/moderation/queue
- Get moderation queue
- Filter by status, priority, type
- Paginated with sorting
- Show oldest first

### GET /api/moderation/queue/:itemId
- Get specific flagged item details
- Show all reports against item
- Show previous actions

### POST /api/moderation/queue/:itemId/review
- Mark item as under review
- Assign to moderator
- Lock from other moderators

### POST /api/moderation/queue/:itemId/action
- Take action on flagged item
- Remove content
- Issue warning
- Ban user
- Or dismiss

### POST /api/moderation/warnings/:userId
- Issue warning to user
- Set severity level
- Link to report
- Send notification

### GET /api/moderation/warnings/:userId
- Get user's warning history
- Show all warnings
- Show expiration dates

### POST /api/moderation/warnings/:warningId/acknowledge
- User acknowledges warning
- Record acknowledgment time

### POST /api/moderation/users/:userId/suspend
- Suspend user account
- Set suspension duration
- Reason required

### POST /api/moderation/users/:userId/unsuspend
- End user suspension
- Restore access

### GET /api/moderation/users/:userId/status
- Get user moderation status
- Warnings, suspensions, bans
- Appeal history

### POST /api/moderation/appeals
- Submit appeal
- For warning, suspension, or ban
- Provide reason and evidence

### GET /api/moderation/appeals
- Get pending appeals
- Filter by status and type
- Paginated

### POST /api/moderation/appeals/:appealId/review
- Review user appeal
- Provide decision
- Write review notes

### POST /api/moderation/guidelines
- Create community guidelines
- Set version
- Multiple language support

### GET /api/moderation/guidelines
- Get current guidelines
- Return as formatted text
- With rule examples

### GET /api/moderation/logs
- Get moderation action logs
- Filter by moderator, action, date
- Full audit trail

### POST /api/moderation/bulk
- Bulk moderation actions
- Select multiple items
- Apply same action to all

---

## Implementation Steps

### Step 1: Create Moderation Models
- FlagReport schema
- UserWarning schema
- AppealRequest schema
- ModerationQueue schema
- CommunityGuidelines schema

### Step 2: Create Flag System
- Add flag button to articles, comments, users
- Flag submission modal
- Reason and evidence collection
- Auto-create moderation queue item

### Step 3: Create Moderation Queue
- Moderation dashboard page
- Queue display with filters
- Priority sorting
- Claim/assign items

### Step 4: Create Review Interface
- Review page for flagged item
- Show all reports against item
- Show user info and history
- Decision buttons

### Step 5: Create Warning System
- Issue warning endpoint
- Warning count tracking
- Auto-ban on 3 warnings
- Warning expiration (90 days)

### Step 6: Create Ban Management
- User suspension endpoint
- User ban endpoint
- Temporary vs permanent
- Ban reason tracking

### Step 7: Create Appeals Process
- Appeal submission form
- Appeal queue for review
- Review and decision interface
- Appeal history display

### Step 8: Create Community Guidelines
- Guidelines page
- Rule categories
- Consequence tracking
- Violation examples

### Step 9: Add Automated Systems
- Auto-flag for keyword violations
- Auto-warn for repeat violations
- Auto-ban after 3 warnings
- Suspension countdown

### Step 10: Create Moderation Dashboard
- admin/moderation.ejs page
- Queue overview
- Stats and metrics
- Action history

### Step 11: Create Logs System
- Moderation action logs
- Audit trail of all decisions
- Filter and search capabilities
- Export to CSV

### Step 12: Create Content Filter
- Keyword/phrase database
- Auto-flag inappropriate content
- Customizable filter list
- Whitelist for false positives

---

## Files to Create/Modify

**New:**
- `/models/FlagReport.js`
- `/models/UserWarning.js`
- `/models/AppealRequest.js`
- `/models/ModerationQueue.js`
- `/models/CommunityGuidelines.js`
- `/routes/moderation.js`
- `/views/pages/admin/moderation.ejs`
- `/views/pages/admin/moderation-queue.ejs`
- `/views/pages/admin/moderation-item.ejs`
- `/views/pages/admin/appeals.ejs`
- `/views/pages/community-guidelines.ejs`
- `/views/components/flag-button.ejs`
- `/views/components/flag-modal.ejs`
- `/public/js/moderation.js`
- `/public/js/flag-system.js`
- `/public/css/moderation.css`

**Modified:**
- `/models/User.js` - Add warningCount, isSuspended, suspendUntil, isBanned, banReason fields
- `/views/pages/article-detail.ejs` - Add flag button
- `/views/pages/comment.ejs` - Add flag button
- `/views/pages/profile.ejs` - Add flag button
- `/server.js` - Register moderation routes

---

## Auto-Ban Logic Example

```javascript
async function checkAutoban(userId) {
  const warnings = await UserWarning.countDocuments({
    userId,
    expiresAt: { $gt: new Date() }
  });

  if (warnings >= 3) {
    // Auto-ban
    await User.findByIdAndUpdate(userId, {
      isBanned: true,
      banReason: 'Automatic ban after 3 warnings',
      banDate: new Date()
    });

    // Create ban record
    await FlagReport.create({
      reportType: 'user',
      reportedId: userId,
      status: 'resolved',
      actionTaken: 'ban_user',
      resolution: 'Automatic ban - 3 warnings'
    });
  }
}
```

---

## Success Criteria

- [ ] Flag system working on all content types
- [ ] Moderation queue displaying flagged items
- [ ] Warning system issuing and tracking correctly
- [ ] Auto-ban triggering after 3 warnings
- [ ] Suspension and ban functional
- [ ] Appeals process complete
- [ ] Community guidelines displaying
- [ ] Moderation logs recording all actions
- [ ] Bulk moderation actions working
- [ ] Auto-filter catching inappropriate content
- [ ] Appeal expiration working correctly
- [ ] Notifications sent for warnings and bans

---

**Estimated Effort:** 12-16 hours
**Priority:** HIGH (Community safety)
**Complexity:** MEDIUM
