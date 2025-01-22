const sequelize = require('../db/database');
const User = require('../models/User');
const Article = require('../models/Article');

const syncDatabase = async () => {
    try {
        // Synchronize models
        await sequelize.sync({ force: false }); // Set force: true to reset tables (development only)
        console.log('Database synced successfully!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    } finally {
        await sequelize.close();
    }
};

syncDatabase();