exports.login = (req, res) => {
    // Redirect to Auth0 login page
    res.redirect('/auth/login');
};

exports.logout = (req, res) => {
    // Log out from the Auth0 session
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        res.redirect('/'); // Redirect user to homepage or login page
    });
};

exports.getUserInfo = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: Please log in.' });
    }
    res.status(200).json(req.user); // Return user info from Auth0
};