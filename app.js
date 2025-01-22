require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');
const path = require('path');
const routes = require('./routes/routes');
const app = express();
const requiresAuth = require('./middlewares/requiresAuth');

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Static file serve
app.use(express.static(path.join(__dirname, 'src'))); // Serve files from public/ folder

// Auth0
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

// authentication middleware
app.use(auth(config));

// link backend and frontend routes
app.use(routes);

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
});

// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack); // Log errors to the console
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}, // Show stack trace in development
    });
});

app.get('/login', (req, res) => {
    res.oidc.login({
        returnTo: '/', // Redirect back to the homepage after login
    });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});