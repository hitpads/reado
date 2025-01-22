const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const User = require('../models/User');
const Article = require('models/Article');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, { timestamps: true });

// Associate Comment with User and Article
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Comment.belongsTo(Article, { foreignKey: 'articleId' });
User.hasMany(Comment, { foreignKey: 'authorId' });
Article.hasMany(Comment, { foreignKey: 'articleId' });

module.exports = Comment;
