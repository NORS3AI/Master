# Phase 3.3: User Management & Permissions - Implementation Plan

**Status:** Ready for Development
**Timeline:** 3-4 days
**Priority:** HIGH
**Complexity:** MEDIUM

---

## Feature Overview

User Management System provides admins with complete control over user accounts, roles, permissions, and access levels. Implement role-based access control (RBAC) to manage who can do what on the platform, from content creation to moderation to administrative tasks.

---

## Database Models

### UserRole Model
```javascript
{
  userId: ObjectId (Reference to User),
  role: String (enum: "admin", "editor", "moderator", "contributor", "member"),
  permissions: [String],
  department: String,
  assignedBy: ObjectId (Admin),
  assignedAt: Date,
  expiresAt: Date (Optional for temporary roles),
  isActive: Boolean,
  notes: String,
  createdAt: Date
}
```

### Permission Model
```javascript
{
  name: String (unique, e.g., "articles:create", "users:delete"),
  description: String,
  category: String ("articles", "users", "moderation", "admin", "analytics"),
  resource: String (articles, users, comments, reports, etc.),
  action: String (create, read, update, delete, moderate, publish),
  level: Number (0-100, determines hierarchy),
  createdAt: Date
}
```

### RoleTemplate Model
```javascript
{
  name: String (enum: "admin", "editor", "moderator", "contributor", "member"),
  description: String,
  defaultPermissions: [ObjectId] (Reference to Permissions),
  canDelegate: Boolean,
  level: Number,
  createdAt: Date
}
```

---

## 5 User Roles with Permissions

### Admin (Level: 100)
- ✅ All permissions
- ✅ User management (create, edit, delete, ban)
- ✅ Role assignment and management
- ✅ Admin dashboard access
- ✅ Content publishing, editing, deletion
- ✅ Moderation and comment management
- ✅ Analytics and reporting
- ✅ System settings configuration
- ✅ Backup and data management
- ✅ Can delegate roles to editors

### Editor (Level: 75)
- ✅ Create articles
- ✅ Edit own articles
- ✅ Edit others' articles
- ✅ Publish articles
- ✅ Schedule articles
- ✅ Manage categories and tags
- ✅ Moderate comments
- ✅ View analytics for own content
- ✅ Create content templates
- ✅ Cannot delete users
- ✅ Cannot access system settings

### Moderator (Level: 50)
- ✅ View all comments
- ✅ Approve/reject comments
- ✅ Flag inappropriate content
- ✅ Remove comments
- ✅ View user profiles
- ✅ Ban users (report to admin)
- ✅ View community activity
- ✅ Cannot create articles
- ✅ Cannot delete users
- ✅ Cannot access admin settings

### Contributor (Level: 25)
- ✅ Create articles
- ✅ Edit own articles
- ✅ Comment on articles
- ✅ Favorite articles
- ✅ Follow users
- ✅ Earn badges
- ✅ Nominate spotlights
- ✅ Cannot publish articles (requires editor)
- ✅ Cannot moderate content
- ✅ Cannot access admin panels

### Member (Level: 0)
- ✅ Read articles
- ✅ Comment on articles
- ✅ Favorite articles
- ✅ Follow users
- ✅ Earn badges
- ✅ Cannot create articles
- ✅ Cannot moderate
- ✅ Cannot access admin features

---

## 16 User Management Features

| Feature | Icon | Type | Purpose |
|---|---|---|---|
| User Directory | 👥 | Page | Browse all users with filters |
| User Search | 🔍 | Function | Search users by name, email, role |
| User Details Page | 📋 | Page | View user info, activity, articles |
| Role Assignment | 👔 | Dropdown | Assign role to user |
| Bulk Role Assignment | 🔄 | Action | Assign role to multiple users |
| Permission Management | 🔑 | Interface | Grant/revoke specific permissions |
| User Ban | 🚫 | Action | Ban user from platform |
| User Unban | ✅ | Action | Restore banned user |
| Ban Reason Tracking | 📝 | Field | Track why user was banned |
| Ban Expiration | ⏰ | Selector | Set temporary or permanent ban |
| Activity History | 📊 | Timeline | View user's action history |
| Login History | 🔐 | Log | Track user login times and IPs |
| User Deactivate | 🔌 | Action | Deactivate without deleting |
| User Reactivate | ⚡ | Action | Reactivate deactivated user |
| User Delete | 🗑️ | Action | Permanently delete user account |
| Bulk User Export | 📤 | Action | Export user list to CSV |

---

## 40+ Granular Permissions

### Article Permissions
- `articles:create` - Create new articles
- `articles:read` - View articles
- `articles:update` - Edit articles
- `articles:update:others` - Edit other users' articles
- `articles:delete` - Delete articles
- `articles:publish` - Publish articles
- `articles:schedule` - Schedule articles for publish
- `articles:feature` - Mark articles as featured

### User Permissions
- `users:create` - Create new users
- `users:read` - View user profiles
- `users:update` - Edit user info
- `users:delete` - Delete users
- `users:ban` - Ban/unban users
- `users:role:assign` - Assign roles
- `users:role:revoke` - Revoke roles
- `users:deactivate` - Deactivate users

### Comment Permissions
- `comments:read` - View comments
- `comments:create` - Create comments
- `comments:update` - Edit comments
- `comments:delete` - Delete comments
- `comments:moderate` - Approve/reject comments
- `comments:flag` - Flag inappropriate comments

