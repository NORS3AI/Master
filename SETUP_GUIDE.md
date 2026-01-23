# RS News - Complete Setup Guide

This guide covers everything needed to set up and run the RS News application locally or in production.

---

## 📋 Prerequisites

- **Node.js** 18.0+ (tested with Node 22.22.0)
- **npm** 9.0+
- **MongoDB** 6.0+ (or MongoDB Atlas cloud account)
- **Git** (for version control)

---

## 🚀 Quick Start (Recommended: Using Docker)

### Option 1: Docker & Docker Compose (Easiest)

**Requirements:**
- Docker Desktop (https://www.docker.com/products/docker-desktop)

**Steps:**

```bash
# 1. Navigate to project directory
cd /path/to/Master

# 2. Build and start services
docker-compose up -d

# 3. Check if services are running
docker-compose ps

# 4. Access the application
# - RS News App: http://localhost:5000
# - MongoDB Admin UI: http://localhost:8081
```

**Access MongoDB Admin:**
- URL: http://localhost:8081
- Username: admin
- Password: admin

**Stop services:**
```bash
docker-compose down
```

---

## 🔧 Manual Setup (Without Docker)

### Option 2A: Local MongoDB Installation

#### Step 1: Install MongoDB

**Linux (Ubuntu/Debian):**
```bash
# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Run installer and follow installation wizard
- MongoDB will start automatically

#### Step 2: Verify MongoDB Connection

```bash
# Test connection
mongosh

# In mongosh shell, you should see:
# test>

# Exit mongosh
exit
```

---

### Option 2B: MongoDB Atlas (Cloud Database - Free Tier Available)

**Benefits:** No local installation, automatic backups, easy scaling

**Steps:**

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier account

2. **Create Cluster**
   - Create a free M0 cluster (512MB storage)
   - Select region closest to you
   - Wait for cluster to deploy (5-10 minutes)

3. **Get Connection String**
   - Click "Connect" button
   - Select "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/rs-news?retryWrites=true&w=majority`

4. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rs-news?retryWrites=true&w=majority
   ```

---

## 📦 Application Setup

### Step 1: Install Dependencies

```bash
cd /path/to/Master

# Install Node.js dependencies
npm install
```

### Step 2: Configure Environment Variables

**Copy example file:**
```bash
cp .env.example .env
```

**Edit `.env` file:**
```bash
# RS News Configuration

# Server
PORT=5000
NODE_ENV=development

# MongoDB Connection (choose one)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/rs-news

# Option 2: MongoDB Atlas Cloud
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rs-news?retryWrites=true&w=majority

# Session & Security
SESSION_SECRET=your-super-secret-key-change-this-in-production
MAX_FILE_SIZE=5242880

# Email Configuration (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@rsnews.com

# Application URLs
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5000
```

### Step 3: Seed Database (Optional - Load Sample Data)

```bash
# Load sample articles
npm run seed
```

This creates:
- Sample articles with categories and authors
- Test user account (if applicable)
- Initial store data

---

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server will start on `http://localhost:5000` and reload on file changes.

### Production Mode

```bash
npm start
```

Server will start on `http://localhost:5000` (no auto-reload).

---

## ✅ Verify Installation

### Check Server Status

```bash
# Server should respond with:
# RS News server running on port 5000
```

### Test Application

1. **Open browser:**
   - Go to http://localhost:5000

2. **Should see:**
   - RS News homepage
   - Navigation menu
   - Featured articles section

3. **Register Account:**
   - Click "Register" in navigation
   - Create account with email
   - Verify email (if email service configured)
   - Log in to account

4. **Test Features:**
   - Browse articles in news section
   - Search and filter articles
   - Click article to open modal viewer
   - Add comments
   - Follow users
   - View user profiles

---

## 🗄️ MongoDB Connection Issues

### Connection Refused Error

**Error:**
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. **Check MongoDB is running:**
   ```bash
   # Linux
   sudo systemctl status mongod

   # macOS
   brew services list
   ```

2. **Start MongoDB:**
   ```bash
   # Linux
   sudo systemctl start mongod

   # macOS
   brew services start mongodb-community
   ```

3. **Use MongoDB Atlas instead** (cloud database)

### Authentication Failed

**Error:**
```
MongoAuthenticationError
```

**Solution:**
- Verify username and password in `.env` file
- Check MongoDB user has proper permissions
- For Atlas, ensure IP is whitelisted (0.0.0.0/0 for development)

---

## 📧 Email Configuration

For password reset and account notifications:

### Gmail Setup

1. **Enable 2-Factor Authentication** on Gmail account
2. **Generate App Password:**
   - Go to myaccount.google.com/apppasswords
   - Select Mail and Windows Computer
   - Copy generated password

3. **Update .env:**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=generated-app-password
   EMAIL_FROM=noreply@rsnews.com
   ```

### Other Email Services

Update `EMAIL_SERVICE` in `.env` with:
- `gmail`, `outlook`, `yahoo`, `mailgun`, `sendgrid`, etc.

See: https://nodemailer.com/smtp/well-known/

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` to strong random value
- [ ] Update `NODE_ENV` to `production`
- [ ] Enable HTTPS (use reverse proxy like nginx)
- [ ] Configure email service credentials
- [ ] Update MongoDB user password
- [ ] Enable MongoDB authentication
- [ ] Configure CORS for your domain
- [ ] Set up rate limiting
- [ ] Enable helmet security headers (already configured)
- [ ] Use environment variables for secrets (not in code)
- [ ] Set up automated backups for MongoDB
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest

---

## 📚 Project Structure

```
Master/
├── models/              # Mongoose data models
│   ├── User.js         # User schema with follow system
│   ├── Article.js      # Article schema
│   ├── Comment.js      # Comment schema
│   └── Store.js        # Store schema
├── routes/             # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── articles.js     # Article routes
│   ├── users.js        # User profile routes
│   ├── follows.js      # Follow system routes
│   ├── comments.js     # Comment routes
│   ├── stores.js       # Store routes
│   └── pages.js        # View routes
├── views/              # EJS templates
│   ├── layout.ejs      # Master layout
│   ├── pages/          # Page templates
│   └── components/     # Reusable components
├── public/             # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side scripts
│   └── images/         # Static images
├── server.js           # Express app entry point
├── package.json        # Dependencies
├── .env                # Environment configuration
├── docker-compose.yml  # Docker services
└── Dockerfile          # Docker image definition
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Timeout

- Check MongoDB server is running
- Verify MONGODB_URI in .env
- Check firewall/network access to MongoDB
- Try MongoDB Atlas if local fails

### Session Issues

- Clear browser cookies
- Check SESSION_SECRET is set
- Verify MongoDB session store connection

---

## 📖 Additional Resources

- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **Mongoose:** https://mongoosejs.com/
- **EJS Templates:** https://ejs.co/

---

## 🚀 Deployment

See `DEPLOYMENT_GUIDE.md` for:
- Heroku deployment
- AWS deployment
- DigitalOcean deployment
- Docker production setup
- Load balancing
- Monitoring and logging

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Check MongoDB logs
4. Contact development team

---

**Version:** 1.0.0
**Last Updated:** January 23, 2026
