const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} = require('../models/postModel');

// CREATE
const createPostHandler = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).send('Unauthorized');
  if (!title || !content) return res.status(400).send('Title and content are required');

  try {
    const post = await createPost(userId, title, content);
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// READ ALL
const getPostsHandler = async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving posts');
  }
};

// READ ONE
const getPostHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await getPostById(id);
    if (!post) return res.status(404).send('Post not found');
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// UPDATE
const updatePostHandler = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).send('Unauthorized');

  try {
    const updated = await updatePost(id, userId, title, content);
    if (!updated) return res.status(403).send('Not allowed to update this post');
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE
const deletePostHandler = async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;

  if (!userId) return res.status(401).send('Unauthorized');

  try {
    const deleted = await deletePost(id, userId);
    if (!deleted) return res.status(403).send('Not allowed to delete this post');
    res.send('Post deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createPostHandler,
  getPostsHandler,
  getPostHandler,
  updatePostHandler,
  deletePostHandler
};

