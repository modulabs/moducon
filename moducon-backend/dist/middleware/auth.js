"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.errorResponse)(res, 'No authentication token provided', 401, 'AUTH_TOKEN_MISSING');
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: decoded.userId,
            name: decoded.name,
        };
        logger_1.logger.debug(`User authenticated: ${decoded.name} (${decoded.userId})`);
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication failed:', error);
        return (0, response_1.errorResponse)(res, 'Invalid or expired token', 401, 'AUTH_TOKEN_INVALID');
    }
};
exports.authenticate = authenticate;
