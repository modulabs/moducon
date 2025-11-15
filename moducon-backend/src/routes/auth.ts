import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 공개 엔드포인트
router.post('/login', authController.login);
router.post('/reset-login', authController.resetLogin);

// 인증 필요 엔드포인트
router.post('/signature', authenticate, authController.saveSignature);
router.get('/me', authenticate, authController.getMe);

export default router;
