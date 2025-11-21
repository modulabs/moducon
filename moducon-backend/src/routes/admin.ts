import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// 모든 관리자 라우트에 인증 미들웨어 적용
router.use(adminAuth);

/**
 * GET /api/admin/participants
 * 모든 참가자 목록 조회
 */
router.get('/participants', adminController.getParticipants);

/**
 * GET /api/admin/participants/search
 * 참가자 검색
 */
router.get('/participants/search', adminController.searchParticipants);

/**
 * GET /api/admin/participants/:id
 * 특정 참가자 상세 정보 조회
 */
router.get('/participants/:id', adminController.getParticipantById);

export default router;
