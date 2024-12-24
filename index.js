const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse incoming JSON data (if you plan to receive JSON)
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Later, after creating route files:
const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const categoriesRouter = require('./routes/categories');

// Tell Express to use these routes
app.use('/articles', articlesRouter);
app.use('/comments', commentsRouter);
app.use('/categories', categoriesRouter);
