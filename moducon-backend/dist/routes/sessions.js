"use strict";
/**
 * 세션 라우트
 * Google Sheets에서 세션 데이터를 가져와 제공
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleSheetsService_1 = require("../services/googleSheetsService");
const router = express_1.default.Router();
/**
 * GET /api/sessions
 * 세션 목록 조회 (트랙, 난이도 필터링 지원)
 */
router.get('/api/sessions', async (req, res) => {
    try {
        const { track, difficulty } = req.query;
        const sessions = await (0, googleSheetsService_1.filterSessions)(track, difficulty);
        res.json({
            success: true,
            data: sessions
        });
    }
    catch (error) {
        console.error('세션 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
/**
 * GET /api/sessions/:id
 * 특정 세션 상세 조회
 */
router.get('/api/sessions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const session = await (0, googleSheetsService_1.getSessionById)(id);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('세션 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
exports.default = router;
