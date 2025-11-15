"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json((0, response_1.errorResponse)('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', process.env.NODE_ENV === 'development' ? err.message : undefined));
};
exports.errorHandler = errorHandler;
