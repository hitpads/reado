const { createError } = require("../middlewares/errors");
const service = require("../services/userService");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshTokenModel");


// POST - /login - Login Handler
exports.login = async (req, res, next) => {
    try {
        const deviceIdentifier = await req.headers.deviceidentifier;
        const { email, password, rememberMe } = req.body;
        const { accessToken, refreshToken, userId } = await service.login(
            email,
            password,
            rememberMe,
            deviceIdentifier
        );
        res.status(200).json({ accessToken, refreshToken, userId });
    } catch (err) {
        next(err);
    }
};

// POST - /access-token - Create new access token
exports.newAccessToken = async (req, res, next) => {
    try {
        const deviceIdentifier = await req.headers.deviceidentifier;
        const authHeader = await req.get("Authorization");
        const token = authHeader.substring(7); // remove Bearer prefix from token
        const accessToken = await service.newAccessToken(token, deviceIdentifier);
        res.status(200).json({ accessToken });
    } catch (err) {
        next(err);
    }
};

// POST - /logout - Logout Handler
exports.logout = async (req, res, next) => {
    try {
        const deviceIdentifier = req.headers.deviceidentifier;
        if (!deviceIdentifier) {
            throw createError(400, "", "Device identifier is required");
        }

        const authHeader = req.get("Authorization");
        if (!authHeader) {
            throw createError(401, "", "No token received");
        }

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.user.userId;

        await service.logout(userId, deviceIdentifier);

        return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error("🚨 Logout Error:", err.message);
        next(err);
    }
};



// POST - /register - Register Handler
exports.register = async (req, res, next) => {
    try {
        const { fullname, email, password, confirmPassword } = req.body;
        await service.register(fullname, email, password, confirmPassword);
        res.status(201).json({ message: "register success" });
    } catch (err) {
        next(err);
    }
};

// POST - /forget-password - Forget Password Handler
exports.forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        await service.forgetPassword(email);
        res.status(200).json({ message: "email sent" });
    } catch (err) {
        next(err);
    }
};

// POST - /reset-pass - Reset Password Handler
exports.resetForgetedPassword = async (req, res, next) => {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;
    try {
        await service.resetPassword(token, password, confirmPassword);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// PUT - /change-password/:id - Change Password Handler
exports.changePassword = async (req, res, next) => {
    const id = req.params.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    try {
        await service.changePassword(
            id,
            currentPassword,
            newPassword,
            confirmNewPassword
        );
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// PUT - /edit-profile/:id - Edit Profile Handler
exports.editProfile = async (req, res, next) => {
    const id = req.params.id;
    const { newEmail, newFullName } = req.body;
    try {
        await service.editProfile(id, newEmail, newFullName);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// GET - /user-info/:id - Returns the user's info
exports.userInfo = async (req, res, next) => {
    const id = req.userId;
    try {
        const user = await service.userInfo(id);
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

// GET - /save-post/:id - Saves a post
exports.savePost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const postId = req.params.id;
        await service.savePost(userId, postId);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// GET - /unsave-post/:id - Unsaves a post
exports.unsavePost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const postId = req.params.id;
        await service.unsavePost(userId, postId);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};