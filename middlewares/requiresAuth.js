const { requiresAuth } = require('express-openid-connect');
const express = require('express');
const app = express();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,

    session: {
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        }
    }
};

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
