/**
 * Paper Controller
 * 포스터 관련 API 컨트롤러
 */

import { Request, Response } from 'express';
import * as sheetsService from '../services/googleSheetsService';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * GET /api/papers
 * 포스터 목록 조회
 */
export async function getPapers(req: Request, res: Response): Promise<void> {
  try {
    const { conference, presentationTime } = req.query;

    const papers = await sheetsService.filterPapers(
      conference as string | undefined,
      presentationTime as string | undefined
    );

    successResponse(res, papers, '포스터 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('포스터 목록 조회 실패:', error);
    errorResponse(res, '포스터 목록 조회에 실패했습니다.', 500);
  }
}

/**
 * GET /api/papers/:id
 * 특정 포스터 상세 조회
 */
export async function getPaperById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const paper = await sheetsService.getPaperById(id);

    if (!paper) {
      errorResponse(res, '포스터를 찾을 수 없습니다.', 404);
      return;
    }

    successResponse(res, paper, '포스터 상세 정보를 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('포스터 상세 조회 실패:', error);
    errorResponse(res, '포스터 상세 조회에 실패했습니다.', 500);
  }
}
