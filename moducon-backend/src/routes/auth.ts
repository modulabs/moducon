import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 공개 엔드포인트
router.post('/login', authController.login);
router.post('/reset-login', authController.resetLogin);
router.get('/signature/user', authController.getSignatureByUser); // 이름과 전화번호로 서명 조회
router.get('/signature/:userId', authController.getSignature); // userId로 서명 조회

// 인증 필요 엔드포인트
router.post('/signature', authenticate, authController.saveSignature);
router.get('/me', authenticate, authController.getMe);

export default router;
