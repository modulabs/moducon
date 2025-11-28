/**
 * Booth Controller
 * 부스 관련 API 컨트롤러
 */

import { Request, Response } from 'express';
import * as sheetsService from '../services/googleSheetsService';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * GET /api/booths
 * 부스 목록 조회
 */
export async function getBooths(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.query;

    const booths = type
      ? await sheetsService.filterBooths(type as string)
      : await sheetsService.getBooths();

    successResponse(res, booths, '부스 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('부스 목록 조회 실패:', error);
    errorResponse(res, '부스 목록 조회에 실패했습니다.', 500);
  }
}

/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회
 */
export async function getBoothById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const booth = await sheetsService.getBoothById(id);

    if (!booth) {
      errorResponse(res, '부스를 찾을 수 없습니다.', 404);
      return;
    }

    successResponse(res, booth, '부스 상세 정보를 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('부스 상세 조회 실패:', error);
    errorResponse(res, '부스 상세 조회에 실패했습니다.', 500);
  }
}
