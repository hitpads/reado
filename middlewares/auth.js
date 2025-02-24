const Role = require("../models/roleModel");
const User = require("../models/userModel");
const UrlRole = require("../models/urlRoleModel");
const RefreshToken = require("../models/refreshTokenModel");
const { createError } = require("./errors");

const jwt = require("jsonwebtoken");


exports.authenticated = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Remove "Bearer" prefix
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decodedToken.user?.userId || decodedToken.user?._id;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing in token" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

exports.requireRoles = async (req, res, next) => {
    try {
        const originalUrl = req.originalUrl;

        const url = await UrlRole.findOne({ url: originalUrl }).populate("roles");
        if (url) {
            const roles = url.roles;

            const user = await User.findOne({ _id: req.userId }).populate("roles");

            let userRolesNames = [];
            for (const role of user.roles) {
                userRolesNames.push(role.name);
            }

            const hasRequiredRoles = roles.every((role) =>
                userRolesNames.includes(role.name)
            );

            if (hasRequiredRoles) {
                return next();
            } else {
                throw createError(
                    401,
                    "",
                    "permission denied - don't have enough roles"
                );
            }
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
};