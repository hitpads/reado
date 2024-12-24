const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');

// Simple POST data validation middleware
function validatePostData(req, res, next) {
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  next();
}

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', validatePostData, createPost);
router.put('/:id', validatePostData, updatePost);
router.delete('/:id', deletePost);

module.exports = router;