### Moderation Permissions
- `moderation:view` - View moderation queue
- `moderation:approve` - Approve content
- `moderation:reject` - Reject content
- `moderation:ban` - Ban users

### Admin Permissions
- `admin:dashboard` - Access admin dashboard
- `admin:settings` - Change system settings
- `admin:backup` - Create backups
- `admin:logs` - View system logs
- `admin:analytics` - View analytics

### Analytics Permissions
- `analytics:view` - View analytics
- `analytics:export` - Export analytics data
- `analytics:dashboard` - Access analytics dashboard

---

## API Endpoints

### GET /api/admin/users
- Get paginated user list
- Filter by role, status, join date
- Search by name/email
- Return user with roles

### GET /api/admin/users/:userId
- Get user details
- Show roles and permissions
- Activity history
- Login history

### POST /api/admin/users/:userId/role
- Assign role to user
- Can assign multiple roles (future)
- Track who assigned and when

### DELETE /api/admin/users/:userId/role/:roleId
- Revoke role from user
- Log role revocation

### POST /api/admin/users/:userId/permissions
- Grant specific permission to user
- Outside of role (custom permission)

### DELETE /api/admin/users/:userId/permissions/:permissionId
- Revoke specific permission

### POST /api/admin/users/:userId/ban
- Ban user from platform
- Set expiration (optional)
- Provide reason

### POST /api/admin/users/:userId/unban
- Remove ban from user
- Log action

### POST /api/admin/users/:userId/deactivate
- Deactivate user account
- Prevent login

### POST /api/admin/users/:userId/reactivate
- Reactivate user account

### DELETE /api/admin/users/:userId
- Permanently delete user
- Cascade delete: articles, comments, activities
- Archive data first (optional)

### GET /api/admin/users/:userId/activity
- User's action history
- Paginated timeline
- Filter by action type

### GET /api/admin/users/:userId/logins
- Login history with timestamps and IPs
- Failed login attempts
- Session duration

### POST /api/admin/users/bulk-role
- Assign role to multiple users
- Select users and role
- Confirm action

### GET /api/admin/roles
- Get all available roles
- Show permissions for each
- Permission count per role

### POST /api/admin/roles/:roleId/permissions
- Add permission to role
- Update role permissions

### GET /api/admin/permissions
- Get all permissions
- Grouped by category
- Show permission details

---

## Implementation Steps

### Step 1: Create Permission System Models
- Permission schema with CRUD operations
- UserRole schema for role assignment
- RoleTemplate schema for predefined roles

### Step 2: Create User Roles
- Define 5 default roles with permissions
- Create permission records in database
- Assign permissions to roles

### Step 3: Create Authorization Middleware
- Permission checking middleware
- Role validation on all protected routes
- Granular permission checks

### Step 4: Create User Management Routes
- User listing endpoint with filters
- User details endpoint
- Role assignment endpoints
- Ban/unban endpoints

### Step 5: Create User Management Page
- admin/users.ejs dashboard
- User directory with filters
- Search and pagination
- Bulk action toolbar

### Step 6: Create User Details Page
- admin/user-detail.ejs
- User information display
- Role and permission display
- Activity and login history

### Step 7: Create Role Management Page
- admin/roles.ejs
- List all roles
- Edit role permissions
- Create custom roles

### Step 8: Create Permission Management
- admin/permissions.ejs
- View all permissions
- Assign to roles
- Create custom permissions

### Step 9: Add Action Logging
- Log all user modifications
- Log role assignments
- Log permission changes
- Create audit trail

### Step 10: Create Ban Management
- Ban/unban functionality
- Temporary vs permanent bans
- Ban reason tracking
- Ban history display

### Step 11: Add Activity Tracking
- User action history
- Login history with IPs
- Content creation history
- Moderation action history

### Step 12: Create Bulk Operations
- Bulk role assignment
- Bulk user export
- Bulk status change
- Bulk delete confirmation

---

## Files to Create/Modify

**New:**
- `/models/UserRole.js`
- `/models/Permission.js`
- `/models/RoleTemplate.js`
- `/routes/user-management.js`
- `/middleware/authorization.js` (Permission checking)
- `/views/pages/admin/users.ejs`
- `/views/pages/admin/user-detail.ejs`
- `/views/pages/admin/roles.ejs`
- `/views/pages/admin/permissions.ejs`
- `/public/js/user-manager.js`
- `/public/css/user-management.css`

**Modified:**
- `/models/User.js` - Add roleId, isBanned, banReason, banExpires fields
- `/middleware/auth.js` - Add permission checking
- `/server.js` - Register user management routes
- All protected route files - Add authorization checks

---

## Permission Check Middleware Example

```javascript
// Middleware to check permission
function requirePermission(permission) {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id)
      .populate('roleId');

    const role = user.roleId;
    const hasPermission = role.permissions.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
router.post('/articles', requirePermission('articles:create'), createArticle);
```

---

## Success Criteria

- [ ] All 5 roles created with correct permissions
- [ ] 40+ permissions defined in database
- [ ] Role assignment working correctly
- [ ] Permission checks working on all protected routes
- [ ] User ban/unban functional
- [ ] Activity logging tracking all actions
- [ ] Login history recording correctly
- [ ] Bulk role assignment working
- [ ] Role and permission pages displaying correctly
- [ ] User directory searchable and filterable
- [ ] Ban expiration working (auto-unban)
- [ ] Granular permissions enforced correctly

---

**Estimated Effort:** 12-16 hours
**Priority:** HIGH (Security and access control)
**Complexity:** MEDIUM
