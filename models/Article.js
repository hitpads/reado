const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const User = require('../models/User'); // User model for the relationship

// Article Model Definition
const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    userId: { // Foreign key for author
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id', // `id` matches the primary key of the `User` model
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'articles', // Keep table names consistent
    timestamps: true, // Sequelize will use createdAt/updatedAt automatically
});

// Define Associations
Article.belongsTo(User, { as: 'author', foreignKey: 'userId' }); // Foreign key to User
User.hasMany(Article, { foreignKey: 'userId' }); // A User can have many Articles

// models/Article.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Article',
        {
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'articles',
            timestamps: true,
        }
    );
};
