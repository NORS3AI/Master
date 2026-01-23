# Phase 4.1: Email & Notifications System

**Status:** 🔜 Ready for Development
**Features:** 18 Total
**Timeline:** 4-5 days
**Complexity:** MEDIUM-HIGH
**Dependencies:** Phase 3 Complete, Socket.io library, Nodemailer setup

---

## 📋 Overview

Phase 4.1 extends user engagement through intelligent email and notification systems. This phase implements multi-channel notifications (email, in-app, push) with preference management, delivery tracking, and automation capabilities.

---

## 🎯 Sub-Phase Goals

1. **Email Infrastructure** - Setup email delivery with templates and tracking
2. **Real-Time Notifications** - Socket.io integration for instant in-app alerts
3. **Notification Management** - User preferences and notification center
4. **Delivery & Analytics** - Track email opens/clicks and notification engagement
5. **Automation** - Scheduled series and digest emails

---

## 📊 Feature Breakdown

### Email System (6 Features)

**4.1.1 Email Templates & Rendering**
- Framework for EJS email templates
- Template variables and personalization
- Preview and test email functionality
- Support for HTML and plain text versions
- Responsive email design (mobile-friendly)
- Template versioning and history

**4.1.2 Transactional Email Delivery**
- Send emails via Nodemailer (or SendGrid/AWS SES)
- Queue system for reliable delivery
- Retry logic for failed sends (exponential backoff)
- Rate limiting to prevent spam
- Bounce handling and error logging
- Delivery status tracking (sent, bounced, failed)

**4.1.3 Email Digest System**
- Daily/weekly digest compilation
- Customizable digest frequency per user
- Digest content: top articles, new in categories, user activity
- Scheduled job for digest generation
- Archive of past digests
- Unsubscribe link and preferences

**4.1.4 Newsletter System**
- Newsletter template creation and management
- Newsletter scheduling and campaigns
- Segment-based targeting (by category interest, location, etc.)
- A/B testing for subject lines and content
- Newsletter archives and history
- Unsubscribe rate tracking

**4.1.5 Automated Email Series**
- Welcome email series for new users (5-email sequence)
- Re-engagement series for inactive users
- Article follow-up emails (when user follows category/author)
- Milestone celebration emails (100th comment, 1st article, etc.)
- Customizable delay between emails
- Series pause/resume functionality

**4.1.6 Email Preference Management**
- User email notification preferences page
- Toggle for each notification type
- Frequency selection (immediate, daily, weekly, never)
- Category-specific preferences
- Global unsubscribe option
- Email list cleanup (detect invalid addresses)

### In-App & Push Notifications (7 Features)

**4.1.7 Notification Center**
- In-app notification bell with count badge
- Notification list with pagination
- Mark as read/unread functionality
- Clear all notifications option
- Filter by notification type
- Notification grouping by date
- 30-day retention policy (auto-delete old)

**4.1.8 Real-Time Push Notifications via Socket.io**
- Socket.io server setup and connection handling
- Client-side Socket.io library integration
- Real-time notification delivery to connected users
- Fallback to polling if WebSocket unavailable
- Broadcast to multiple clients (same user logged in multiple tabs)
- Connection heartbeat/ping to keep alive
- Automatic reconnection on disconnect

**4.1.9 Notification Types & Events**
- Reply to your comment
- Article published in followed category
- User you follow published article
- Someone followed you
- Article reached milestone (100 views, 50 shares, etc.)
- Comment on your article
- Featured in spotlight
- Badges earned
- Admin messages
- Community alerts (new guidelines, maintenance)

