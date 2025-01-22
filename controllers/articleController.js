const Article = require('../models/Article'); // Assuming you use Sequelize or similar ORM

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.findAll(); // Fetch articles from the database
        res.status(200).json(articles); // Send back a list of articles
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
};

exports.getUserArticles = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming Auth0 provides user info
        const articles = await Article.findAll({ where: { userId } });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user articles', error });
    }
};


exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id); // Fetch by primary key
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the article', error });
    }
};

const { createNewArticle } = require('../services/articleService');

exports.createArticle = async (req, res) => {
    try {
        console.log('createArticle started with data:', req.body);

        const { title, content, authorId, description, tags } = req.body;

        // Call the helper function to create the article
        const newArticle = await createNewArticle({ title, content, authorId, description, tags });
        console.log('Article created successfully:', newArticle);

        // Redirect to home or profile page after successful post
        res.redirect('/profile-page');
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).send('An error occurred.');
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const { title, content } = req.body;
        article.title = title || article.title;
        article.content = content || article.content;
        await article.save();
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error updating article', error });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        await article.destroy();
        res.status(204).send(); // No content response for successful deletion
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error });
    }
};

exports.getNewArticlePage = (req, res) => {
    res.render('newArticle'); // Render the 'newArticle' HTML page or template
};

