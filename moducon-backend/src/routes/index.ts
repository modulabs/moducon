import { Router } from 'express';
import authRoutes from './auth';
import boothRoutes from './booths';
import paperRoutes from './papers';
import sessionRoutes from './sessions';
import checkinRoutes from './checkin';
import quizRoutes from './quiz';

const router = Router();

router.use('/auth', authRoutes);
router.use('/booths', boothRoutes);
router.use('/papers', paperRoutes);
router.use('/sessions', sessionRoutes);
router.use('/checkin', checkinRoutes);
router.use('/quiz', quizRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
