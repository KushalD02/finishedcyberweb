const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const csurf = require('csurf');
const dotenv = require('dotenv');
const pool = require('./config/db');
const path = require('path');
const xss = require('xss');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Security headers
app.use(helmet());

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Manual XSS sanitization for req.body
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

// Middleware: Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true when using HTTPS
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);

// Middleware: CSRF protection
app.use(csurf());
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Serve static frontend (HTML/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Import and use authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Import and use post routes
const postRoutes = require('./routes/postRoutes');
app.use('/posts', postRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Secure Blog API is running.');
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
