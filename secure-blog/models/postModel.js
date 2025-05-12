const pool = require('../config/db');

// CREATE
const createPost = async (userId, title, content) => {
  const result = await pool.query(
    'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
    [userId, title, content]
  );
  return result.rows[0];
};

// READ (all posts)
const getAllPosts = async () => {
  const result = await pool.query(`
    SELECT posts.id, title, content, posts.created_at AS timestamp, users.email AS username
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `);
  return result.rows;
};

// READ (one post by ID)
const getPostById = async (postId) => {
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  return result.rows[0];
};

// UPDATE
const updatePost = async (postId, userId, title, content) => {
  const result = await pool.query(
    'UPDATE posts SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
    [title, content, postId, userId]
  );
  return result.rows[0];
};

// DELETE
const deletePost = async (postId, userId) => {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
    [postId, userId]
  );
  return result.rows[0];
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
