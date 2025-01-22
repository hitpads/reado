const { Sequelize } = require('sequelize');
const {json} = require("express");
// Configure Sequelize for PostgreSQL
const sequelize = new Sequelize('blog', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;
