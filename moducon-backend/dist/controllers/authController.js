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
exports.getSignature = exports.getSignatureByUser = exports.resetLogin = exports.getMe = exports.saveSignature = exports.login = void 0;
const authService = __importStar(require("../services/authService"));
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const login = async (req, res) => {
    try {
        const { name, phone_last4 } = req.body;
        // 입력 검증
        if (!name || !phone_last4) {
            return (0, response_1.errorResponse)(res, 'Name and phone_last4 are required', 400, 'INVALID_INPUT');
        }
        if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
            return (0, response_1.errorResponse)(res, 'phone_last4 must be exactly 4 digits', 400, 'INVALID_PHONE');
        }
        // 로그인 시도
        const result = await authService.login({ name, phone_last4 });
        if (!result) {
            return (0, response_1.errorResponse)(res, '사용자 정보를 찾을 수 없습니다.', 401, 'AUTH_USER_NOT_FOUND');
        }
        (0, response_1.successResponse)(res, result, 'Login successful');
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        (0, response_1.errorResponse)(res, 'Login failed due to server error', 500, 'LOGIN_FAILED');
    }
};
exports.login = login;
const saveSignature = async (req, res) => {
    try {
        const { signature_data } = req.body;
        const userId = req.user.userId;
        // 입력 검증
        if (!signature_data) {
            return (0, response_1.errorResponse)(res, 'signature_data is required', 400, 'INVALID_INPUT');
        }
        // Base64 이미지 검증
        if (!signature_data.startsWith('data:image/')) {
            return (0, response_1.errorResponse)(res, 'signature_data must be a valid base64 image', 400, 'INVALID_SIGNATURE');
        }
        // 서명 저장
        const result = await authService.saveSignature({
            userId,
            signatureData: signature_data,
        });
        (0, response_1.successResponse)(res, result, 'Signature saved');
    }
    catch (error) {
        logger_1.logger.error('Save signature error:', error);
        (0, response_1.errorResponse)(res, 'Failed to save signature', 500, 'SIGNATURE_SAVE_FAILED');
    }
};
exports.saveSignature = saveSignature;
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await authService.getUserById(userId);
        if (!user) {
            return (0, response_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
        }
        (0, response_1.successResponse)(res, user);
    }
    catch (error) {
        logger_1.logger.error('Get user error:', error);
        (0, response_1.errorResponse)(res, 'Failed to get user information', 500, 'GET_USER_FAILED');
    }
};
exports.getMe = getMe;
const resetLogin = async (req, res) => {
    try {
        const { name, phone_last4 } = req.body;
        // 입력 검증
        if (!name || !phone_last4) {
            return (0, response_1.errorResponse)(res, 'Name and phone_last4 are required', 400, 'INVALID_INPUT');
        }
        const success = await authService.resetLogin({ name, phone_last4 });
        if (!success) {
            return (0, response_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
        }
        (0, response_1.successResponse)(res, null, 'Login session reset successfully');
    }
    catch (error) {
        logger_1.logger.error('Reset login error:', error);
        (0, response_1.errorResponse)(res, 'Failed to reset login session', 500, 'RESET_FAILED');
    }
};
exports.resetLogin = resetLogin;
// 서명 이미지 조회 (이름과 전화번호로)
const getSignatureByUser = async (req, res) => {
    try {
        const { name, phone_last4 } = req.query;
        // 입력 검증
        if (!name || !phone_last4) {
            return (0, response_1.errorResponse)(res, 'Name and phone_last4 are required', 400, 'INVALID_PARAMS');
        }
        const signature = await authService.getSignatureByUser({
            name: name,
            phone_last4: phone_last4
        });
        if (!signature) {
            return (0, response_1.errorResponse)(res, 'Signature not found', 404, 'SIGNATURE_NOT_FOUND');
        }
        (0, response_1.successResponse)(res, signature);
    }
    catch (error) {
        logger_1.logger.error('Get signature error:', error);
        (0, response_1.errorResponse)(res, 'Failed to get signature', 500, 'GET_SIGNATURE_FAILED');
    }
};
exports.getSignatureByUser = getSignatureByUser;
// 서명 이미지 조회 (userId로)
const getSignature = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return (0, response_1.errorResponse)(res, 'User ID is required', 400, 'INVALID_PARAMS');
        }
        const signature = await authService.getSignatureByUserId(userId);
        if (!signature) {
            return (0, response_1.errorResponse)(res, 'Signature not found', 404, 'SIGNATURE_NOT_FOUND');
        }
        (0, response_1.successResponse)(res, signature);
    }
    catch (error) {
        logger_1.logger.error('Get signature error:', error);
        (0, response_1.errorResponse)(res, 'Failed to get signature', 500, 'GET_SIGNATURE_FAILED');
    }
};
exports.getSignature = getSignature;
