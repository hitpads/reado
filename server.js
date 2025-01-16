const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// PostgreSQL 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

// Serve home page 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Serve articles page 
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'articles.html'));
});

// GET posts with pagination
app.get('/posts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(`Received request for posts - Page: ${page}, Limit: ${limit}`); // Server-side log

    try {
        const postsResult = await pool.query(
            'SELECT * FROM posts ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM posts');
        const total = parseInt(countResult.rows[0].count);

        console.log(`Fetched ${postsResult.rows.length} posts from database`); // Server-side log

        res.json({
            page,
            limit,
            total,
            posts: postsResult.rows
        });
    } catch (err) {
        console.error('Error fetching posts:', err.message); // Server-side error log
        res.status(500).json({ error: err.message });
    }
});

// POST create a new post
app.post('/posts', async (req, res) => {
    const { title, content, author } = req.body;
    console.log(`Creating a new post - Title: ${title}, Author: ${author}`); // Server-side log
    try {
        const result = await pool.query(
            'INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *',
            [title, content, author]
        );
        console.log('Post created successfully:', result.rows[0]); // Server-side log
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating post:', err.message); // Server-side error log
        res.status(500).json({ error: err.message });
    }
});

// ...rest of the server.js code

// GET post by ID
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [parseInt(id)]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching post:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE post by ID
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [parseInt(id)]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting post:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT update post by ID
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    try {
        const result = await pool.query(
            'UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *',
            [title, content, author, parseInt(id)]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating post:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});