const express = require('express');
const router = express.Router();
const {
  createPostHandler,
  getPostsHandler,
  getPostHandler,
  updatePostHandler,
  deletePostHandler
} = require('../controllers/postController');

// Routes
router.post('/', createPostHandler);       // Create
router.get('/', getPostsHandler);          // Read All
router.get('/:id', getPostHandler);        // Read One
router.put('/:id', updatePostHandler);     // Update
router.delete('/:id', deletePostHandler);  // Delete

module.exports = router;
