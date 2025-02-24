const { createError } = require("../middlewares/errors");
const service = require("../services/userService");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


// POST - /login - Login Handler
exports.login = async (req, res, next) => {
    try {
        const deviceIdentifier = req.headers.deviceidentifier;
        if (!deviceIdentifier) {
            return res.status(400).json({ message: "Device identifier is required" });
        }

        const { email, password, rememberMe } = req.body;
        const { accessToken, refreshToken, userId } = await service.login(
            email, password, rememberMe, deviceIdentifier
        );

        // Set httpOnly cookie for the refresh token
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,  // Prevent access from JavaScript
            secure: process.env.NODE_ENV === "development", // Use HTTPS in production
            sameSite: "Strict", // Protect against CSRF attacks
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({ accessToken, userId });
    } catch (err) {
        next(err);
    }
};

// POST - /access-token - Create new access token
exports.newAccessToken = async (req, res, next) => {
    try {
        const deviceIdentifier = req.headers.deviceidentifier;
        if (!deviceIdentifier) {
            return res.status(400).json({ message: "Device identifier is required" });
        }

        // Get refreshToken from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        // Generate a new access token using the refresh token
        const accessToken = await service.newAccessToken(refreshToken, deviceIdentifier);

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
// /verify-mail 
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
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
    try {
        const userId = req.userId;
        console.log("Fetching user info for:", userId); // ✅ Debugging

        const user = await User.findById(userId)
            .populate("savedPosts", "title body") // ✅ Populate saved posts with title & body
            .select("fullname email savedPosts");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error("Error fetching user info:", err.message);
        next(err);
    }
};

// GET - /save-post/:id - Saves a post
exports.savePost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const postId = req.params.id;

        console.log("🔍 Saving post for user:", userId, "Post ID:", postId); // ✅ Debugging

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Prevent duplicate saves
        if (user.savedPosts.includes(postId)) {
            return res.status(400).json({ message: "Post already saved" });
        }

        user.savedPosts.push(postId);
        await user.save();

        res.status(200).json({ message: "Post saved successfully!" });
    } catch (err) {
        console.error("🚨 Error saving post:", err.message);
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