const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/rs-news'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Analytics middleware
const { analyticsMiddleware } = require('./middleware/analyticsMiddleware');
app.use(analyticsMiddleware());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rs-news')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/spotlight', require('./routes/spotlight'));
app.use('/api/employee-spotlight', require('./routes/employee-spotlight'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/', require('./routes/pages'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'An error occurred' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RS News server running on port ${PORT}`);
});
