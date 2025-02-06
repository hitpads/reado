const Role = require("../models/roleModel");
const User = require("../models/userModel");
const UrlRole = require("../models/urlRoleModel");
const RefreshToken = require("../models/refreshTokenModel");
const { createError } = require("./errors");

const jwt = require("jsonwebtoken");
const redis = require("redis");

exports.authenticated = async (req, res, next) => {
    try {
        const deviceIdentifier = await req.headers.deviceidentifier;
        const authHeader = await req.get("Authorization");

        if (!authHeader) {
            throw createError(
                401,
                "No authorization token provided",
                "no permission to access the resource"
            );
        }

        const token = authHeader.substring(7);
        const decodedToken = jwt.decode(token);

        if (!decodedToken) throw createError(401, "", "token is not valid");

        req.userId = decodedToken.user.userId;

        const isUserLoggedIn = await RefreshToken.findOne({ deviceIdentifier });

        if (!isUserLoggedIn) {
            throw createError(401, "", "login again");
        }

        if (decodedToken.usage === "auth-access") {
            const finalDecodedToken = jwt.verify(token, process.env.JWT_SECRET);

            if (!finalDecodedToken) {
                throw createError(401, "", "send refresh token");
            }

            next();
        } else {
            throw createError(401, "", "token is not valid");
        }
    } catch (err) {
        if (err.message === "jwt expired") {
            next(createError(401, "", "send refresh token"));
        }
        next(err);
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