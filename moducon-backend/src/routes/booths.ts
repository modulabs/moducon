/**
 * Booth Routes
 * 부스 관련 라우트
 */

import { Router } from 'express';
import * as boothController from '../controllers/boothController';

const router = Router();

/**
 * GET /api/booths
 * 부스 목록 조회
 * Query params:
 *   - type: 부스 타입 필터 (기업, 모두의연구소 LAB, 모두의연구소 교육사업팀, 테크포임팩트 부스)
 */
router.get('/', boothController.getBooths);

/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회
 */
router.get('/:id', boothController.getBoothById);

export default router;
