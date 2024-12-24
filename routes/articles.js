const express = require('express');
const router = express.Router();

// Example GET route (Retrieves all articles)
router.get('/', (req, res) => {
  res.send('List of articles');
});

// Example POST route (Creates a new article)
router.post('/', (req, res) => {
  // Middleware could validate `req.body` here
  res.send('Article created');
});

// Example PUT/PATCH route (Updates an existing article)
router.put('/:id', (req, res) => {
  res.send(`Article with ID ${req.params.id} updated`);
});

// Example DELETE route (Deletes an article)
router.delete('/:id', (req, res) => {
  res.send(`Article with ID ${req.params.id} deleted`);
});

module.exports = router;
