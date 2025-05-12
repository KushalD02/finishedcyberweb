// models/userModel.js
const pool = require('../config/db');

const createUser = async (email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // Will be undefined if not found
};

const setTwoFASecret = async (userId, secret) => {
  await pool.query('UPDATE users SET twofa_secret = $1 WHERE id = $2', [secret, userId]);
};

const getUserWithSecret = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  setTwoFASecret,
  getUserWithSecret,
};
