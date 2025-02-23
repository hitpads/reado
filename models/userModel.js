const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const schemas = require("./secure/userValidation");

// Main Mongoose Schema for User
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            default: ["member"],
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: [],
        },
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            default: [],
        },
    ],
    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            default: [],
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.methods.generateVerificationToken = function () {
    this.verificationToken = crypto.randomBytes(32).toString("hex");
};

// Set User Validation in Statics
userSchema.statics.userValidation = function (body) {
    return schemas.registerUserScheme.validate(body, { abortEarly: false });
};

// Hashing Password Before Saving the User
userSchema.pre("save", function (next) {
    let user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

const User = mongoose.model("User", userSchema);

module.exports = User;