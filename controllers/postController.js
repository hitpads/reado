exports.getPosts = (req, res) => {
    res.json({ message: 'Retrieve all posts' });
  };
  
  exports.getPostById = (req, res) => {
    res.json({ message: `Retrieve post with ID ${req.params.id}` });
  };
  
  exports.createPost = (req, res) => {
    res.json({ message: 'New post created', data: req.body });
  };
  
  exports.updatePost = (req, res) => {
    res.json({ message: `Post ${req.params.id} updated`, data: req.body });
  };
  
  exports.deletePost = (req, res) => {
    res.json({ message: `Post ${req.params.id} deleted` });
  };