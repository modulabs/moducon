import { Router } from 'express';
import authRoutes from './auth';
import boothRoutes from './booths';
import paperRoutes from './papers';
import sessionRoutes from './sessions';
import checkinRoutes from './checkin';
import quizRoutes from './quiz';
import adminRoutes from './admin';
import questionRoutes from './questions';
import favoriteRoutes from './favorites';
import mypageRoutes from './mypage';

const router = Router();

router.use('/auth', authRoutes);
router.use('/booths', boothRoutes);
router.use('/papers', paperRoutes);
router.use('/sessions', sessionRoutes);
router.use('/checkin', checkinRoutes);
router.use('/quiz', quizRoutes);
router.use('/admin', adminRoutes);
router.use('/questions', questionRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/mypage', mypageRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
