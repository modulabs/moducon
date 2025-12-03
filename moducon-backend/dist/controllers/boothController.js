"use strict";
/**
 * Booth Controller
 * 부스 관련 API 컨트롤러 (PostgreSQL DB 사용)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooths = getBooths;
exports.getBoothById = getBoothById;
const prisma_1 = require("../lib/prisma");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
/**
 * GET /api/booths
 * 부스 목록 조회 (타입 필터링 지원)
 */
async function getBooths(req, res) {
    try {
        const { type } = req.query;
        const where = {
            isActive: true,
        };
        if (type && typeof type === 'string') {
            where.orgType = type;
        }
        const booths = await prisma_1.prisma.booth.findMany({
            where,
            orderBy: { code: 'asc' },
        });
        (0, response_1.successResponse)(res, booths, '부스 목록을 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('부스 목록 조회 실패:', error);
        (0, response_1.errorResponse)(res, '부스 목록 조회에 실패했습니다.', 500);
    }
}
/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회 (code 또는 id로 조회)
 */
async function getBoothById(req, res) {
    try {
        const { id } = req.params;
        const booth = await prisma_1.prisma.booth.findFirst({
            where: {
                OR: [{ code: id }, { id }],
                isActive: true,
            },
        });
        if (!booth) {
            (0, response_1.errorResponse)(res, '부스를 찾을 수 없습니다.', 404, 'BOOTH_NOT_FOUND');
            return;
        }
        (0, response_1.successResponse)(res, booth, '부스 상세 정보를 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('부스 상세 조회 실패:', error);
        (0, response_1.errorResponse)(res, '부스 상세 조회에 실패했습니다.', 500);
    }
}
