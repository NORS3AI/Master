# RS News - Quick Start (5 Minutes)

## 🚀 Fastest Way to Run the App

### Option 1: Using Docker (Recommended - 1 minute)

**Requirements:** Docker Desktop installed

```bash
# 1. Start everything
docker-compose up -d

# 2. Done! Access the app
# - App: http://localhost:5000
# - MongoDB Admin: http://localhost:8081
```

### Option 2: Local Setup (MongoDB Atlas)

**Requirements:** Node.js 18+

```bash
# 1. Create .env file
cp .env.example .env

# 2. Update MONGODB_URI in .env with MongoDB Atlas connection string
# (Get free database at https://www.mongodb.com/cloud/atlas)

# 3. Install and run
npm install
npm start

# 4. Visit http://localhost:5000
```

### Option 3: Full Local Setup (Advanced)

See `SETUP_GUIDE.md` for detailed instructions including:
- Local MongoDB installation
- Email configuration
- Security setup
- Troubleshooting

---

## 📝 Environment Setup (Required)

### Create .env file:

```bash
cp .env.example .env
```

### Edit .env and set:

```
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

---

## ✅ Verify It's Working

1. **Server running?**
   - Visit http://localhost:5000
   - Should see RS News homepage

2. **MongoDB connected?**
   - Try registering a new account
   - Create and view articles

3. **All features working?**
   - Search/filter articles
   - Add comments
   - Follow users
   - Open article modal

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process: `lsof -i :5000` |
| Cannot connect to MongoDB | Use MongoDB Atlas (cloud) or check local MongoDB running |
| Module not found | Run `npm install` |
| Environment variables not loading | Check .env file exists and is in project root |

---

## 📚 Full Setup Guide

For detailed setup, deployment, and troubleshooting:
- See `SETUP_GUIDE.md`
- See `DEPLOYMENT_GUIDE.md` (when available)

---

## 🎯 Next Steps

1. **Create account** at http://localhost:5000/auth/register
2. **Explore features:**
   - Browse news section
   - Search and filter articles
   - Add comments
   - Follow other users
   - View user profiles
3. **Read documentation** in `IMPLEMENTED_FEATURES.md`

---

**Version:** 1.0.0 | **Last Updated:** January 23, 2026
