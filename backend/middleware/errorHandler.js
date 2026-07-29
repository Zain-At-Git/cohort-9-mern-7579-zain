// middleware/errorHandler.js
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message); // pura detail sirf server log mein

    const statusCode = err.statusCode || 500;
    const clientMessage = statusCode === 500 ? 'Internal Server Error' : err.message;

    res.status(statusCode).json({
        success: false,
        message: clientMessage
    });
};

module.exports = errorHandler;