import { Router } from 'express';
import authRoutes from './auth';
<<<<<<< HEAD
import boothRoutes from './booths';
import paperRoutes from './papers';
import sessionRoutes from './sessions';
import checkinRoutes from './checkin';
import quizRoutes from './quiz';
=======
import adminRoutes from './admin';
>>>>>>> backend-dev

const router = Router();

router.use('/auth', authRoutes);
<<<<<<< HEAD
router.use('/booths', boothRoutes);
router.use('/papers', paperRoutes);
router.use('/sessions', sessionRoutes);
router.use('/checkin', checkinRoutes);
router.use('/quiz', quizRoutes);
=======
router.use('/admin', adminRoutes);
>>>>>>> backend-dev

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
