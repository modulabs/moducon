"use strict";
/**
 * 세션 라우트
 * PostgreSQL DB에서 세션 데이터를 가져와 제공
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * GET /api/sessions
 * 세션 목록 조회 (트랙 필터링 지원)
 */
router.get('/', async (req, res) => {
    try {
        const { track } = req.query;
        const where = {
            isActive: true,
        };
        if (track && typeof track === 'string') {
            where.track = track;
        }
        const sessions = await prisma_1.prisma.session.findMany({
            where,
            orderBy: [{ track: 'asc' }, { timeSlot: 'asc' }],
        });
        return (0, response_1.successResponse)(res, sessions, '세션 목록을 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('세션 목록 조회 실패:', error);
        return (0, response_1.errorResponse)(res, '세션 목록 조회에 실패했습니다.', 500);
    }
});
/**
 * GET /api/sessions/:code
 * 특정 세션 상세 조회 (code로 조회)
 */
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const session = await prisma_1.prisma.session.findFirst({
            where: {
                OR: [{ code }, { id: code }],
                isActive: true,
            },
        });
        if (!session) {
            return (0, response_1.errorResponse)(res, '세션을 찾을 수 없습니다.', 404, 'SESSION_NOT_FOUND');
        }
        return (0, response_1.successResponse)(res, session, '세션 상세 정보를 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('세션 상세 조회 실패:', error);
        return (0, response_1.errorResponse)(res, '세션 상세 조회에 실패했습니다.', 500);
    }
});
/**
 * GET /api/sessions/track/:track
 * 트랙별 세션 목록 조회
 */
router.get('/track/:track', async (req, res) => {
    try {
        const { track } = req.params;
        const sessions = await prisma_1.prisma.session.findMany({
            where: {
                track,
                isActive: true,
            },
            orderBy: { timeSlot: 'asc' },
        });
        return (0, response_1.successResponse)(res, sessions, `${track} 트랙 세션 목록을 조회했습니다.`);
    }
    catch (error) {
        logger_1.logger.error('트랙별 세션 조회 실패:', error);
        return (0, response_1.errorResponse)(res, '트랙별 세션 조회에 실패했습니다.', 500);
    }
});
exports.default = router;
