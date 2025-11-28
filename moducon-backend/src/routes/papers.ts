/**
 * Paper Routes
 * 포스터 관련 라우트
 */

import { Router } from 'express';
import * as paperController from '../controllers/paperController';

const router = Router();

/**
 * GET /api/papers
 * 포스터 목록 조회
 * Query params:
 *   - conference: 학회명 필터
 *   - presentationTime: 발표 시간 필터
 */
router.get('/', paperController.getPapers);

/**
 * GET /api/papers/:id
 * 특정 포스터 상세 조회
 */
router.get('/:id', paperController.getPaperById);

export default router;
