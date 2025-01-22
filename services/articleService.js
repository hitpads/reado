const { Article } = require('../models'); // Assuming Article is properly exported

/**
 * Creates a new article and saves it to the database.
 *
 * @param {Object} articleData - The data for the new article { title, content, authorId, description, tags }.
 * @returns {Promise<Object>} - A promise that resolves to the created article.
 */
async function createNewArticle(articleData) {
    try {
        console.log('createNewArticle called with:', articleData); // Log the input

        // Use Article's build method and then save the instance to create new entries
        const articleInstance = Article.build(articleData);
        const savedArticle = await articleInstance.save(); // Save to DB
        return savedArticle; // Return the created entry to the caller
    } catch (error) {
        console.error('Error in createNewArticle:', error); // Log the error
        throw error; // Re-throw so the calling handler can address it
    }
}

module.exports = { createNewArticle };