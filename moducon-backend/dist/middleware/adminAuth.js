"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production';
const adminAuth = (req, res, next) => {
    try {
        const token = req.headers['x-admin-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '관리자 인증이 필요합니다.',
            });
        }
        // JWT 검증
        jsonwebtoken_1.default.verify(token, ADMIN_SECRET);
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 관리자 토큰입니다.',
        });
    }
};
exports.adminAuth = adminAuth;
