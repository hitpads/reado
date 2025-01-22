const Sequelize = require('sequelize');
const sequelize = require('../db/database'); // Sequelize instance

// Import models
const Article = require('../models/Article')(sequelize, Sequelize.DataTypes);
const Category = require('../models/Category')(sequelize, Sequelize.DataTypes);

// Define many-to-many association
Article.belongsToMany(Category, { through: 'ArticleCategories' });
Category.belongsToMany(Article, { through: 'ArticleCategories' });

// Export models and Sequelize instance
module.exports = {
    sequelize,
    Article,
    Category,
};
