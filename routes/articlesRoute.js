const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // Import the Sequelize model

// POST /articles - Create a new article
router.post('/articles', async (req, res) => {
    try {
        const { title, content, tags, categories } = req.body;

        // Basic input validation
        if (!title || !content) {
            return res.status(400).send('Title and content are required.');
        }

        // Create the article in the database
        const newArticle = await Article.create({
            title,
            content,
            tags, // Assuming this maps to an array type in your database
            category: categories, // This should align with your database column name/schema
        });

        res.status(201).json(newArticle); // Respond with the created article
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).send('An error occurred while creating the article.');
    }
});

module.exports = router;