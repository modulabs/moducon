/**
 * Booth Controller
 * 부스 관련 API 컨트롤러 (PostgreSQL DB 사용)
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * GET /api/booths
 * 부스 목록 조회 (타입 필터링 지원)
 */
export async function getBooths(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.query;

    const where: { orgType?: string; isActive: boolean } = {
      isActive: true,
    };

    if (type && typeof type === 'string') {
      where.orgType = type;
    }

    const booths = await prisma.booth.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    successResponse(res, booths, '부스 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('부스 목록 조회 실패:', error);
    errorResponse(res, '부스 목록 조회에 실패했습니다.', 500);
  }
}

/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회 (code 또는 id로 조회)
 */
export async function getBoothById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const booth = await prisma.booth.findFirst({
      where: {
        OR: [{ code: id }, { id }],
        isActive: true,
      },
    });

    if (!booth) {
      errorResponse(res, '부스를 찾을 수 없습니다.', 404, 'BOOTH_NOT_FOUND');
      return;
    }

    successResponse(res, booth, '부스 상세 정보를 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('부스 상세 조회 실패:', error);
    errorResponse(res, '부스 상세 조회에 실패했습니다.', 500);
  }
}
