const express = require('express');
const app = express();
const postRoutes = require('./routes/postRoutes');

app.use(express.json());
app.use('/posts', postRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});