require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const feesRoutes = require('./routes/fees');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  res.locals.teacher = req.session.teacher || null;
  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.session.teacher) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/fees', feesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    teacher: req.session.teacher || null
  });
});

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 School ERP Server running on http://localhost:${PORT}`);
  console.log(`📚 Login with email: john@school.com, password: password123`);
});