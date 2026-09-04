const AppError = require("../errors/app.error");

function errorHandler(err, req, res, next) {

    console.error("Application error:", {
        message: err.message,
        statusCode: err.statusCode,
        googleStatus: err.response?.status
    });

    // Our application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details && {
                details: err.details
            })
        });
    }

    // Google API errors
    const googleStatus = err.response?.status;

    if (googleStatus === 401) {
        return res.status(401).json({
            error: "Google authorization is invalid or expired"
        });
    }

    if (googleStatus === 403) {
        return res.status(403).json({
            error: "You do not have permission to access this calendar resource"
        });
    }

    if (googleStatus === 404) {
        return res.status(404).json({
            error: "Calendar event or resource not found"
        });
    }

    if (googleStatus === 429) {
        return res.status(429).json({
            error: "Google Calendar rate limit exceeded"
        });
    }

    if (googleStatus >= 500) {
        return res.status(503).json({
            error: "Google Calendar is temporarily unavailable"
        });
    }

    // Unexpected errors
    return res.status(500).json({
        error: "Internal server error"
    });
}

module.exports = errorHandler;