**4.1.10 Notification Delivery Pipeline**
- Multi-channel routing (email, in-app, push)
- User preference respect in pipeline
- Notification deduplication (don't send same notification twice)
- Batching small notifications for efficiency
- Priority levels (urgent, normal, low)
- Quiet hours support (no notifications 10pm-8am by default)

**4.1.11 Browser Push Notifications**
- Service Worker integration for push support
- Notification permission request flow
- Device registration/subscription management
- Push notification from backend
- Click handling (navigate to relevant content)
- Browser notification API support

**4.1.12 Notification User Preferences**
- Email notification frequency (immediate, daily digest, weekly, never)
- Email types to receive
- Do Not Disturb hours (start time, end time, timezone)
- Push notification opt-in/out
- Browser notification opt-in/out
- Quiet mode (disable all non-urgent)
- Per-category notification settings

**4.1.13 Notification Analytics**
- Delivery rate tracking
- Open/click rate tracking (for emails)
- Notification engagement metrics
- Most engaged notification types
- User preferences impact analysis
- A/B testing results for emails

### Tracking & Automation (5 Features)

**4.1.14 Email Delivery Tracking**
- Pixel tracking for email opens
- Link click tracking (redirect through tracking URL)
- Bounce tracking (hard bounces removed from list)
- Complaint handling (spam reports)
- Delivery time statistics
- Email health score per recipient

**4.1.15 Notification Activity Logging**
- Log all sent notifications
- Log opens/clicks on notifications
- Track notification engagement over time
- Link notifications to user actions
- Generate notification engagement reports
- Audit trail for compliance

**4.1.16 Scheduled Notification Jobs**
- Daily digest compilation at specified times (timezone-aware)
- Weekly newsletter sending
- Automated series email sending
- Re-engagement series trigger
- Cleanup of old notifications
- Email list validation runs

**4.1.17 Smart Notification Batching**
- Combine multiple small notifications into single email
- Batch window configuration (e.g., send batched every hour)
- Smart batching rules (don't batch urgent notifications)
- Prevent notification fatigue
- Configurable batch size and frequency
- Per-user batch preference

**4.1.18 Do Not Disturb & Quiet Hours**
- User-defined quiet hours (start/end time)
- Timezone support for quiet hours
- Urgent notifications bypass quiet hours
- Weekend quiet mode option
- Vacation mode (pause all non-critical)
- Holiday calendar integration

---

## 🗄️ Database Models Required

### New Models

**NotificationTemplate**
```
Schema:
- name (String, unique) - Template identifier
- title (String) - Notification title template
- message (String) - Message template with variables
- emailTemplate (String) - Email HTML template
- type (String, enum) - Template type
- category (String) - Notification category
- variables [String] - Available template variables
- createdAt, updatedAt
```

**UserNotificationPreference**
```
Schema:
- userId (ObjectId, ref: User, unique) - User reference
- emailFrequency (String, enum) - immediate|daily|weekly|never
- pushEnabled (Boolean)
- browserNotificationsEnabled (Boolean)
- quietHoursStart (String) - Time format HH:mm
- quietHoursEnd (String)
- timezone (String) - IANA timezone
- vacationMode (Boolean)
- vacationUntil (Date)
- notificationTypes {
    reply: Boolean,
    follow: Boolean,
    badge: Boolean,
    featured: Boolean,
    article: Boolean,
    admin: Boolean
  }
- categoryNotifications {
  category: Boolean
} - Per-category settings
- doNotDisturbWeekends (Boolean)
- createdAt, updatedAt
```

**EmailCampaign**
```
Schema:
- name (String) - Campaign name
- type (String, enum) - newsletter|digest|series|broadcast
- subject (String) - Email subject
- templateId (ObjectId, ref: NotificationTemplate)
- content (String) - Email content
- recipientSegment (String) - Target segment criteria
- scheduledDate (Date) - When to send
- status (String, enum) - draft|scheduled|sent|paused|cancelled
- sentCount (Number)
- openCount (Number)
- clickCount (Number)
- bounceCount (Number)
- createdBy (ObjectId, ref: User)
- createdAt, updatedAt
```

**NotificationLog**
```
Schema:
- userId (ObjectId, ref: User, index)
- type (String, index) - Notification type
- title (String)
- message (String)
- relatedId (ObjectId) - Article/Comment/User id
- relatedType (String) - article|comment|user|badge
- channel (String, enum) - email|in_app|push
- status (String, enum) - sent|delivered|opened|clicked|failed
- sentAt (Date, index)
- deliveredAt (Date)
- openedAt (Date)
- clickedAt (Date)
- metadata {
  emailId: String,
  trackingPixelId: String,
  clickTrackingUrls [String]
}
- createdAt (Date, index)
- expiresAt (Date, index) - TTL: 30 days
```

**EmailDeliveryLog**
```
Schema:
- emailAddress (String, index)
- campaignId (ObjectId, ref: EmailCampaign)
- templateId (ObjectId, ref: NotificationTemplate)
- messageId (String) - External provider message ID
- status (String, enum) - sent|delivered|opened|clicked|bounced|complained|failed
- bounceType (String, enum) - hard|soft|none
- deliveredAt (Date)
- openedAt (Date)
- clicks [{ timestamp, url }]
- failureReason (String)
- metadata {
  provider: String,
  ipAddress: String,
  userAgent: String
}
- createdAt (Date, index)
- expiresAt (Date, index) - TTL: 90 days
```

**ScheduledNotification**
```
Schema:
- userId (ObjectId, ref: User, index)
- templateId (ObjectId, ref: NotificationTemplate)
- type (String) - series|digest|reengagement
- seriesId (ObjectId) - For series tracking
- stepNumber (Number) - Which step in series
- variables {
  dynamic: true
} - Personalization variables
- scheduledFor (Date, index)
- status (String, enum) - pending|sent|failed|cancelled
- retryCount (Number)
- lastRetryAt (Date)
- sentAt (Date)
- errorMessage (String)
- createdAt (Date, index)
```

### Modified Models

**User Model - Add Fields**
```
- pushSubscription: String - Service Worker subscription
- notificationPreferenceId: ObjectId
- lastNotificationViewedAt: Date
- emailVerificationToken: String (for list validation)
- emailBounceCount: Number
- emailVerified: Boolean
```

---

## 🔌 API Endpoints Required

### Email Campaign Management

```
POST /api/email/campaigns
- Create new email campaign
- Body: name, type, subject, templateId, recipientSegment, scheduledDate
- Response: campaign object

GET /api/email/campaigns
- List all email campaigns (admin only)
- Query: page, limit, status, type
- Response: paginated campaigns

GET /api/email/campaigns/:campaignId
- Get single campaign details
- Response: campaign with stats (sent, opened, clicked)

PATCH /api/email/campaigns/:campaignId
- Update campaign
- Body: any updatable fields
- Response: updated campaign

POST /api/email/campaigns/:campaignId/send
- Trigger campaign sending (admin only)
- Response: status, sentCount

DELETE /api/email/campaigns/:campaignId
- Cancel/delete campaign
- Response: success message

GET /api/email/campaigns/:campaignId/stats
- Get detailed campaign statistics
- Response: { sentCount, deliveredCount, openRate, clickRate, bounceRate }

POST /api/email/campaigns/:campaignId/ab-test
- Setup A/B test variants
- Body: variantA, variantB, splitPercentage
- Response: test setup confirmation
```

### Email Preferences

```
GET /api/email/preferences
- Get current user's email preferences
- Response: UserNotificationPreference object

PATCH /api/email/preferences
- Update email notification preferences
- Body: emailFrequency, quietHours, timezone, notificationTypes, etc.
- Response: updated preferences

POST /api/email/preferences/unsubscribe/:campaignType
- Unsubscribe from specific email type
- Response: success message

POST /api/email/verify-address
- Send verification email to confirm address
- Body: emailAddress
- Response: verification sent message

GET /api/email/subscriptions
- Get user's current subscriptions status
- Response: list of subscribed types/campaigns
```

### Notifications API

```
GET /api/notifications
- Get user's notifications
- Query: page, limit, unreadOnly, type
- Response: paginated notifications with counts

POST /api/notifications/:notificationId/read
- Mark notification as read
- Response: updated notification

POST /api/notifications/read-all
- Mark all notifications as read
- Response: success message

DELETE /api/notifications/:notificationId
- Delete a notification
- Response: success message

DELETE /api/notifications/delete-all
- Delete all notifications
- Response: success message

GET /api/notifications/count
- Get unread notification count
- Response: { unreadCount, totalCount, byType: {...} }

GET /api/notifications/types
- Get available notification types
- Response: list of notification types with descriptions
```

### Push Notifications

```
POST /api/push/subscribe
- Register device for push notifications
- Body: subscription (Service Worker subscription)
- Response: registration confirmation

POST /api/push/unsubscribe
- Unregister device from push notifications
- Response: success message

GET /api/push/subscriptions
- Get user's registered push subscriptions
- Response: list of subscriptions

POST /api/push/test
- Send test push notification
- Response: success message
```

### Notification Preferences

```
GET /api/notifications/preferences
- Get comprehensive notification preferences
- Response: all preference settings

PATCH /api/notifications/preferences
- Update notification preferences
- Body: any preference fields
- Response: updated preferences

POST /api/notifications/preferences/reset
- Reset to default preferences
- Response: reset confirmation

POST /api/notifications/quiet-hours/set
- Set custom quiet hours
- Body: startTime, endTime, timezone
- Response: confirmation

POST /api/notifications/dnd-enable
- Enable Do Not Disturb mode
- Body: durationMinutes (optional)
- Response: DND activated

POST /api/notifications/dnd-disable
- Disable Do Not Disturb mode
- Response: DND deactivated

POST /api/notifications/vacation-mode
- Enable vacation mode
- Body: until (Date)
- Response: vacation mode activated
```

### Analytics & Tracking

```
GET /api/notifications/analytics
- Get notification engagement analytics
- Query: dateRange, type
- Response: { deliveryRate, openRate, clickRate, topNotifications }

GET /api/email/tracking/opens
- Get email open data (admin only)
- Query: campaignId, dateRange
- Response: open events with timestamps

GET /api/email/tracking/clicks
- Get email click data (admin only)
- Query: campaignId, dateRange
- Response: click events with URLs

POST /api/email/list-cleanup
- Validate and clean email list (admin only)
- Response: report of removed addresses

GET /api/notifications/engagement/:userId
- Get user's notification engagement stats
- Response: { sentToUser, openedByUser, clickedByUser, preferences }
```

---

## 🎨 Frontend Components Required

### Views/Pages

1. **Email Preferences Page** (`/email-preferences`)
   - Current subscription status
   - Email frequency toggles per type
   - Quiet hours configuration
   - Timezone selector
   - Unsubscribe links
   - Preview of sample emails

2. **Notification Center** (`/notifications`)
   - Notification list with infinite scroll
   - Filter by type
   - Mark as read/unread
   - Delete individual notifications
   - Clear all option
   - Real-time updates via Socket.io

3. **Admin: Email Campaign Manager** (`/admin/email-campaigns`)
   - Campaign creation form
   - Campaign list with status
   - Campaign edit/delete
   - Send trigger with confirmation
   - Campaign analytics dashboard
   - Template selector

4. **Admin: Newsletter Builder** (`/admin/newsletters`)
   - Newsletter editor (visual builder)
   - Template selection
   - Content blocks (article list, featured, etc.)
   - Preview on mobile/desktop
   - Send scheduling
   - Analytics dashboard

5. **Admin: Notification Analytics** (`/admin/notifications/analytics`)
   - Delivery rate chart
   - Open/click rate chart
   - Bounce rate tracking
   - Top notification types
   - Engagement over time
   - Export data option

### JavaScript Managers

```javascript
// NotificationManager
class NotificationManager {
  - setupSocketIO()
  - handleRealtimeNotification(notification)
  - displayNotification(notification)
  - markAsRead(notificationId)
  - markAllAsRead()
  - deleteNotification(notificationId)
  - startPollingFallback()
  - updateBadgeCount()
}

// EmailPreferenceManager
class EmailPreferenceManager {
  - loadPreferences()
  - updateFrequency(type, frequency)
  - toggleNotificationType(type, enabled)
  - setQuietHours(start, end)
  - setTimezone(timezone)
  - handleUnsubscribe(type)
  - showPreviewEmail(type)
}

// EmailCampaignManager (Admin)
class EmailCampaignManager {
  - createCampaign(data)
  - editCampaign(campaignId, data)
  - deleteCampaign(campaignId)
  - sendCampaign(campaignId)
  - loadTemplates()
  - previewCampaign()
  - setupABTest(variantA, variantB)
  - loadCampaignStats(campaignId)
}
```

---

## 🔧 Technical Implementation Details

### Socket.io Architecture

```javascript
// Server-side
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('auth', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    // Cleanup
  });
});

// When sending notification
io.to(`user:${userId}`).emit('notification', notificationData);

// Client-side
const socket = io();
socket.emit('auth', currentUserId);
socket.on('notification', (data) => {
  displayNotification(data);
  updateBadgeCount();
});
```

### Email Template Engine

```javascript
// Template storage and rendering
const renderEmailTemplate = (templateName, variables) => {
  const template = getTemplate(templateName);
  const rendered = ejs.render(template, variables);
  return rendered;
};

// Template variables standard
const emailVars = {
  userName: 'John Doe',
  articleTitle: 'Article Title',
  articleUrl: 'https://...',
  unsubscribeUrl: 'https://.../unsubscribe',
  preferencesUrl: 'https://.../email-preferences'
};
```

### Email Delivery Queue

```javascript
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Queue system with Bull
const emailQueue = new Queue('emails', redisUrl);

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  try {
    const result = await transporter.sendMail({
      to,
      subject,
      html,
      from: 'noreply@rsnews.com'
    });
    return result;
  } catch (error) {
    throw error; // Will trigger retry
  }
});
```

### Notification Delivery Pipeline

```javascript
async function sendNotification(userId, notificationData) {
  // 1. Check user preferences
  const prefs = await UserNotificationPreference.findOne({ userId });

  // 2. Determine channels
  const channels = [];
  if (prefs.emailFrequency !== 'never') channels.push('email');
  if (prefs.pushEnabled) channels.push('push');
  if (!isDuringQuietHours(prefs)) channels.push('in_app');

  // 3. Create notification log
  const log = await NotificationLog.create({
    userId,
    type: notificationData.type,
    ...notificationData,
    channels
  });

  // 4. Send via channels
  for (const channel of channels) {
    await deliverViaChannel(channel, userId, notificationData);
  }

  // 5. Real-time to connected clients
  io.to(`user:${userId}`).emit('notification', {
    ...notificationData,
    logId: log._id
  });
}
```

---

## 📈 Expected Outcomes

### Performance Metrics
- Email delivery rate: 98%+
- Email open rate: 25-35% (industry baseline)
- Notification delivery latency: <100ms via Socket.io
- In-app notification render: <50ms

### User Engagement Impact
- 40% increase in email opens with personalization
- 2x click-through on tracked links
- 30% reduction in unsubscribe rate with preferences

### System Improvements
- Multi-channel notification strategy increases retention
- Delivery tracking enables optimization
- User preferences reduce unsubscribe/spam complaints

---

## 🚀 Development Order

1. Create database models (NotificationTemplate, UserNotificationPreference, etc.)
2. Setup email infrastructure (Nodemailer configuration, templates)
3. Implement notification preference management API
4. Build Socket.io real-time notification system
5. Create email delivery queue and tracking
6. Implement notification center UI
7. Build email preference UI
8. Add email campaign management (admin)
9. Setup scheduled jobs for digests/series
10. Implement A/B testing for emails
11. Build analytics dashboard
12. Testing and optimization

---

## 📝 Notes

- All email templates should be responsive (mobile-friendly)
- Email tracking uses invisible pixel + link rewriting
- Socket.io fallback to polling ensures older browsers work
- Notification retention: 30 days in DB, 90 days in archive
- Quiet hours should respect user's timezone
- Urgent notifications bypass all user preferences
- Email list cleanup should run weekly
- GDPR compliance: easy unsubscribe, data export

---

**Status:** Ready for Development
**Version:** 4.1.0 (Planning)
**Next:** Begin implementation after plan approval

---
