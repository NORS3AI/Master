# RS News

RS News is a modern, sleek website for sharing mail and parcel service news with family-owned and operated mail and parcel stores. Features secure authentication, user account management, and an innovative glassmorphic modal system for reading articles.

## Features

### Authentication & Account Management
- Secure user registration and login
- Session-based authentication
- Password reset via email
- Username reset via email (with password verification)
- Comprehensive user profile management:
  - Profile images with upload
  - Personal information (name, birth date, location)
  - Store information
  - Bio/description
  - Password changes

### News & Articles
- **Glassmorphism Modal Interface**: Modern Apple iOS 26-inspired design
  - Blur effect background with frosted glass styling
  - Smooth animations and transitions
  - Article navigation (left/right arrows or keyboard arrows)
  - Favorite/bookmark articles
  - Close with X button, side clicks, or Escape key
  - Real-time favorite status tracking

### Security
- Password hashing with bcryptjs
- Session security with httpOnly cookies
- CSRF protection via Helmet
- Email token verification for password/username resets
- Input validation and sanitization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB URI
- JWT secret
- Email service credentials (Gmail recommended)
- Session secret

3. **Seed sample articles:**
```bash
npm run seed
```

This creates 7 sample articles with various categories (UPS, FedEx, USPS, DHL, General, Updates, Tips).

### Running the Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The application will run on `http://localhost:5000` by default.

## Modal System

### How It Works

The article modal system uses a sleek glassmorphism design inspired by Apple's iOS 26 aesthetic:

- **Background**: Blurred overlay with transparency
- **Design**: Frosted glass effect with backdrop blur
- **Navigation**:
  - Click left/right areas to navigate articles
  - Use arrow keys (← →)
  - Click X to close
  - Press Escape to close
  - Click overlay edges to close
- **Features**:
  - Smooth slide-up animation on open
  - Article metadata (date, category, read time, author)
  - Favorite button for authenticated users
  - Responsive design for mobile devices

### Technical Details

**Files:**
- `/public/js/modal.js` - Modal logic and interactions
- `/public/css/style.css` - Glassmorphism styles (lines 704-900+)
- `/routes/articles.js` - API endpoints for articles
- `/models/Article.js` - Article database schema

**API Endpoints:**
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `POST /api/articles/:id/favorite` - Toggle favorite (auth required)
- `GET /api/articles/:id/is-favorited` - Check favorite status (auth required)
- `GET /api/articles/user/favorites` - Get user's favorites (auth required)

## File Structure

```
rs-news/
├── models/
│   ├── User.js          # User schema with auth tokens
│   └── Article.js       # Article schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User profile management
│   ├── articles.js      # Article API routes
│   └── pages.js         # Page rendering routes
├── middleware/
│   └── auth.js          # Auth and session middleware
├── utils/
│   └── email.js         # Email service
├── public/
│   ├── css/
│   │   └── style.css    # All styling including modal
│   └── js/
│       ├── main.js      # Global utilities
│       ├── account.js   # Account page functionality
│       └── modal.js     # Modal system
├── views/
│   ├── pages/           # Public pages
│   ├── auth/            # Auth pages
│   └── components/      # Reusable components
└── scripts/
    └── seedArticles.js  # Database seeding script
```

## Authentication Flow

1. **Registration**: New users create account with username, email, and password
2. **Login**: Users authenticate with username/password
3. **Password Reset**:
   - User requests reset via email
   - Email sent with secure token link
   - Token expires after 30 minutes
   - New password set via token verification
4. **Username Reset**:
   - User requests reset with email and password verification
   - Email sent with secure token link
   - New username chosen via token verification

## Customization

### Adding Articles
Add new articles via:
1. MongoDB directly
2. Admin panel (future feature)
3. Modify and re-run seed script

### Modifying Modal Design
Edit `/public/css/style.css` section starting at "Glassmorphism Modal" to customize:
- Blur effect intensity
- Colors and transparency
- Border radius and spacing
- Animation timing

### Email Configuration
For Gmail:
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in `.env`

For other providers, update `utils/email.js` transport configuration.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Set `SESSION_SECRET` and `JWT_SECRET` to strong random values
3. Configure MongoDB URI for production database
4. Enable HTTPS (helmet already configured)
5. Set appropriate CORS origins
6. Configure email service with production credentials

## Troubleshooting

**Articles not loading:**
- Verify MongoDB connection
- Check if seed script was run: `npm run seed`
- Check browser console for errors

**Modal not opening:**
- Verify `/api/articles` endpoint returns data
- Check that article IDs match in HTML

**Favorites not working:**
- Ensure user is logged in
- Check browser console for errors
- Verify session is set correctly

**Email not sending:**
- Check `.env` email credentials
- Verify email service is configured correctly
- Check spam folder
- Use Gmail App Password (not regular password)

## Future Features

- Admin panel for article management
- Search and filtering
- User comments on articles
- Sharing functionality
- Email subscriptions
- Analytics dashboard
- Advanced favoriting with collections/folders
