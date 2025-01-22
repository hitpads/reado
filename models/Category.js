const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
}, { timestamps: true });

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Category', {
        name: {type: DataTypes.STRING, allowNull: false},
    });
};
