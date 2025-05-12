const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf();

const {
  register,
  login,
  enable2FA,
  verify2FA,
} = require('../controllers/authController');

// Middleware: Apply CSRF to all routes in this router
router.use(csrfProtection);

// CSRF token endpoint (used by frontend to retrieve token)
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Setup 2FA (must be logged in)
router.get('/2fa/setup', enable2FA);

// Verify 2FA code
router.post('/2fa/verify', verify2FA);

module.exports = router;
