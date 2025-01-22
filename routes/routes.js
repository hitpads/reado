const express = require('express');
const path = require('path');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const articleController = require('../controllers/articleController');
const profileController = require('../controllers/profileController');

// === Backend API Routes ===

// Auth Routes
router.get('/auth/login', authController.login); // Redirect to Auth0 login
router.get('/auth/logout', authController.logout); // Logout user
router.get('/auth/user', authController.getUserInfo); // Get Auth0 user info



// Article Routes
router.get('/articles', articleController.getAllArticles); // Fetch all articles
router.get('/articles/mine', articleController.getUserArticles); // Fetch user's articles
router.delete('/articles/:id', articleController.deleteArticle); // Delete an article
router.get('/new-article', articleController.createArticle); // Create a new article (redirect to newArticle.html)
router.post('/new-article', articleController.createArticle); // Create a new article (redirect to newArticle.html)

// Profile Routes
router.get('/profile', profileController.viewProfile); // View profile information
router.post('/profile/update', profileController.updateProfile); // Update user profile

// === Frontend Routes (Static Pages) ===

// Serve `home.html`
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/home.html'));
});

// Serve `newArticle.html`
router.get('/new-article', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/newArticle.html'));
});

// Serve profile-related frontend route
router.get('/profile-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/profile.html'));
});

module.exports = router; // Export router for use in app.js