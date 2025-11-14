"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message) => ({
    success: true,
    data,
    message,
});
exports.successResponse = successResponse;
const errorResponse = (code, message, details) => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
exports.errorResponse = errorResponse;
