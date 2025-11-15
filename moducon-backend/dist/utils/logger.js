"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const currentLogLevel = (process.env.LOG_LEVEL || 'info');
const shouldLog = (level) => {
    return logLevels[level] >= logLevels[currentLogLevel];
};
exports.logger = {
    debug: (message, ...args) => {
        if (shouldLog('debug')) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },
    info: (message, ...args) => {
        if (shouldLog('info')) {
            console.log(`[INFO] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        if (shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    error: (message, error) => {
        if (shouldLog('error')) {
            console.error(`[ERROR] ${message}`, error);
        }
    },
};
