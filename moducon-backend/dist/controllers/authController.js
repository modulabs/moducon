"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLogin = exports.getMe = exports.saveSignature = exports.login = void 0;
const authService = __importStar(require("../services/authService"));
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const login = async (req, res) => {
    try {
        const { name, phone_last4 } = req.body;
        // 입력 검증
        if (!name || !phone_last4) {
            return res.status(400).json((0, response_1.errorResponse)('INVALID_INPUT', 'Name and phone_last4 are required'));
        }
        if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
            return res.status(400).json((0, response_1.errorResponse)('INVALID_PHONE', 'phone_last4 must be exactly 4 digits'));
        }
        // 로그인 시도
        const result = await authService.login({ name, phone_last4 });
        if (!result) {
            return res.status(401).json((0, response_1.errorResponse)('AUTH_USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.'));
        }
        res.json((0, response_1.successResponse)(result, 'Login successful'));
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json((0, response_1.errorResponse)('LOGIN_FAILED', 'Login failed due to server error'));
    }
};
exports.login = login;
const saveSignature = async (req, res) => {
    try {
        const { signature_data } = req.body;
        const userId = req.user.userId;
        // 입력 검증
        if (!signature_data) {
            return res.status(400).json((0, response_1.errorResponse)('INVALID_INPUT', 'signature_data is required'));
        }
        // Base64 이미지 검증
        if (!signature_data.startsWith('data:image/')) {
            return res.status(400).json((0, response_1.errorResponse)('INVALID_SIGNATURE', 'signature_data must be a valid base64 image'));
        }
        // 서명 저장
        const result = await authService.saveSignature({
            userId,
            signatureData: signature_data,
        });
        res.json((0, response_1.successResponse)(result, 'Signature saved'));
    }
    catch (error) {
        logger_1.logger.error('Save signature error:', error);
        res.status(500).json((0, response_1.errorResponse)('SIGNATURE_SAVE_FAILED', 'Failed to save signature'));
    }
};
exports.saveSignature = saveSignature;
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await authService.getUserById(userId);
        if (!user) {
            return res.status(404).json((0, response_1.errorResponse)('USER_NOT_FOUND', 'User not found'));
        }
        res.json((0, response_1.successResponse)(user));
    }
    catch (error) {
        logger_1.logger.error('Get user error:', error);
        res.status(500).json((0, response_1.errorResponse)('GET_USER_FAILED', 'Failed to get user information'));
    }
};
exports.getMe = getMe;
const resetLogin = async (req, res) => {
    try {
        const { name, phone_last4 } = req.body;
        // 입력 검증
        if (!name || !phone_last4) {
            return res.status(400).json((0, response_1.errorResponse)('INVALID_INPUT', 'Name and phone_last4 are required'));
        }
        const success = await authService.resetLogin({ name, phone_last4 });
        if (!success) {
            return res.status(404).json((0, response_1.errorResponse)('USER_NOT_FOUND', 'User not found'));
        }
        res.json((0, response_1.successResponse)(null, 'Login session reset successfully'));
    }
    catch (error) {
        logger_1.logger.error('Reset login error:', error);
        res.status(500).json((0, response_1.errorResponse)('RESET_FAILED', 'Failed to reset login session'));
    }
};
exports.resetLogin = resetLogin;
