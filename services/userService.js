const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Blog = require("../models/blogModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../models/userModel");
const { createError } = require("../middlewares/errors");
const RefreshToken = require("../models/refreshTokenModel");
const ms = require("ms");

// Login
exports.login = async (email, password, rememberMe, deviceIdentifier) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw createError(404, "", "no user found");
    }

    if (!user || !user.isVerified) {
        throw new Error("Please verify your email first");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw createError(422, "", "wrong password");
    }

    const accessToken = jwt.sign(
        {
            user: {
                userId: user._id.toString(),
                email: user.email,
                fullname: user.fullname,
            },
            usage: "auth-access",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const isRefreshTokenAlreadyCreated = await RefreshToken.findOne({
        deviceIdentifier,
    });

    let theRefreshToken;

    if (!isRefreshTokenAlreadyCreated) {
        const refreshTokenExpiresIn = rememberMe ? "15d" : "1d";
        const expiresInMs = ms(refreshTokenExpiresIn);
        const refreshTokenExpirationTime = Date.now() + expiresInMs;

        const refreshToken = jwt.sign(
            {
                user: {
                    userId: user._id.toString(),
                    email: user.email,
                    fullname: user.fullname,
                },
                usage: "auth-refresh",
            },
            process.env.JWT_SECRET,
            { expiresIn: refreshTokenExpiresIn }
        );

        theRefreshToken = refreshToken;

        await RefreshToken.create({
            token: refreshToken,
            user: user._id.toString(),
            expiresAt: new Date(refreshTokenExpirationTime),
            deviceIdentifier,
        });
    } else {
        theRefreshToken = isRefreshTokenAlreadyCreated.token;
    }

    return {
        accessToken: accessToken,
        refreshToken: theRefreshToken,
        userId: user._id.toString(),
    };
};

// Register
exports.register = async (fullname, email, password, confirmPassword) => {
    await User.userValidation({ fullname, email, password, confirmPassword });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
        fullname,
        email,
        password,
        verificationToken,
    });

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);

    return true;
};

async function sendVerificationEmail(email, verificationLink) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // `true` for port 465, `false` for 587
        auth: {
            user: 'ansarsh1243@gmail.com',
            pass: 'emldmigdyfckwssf',
        },
    });

    await transporter.sendMail({
        from: `"no reply" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click the link below to verify your email:</p>
               <a href="${verificationLink}">Verify Email</a>`,
    });
}

// Change Password
exports.changePassword = async (
    userId,
    currentPassword,
    newPassword,
    confirmNewPassword
) => {
    const user = await User.findById(userId);

    if (!user) {
        throw createError(404, "", "no user found");
    }

    await User.userValidation({
        fullname: user.fullname,
        email: user.email,
        password: newPassword,
        confirmPassword: confirmNewPassword,
    });

    const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        throw createError(422, "", "wrong password");
    }

    user.password = newPassword;
    await user.save();
};

// Edit Profile
exports.editProfile = async (userId, newEmail, newFullName) => {
    const user = await User.findById(userId);

    if (!user) {
        throw createError(404, "", "no user found");
    }

    await User.userValidation({
        fullname: newFullName,
        email: newEmail,
        password: "Password",
        confirmPassword: "Password",
    });

    user.email = newEmail;
    user.fullname = newFullName;

    await user.save();
};

// User Info
exports.userInfo = async (userId) => {
    const user = await User.findById(userId).populate(["savedPosts", "comments"]);

    if (!user) {
        throw createError(404, "", "no user found");
    }

    return user;
};
// logout
exports.logout = async (userId, deviceIdentifier) => {
    try {
        if (!userId || !deviceIdentifier) {
            throw createError(400, "", "User ID and device identifier are required");
        }

        console.log("🔍 Checking refresh token for:", { userId, deviceIdentifier });

        const refreshTokenDoc = await RefreshToken.findOne({
            user: userId,
            deviceIdentifier
        });

        if (!refreshTokenDoc) {
            console.log("⚠️ No refresh token found, but logging out anyway.");
            return { message: "Logout successful (no refresh token found)" };
        }

        await refreshTokenDoc.deleteOne();

        return { message: "Logout successful" };
    } catch (err) {
        console.error("🚨 Logout Service Error:", err.message);
        throw err;
    }
};

exports.savePost = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "", "User not found");
    }

    const post = await Blog.findById(postId);
    if (!post) {
        throw createError(404, "", "Post not found");
    }

    if (!user.savedPosts.includes(postId)) {
        user.savedPosts.push(postId);
        await user.save();
    }

    return { message: "Post saved successfully" };
};

exports.unsavePost = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "", "User not found");
    }

    const postIndex = user.savedPosts.indexOf(postId);
    if (postIndex === -1) {
        throw createError(400, "", "Post is not saved");
    }

    user.savedPosts.splice(postIndex, 1);
    await user.save();

    return { message: "Post unsaved successfully" };
};
