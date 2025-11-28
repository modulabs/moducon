"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message, statusCode = 500, code, details) => {
    res.status(statusCode).json({
        success: false,
        error: {
            code: code || `ERROR_${statusCode}`,
            message,
            details,
        },
    });
};
exports.errorResponse = errorResponse;
