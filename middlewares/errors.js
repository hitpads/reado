exports.errorHandler = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message || "Server error";
    const data = error.data || null;

    res.status(status).json({
        success: false,
        message,
        data,
    });
};

exports.createError = (statusCode, data, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = data;
    return error;
};
