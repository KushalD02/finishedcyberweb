// controllers/authController.js
const pool = require('../config/db');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { setTwoFASecret, getUserWithSecret } = require('../models/userModel');

const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser(email, hashedPassword);
    res.status(201).send(`User registered: ${user.email}`);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).send('Email already exists');
    }
    console.error(err);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await findUserByEmail(email);

    // Don't reveal whether the email exists (account enumeration prevention)
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    // Regenerate session to avoid session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Session error');
      }

      req.session.userId = user.id;
      res.send('Login successful');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const enable2FA = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send('Login required');

  try {
    // Fetch existing 2FA status
    const result = await pool.query('SELECT twofa_secret FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (user.twofa_secret) {
      return res.status(400).send('2FA is already enabled for this account.');
    }

    // Generate new secret and save
    const secret = speakeasy.generateSecret({ name: 'SecureBlog2FA' });
    await setTwoFASecret(userId, secret.base32);

    const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      qr: qrDataURL,
      manualCode: secret.base32,
      message: 'Scan this code with your authenticator app.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error setting up 2FA');
  }
};

const verify2FA = async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await getUserWithSecret(email);

    if (!user || !user.twofa_secret) {
      return res.status(400).send('2FA not enabled or user not found');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).send('Invalid 2FA code');
    }

    req.session.userId = user.id;
    res.send('2FA verified. Login complete.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error verifying 2FA');
  }
};


module.exports = {
  register,
  login,
  enable2FA,
  verify2FA,
};
