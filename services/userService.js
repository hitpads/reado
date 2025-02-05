const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { createError } = require("../middlewares/errors");
const RefreshToken = require("../models/refreshTokenModel");
const ms = require("ms");

// ✅ Проверяем, загружается ли `JWT_SECRET`
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
}

// ✅ Функция генерации `accessToken`
const generateAccessToken = (user) => {
    return jwt.sign(
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
};

// ✅ Функция генерации `refreshToken`
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user: {
                userId: user._id.toString(),
                email: user.email,
                fullname: user.fullname,
            },
            usage: "auth-refresh",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );
};

// ✅ Логин пользователя
exports.login = async (email, password, rememberMe, deviceIdentifier) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw createError(404, "", "No user found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw createError(422, "", "Wrong password");
    }

    // Создание токенов
    const accessToken = generateAccessToken(user);
    let theRefreshToken;

    // Проверяем, есть ли уже `refreshToken` в базе
    const isRefreshTokenAlreadyCreated = await RefreshToken.findOne({ deviceIdentifier });

    if (!isRefreshTokenAlreadyCreated) {
        const refreshTokenExpiresIn = rememberMe ? "15d" : "1d";
        const expiresInMs = ms(refreshTokenExpiresIn);
        const refreshTokenExpirationTime = Date.now() + expiresInMs;

        theRefreshToken = generateRefreshToken(user);

        await RefreshToken.create({
            token: theRefreshToken,
            user: user._id.toString(),
            expiresAt: new Date(refreshTokenExpirationTime),
            deviceIdentifier,
        });
    } else {
        theRefreshToken = isRefreshTokenAlreadyCreated.token;
    }

    return {
        accessToken,
        refreshToken: theRefreshToken,
        userId: user._id.toString(),
    };
};

// ✅ Обновление `accessToken`

exports.newAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw createError(401, "", "Refresh token is missing");
    }

    const decodedToken = jwt.decode(refreshToken);

    if (!decodedToken || decodedToken.usage !== "auth-refresh") {
        throw createError(401, "", "Invalid refresh token");
    }

    // Проверяем, есть ли `refreshToken` в базе
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
        throw createError(401, "", "Refresh token not found");
    }

    try {
        jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            await RefreshToken.findOneAndRemove({ token: refreshToken });
            throw createError(401, "", "Refresh token expired, login again");
        }
        throw createError(401, "", "Invalid refresh token");
    }

    const user = await User.findById(decodedToken.user.userId);
    if (!user) {
        throw createError(404, "", "User not found");
    }

    // ✅ Генерируем новый `refreshToken`
    const newRefreshToken = jwt.sign(
        {
            user: {
                userId: user._id.toString(),
                email: user.email,
                fullname: user.fullname,
            },
            usage: "auth-refresh",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );

    // ✅ Обновляем `refreshToken` в базе
    storedToken.token = newRefreshToken;
    storedToken.expiresAt = new Date(Date.now() + ms("15d"));
    await storedToken.save();

    return {
        accessToken: generateAccessToken(user),
        refreshToken: newRefreshToken
    };
};

// exports.newAccessToken = async (refreshToken) => {
//     const decodedToken = jwt.decode(refreshToken);

//     if (!decodedToken || decodedToken.usage !== "auth-refresh") {
//         throw createError(401, "", "Invalid refresh token");
//     }

//     // Проверяем, есть ли `refreshToken` в базе
//     const storedToken = await RefreshToken.findOne({ token: refreshToken });
//     if (!storedToken) {
//         throw createError(401, "", "Refresh token not found");
//     }

//     try {
//         jwt.verify(refreshToken, process.env.JWT_SECRET);
//     } catch (err) {
//         if (err.name === "TokenExpiredError") {
//             await RefreshToken.findOneAndRemove({ token: refreshToken });
//             throw createError(401, "", "Refresh token expired, login again");
//         }
//         throw createError(401, "", "Invalid refresh token");
//     }

//     const user = await User.findById(decodedToken.user.userId);
//     if (!user) {
//         throw createError(404, "", "User not found");
//     }

//     return generateAccessToken(user);
// };

// ✅ Регистрация нового пользователя
exports.register = async (fullname, email, password, confirmPassword) => {
    await User.userValidation({ fullname, email, password, confirmPassword });

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw createError(422, "", "Email is already registered");
    }

    await User.create({
        fullname,
        email,
        password,
    });

    return true;
};

// ✅ Выход из системы
exports.logout = async (refreshToken) => {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
        throw createError(401, "", "Refresh token not found");
    }

    await RefreshToken.findOneAndRemove({ token: refreshToken });
};

// ✅ Получение информации о пользователе
exports.userInfo = async (userId) => {
    const user = await User.findById(userId).populate(["savedPosts", "comments"]);

    if (!user) {
        throw createError(404, "", "No user found");
    }

    return user;
};

// ✅ Сохранение поста
exports.savePost = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "", "User not found");
    }

    if (user.savedPosts.includes(postId)) {
        throw createError(400, "", "Post already saved");
    }

    user.savedPosts.push(postId);
    await user.save();
};

// ✅ Удаление поста из сохранённых
exports.unsavePost = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "", "User not found");
    }

    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    await user.save();
};
