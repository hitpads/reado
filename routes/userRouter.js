const express = require("express");
const { verifyEmail } = require("../controllers/userController");
const path = require("path");
const userController = require("../controllers/userController");
const {
    authenticated,
    // requireRoles,
} = require("../middlewares/auth");

const router = express.Router();

// POST - /login - Login Handler
router.post("/login", userController.login);
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "login.html"));
});

// POST - /access-token - Create new access token
router.post("/access-token", userController.newAccessToken);

// POST - /register - Register Handler
router.post("/register", userController.register);
router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "register.html"));
});

router.get("/verify-email", userController.verifyEmail);

// POST - /logout - Logout Handler
router.post("/logout", authenticated, userController.logout);

// POST - /forget-password - Forget Password Handler
router.post("/forget-password", userController.forgetPassword);

// POST - /reset-forgeted-password:token - Reset Password Handler
router.post(
    "/reset-forgeted-password/:token",
    userController.resetForgetedPassword
);

// PUT - /change-password/:id - Change Password Handler
router.put(
    "/change-password/:id",
    authenticated,
    userController.changePassword
);

// PUT - /edit-profile/:id - Edit Profile Handler
router.put("/edit-profile/:id", authenticated, userController.editProfile);
router.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "profile.html"));
});
router.get("/profile", userController.userInfo);

// GET - /user-info/:id - Returns the user's info
router.get("/user-info", authenticated, userController.userInfo);

// GET - /save-post/:id - Saves a post
router.get("/save-post/:id", authenticated, userController.savePost);


router.get("/new_article", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "new_article.html"));
});

// GET - /unsave-post/:id - Unsaves a post
router.get("/unsave-post/:id", authenticated, userController.unsavePost);

module.exports = router;