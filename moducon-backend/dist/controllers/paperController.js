"use strict";
/**
 * Paper Controller
 * 포스터 관련 API 컨트롤러 (PostgreSQL DB 사용)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPapers = getPapers;
exports.getPaperById = getPaperById;
const prisma_1 = require("../lib/prisma");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
/**
 * GET /api/papers
 * 포스터 목록 조회 (학회, 발표시간 필터링 지원)
 */
async function getPapers(req, res) {
    try {
        const { conference, presentationTime } = req.query;
        const where = {
            isActive: true,
        };
        // 학회명은 hashtags 배열에 저장됨
        if (conference && typeof conference === 'string') {
            where.hashtags = { has: conference };
        }
        if (presentationTime && typeof presentationTime === 'string') {
            where.presentationTime = { contains: presentationTime };
        }
        const papers = await prisma_1.prisma.poster.findMany({
            where,
            orderBy: { code: 'asc' },
        });
        (0, response_1.successResponse)(res, papers, '포스터 목록을 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('포스터 목록 조회 실패:', error);
        (0, response_1.errorResponse)(res, '포스터 목록 조회에 실패했습니다.', 500);
    }
}
/**
 * GET /api/papers/:id
 * 특정 포스터 상세 조회 (code 또는 id로 조회)
 */
async function getPaperById(req, res) {
    try {
        const { id } = req.params;
        const paper = await prisma_1.prisma.poster.findFirst({
            where: {
                OR: [{ code: id }, { id }],
                isActive: true,
            },
        });
        if (!paper) {
            (0, response_1.errorResponse)(res, '포스터를 찾을 수 없습니다.', 404, 'PAPER_NOT_FOUND');
            return;
        }
        (0, response_1.successResponse)(res, paper, '포스터 상세 정보를 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('포스터 상세 조회 실패:', error);
        (0, response_1.errorResponse)(res, '포스터 상세 조회에 실패했습니다.', 500);
    }
}
