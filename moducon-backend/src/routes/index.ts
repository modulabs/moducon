import { Router } from 'express';
import authRoutes from './auth';
import boothRoutes from './booths';
import paperRoutes from './papers';
import sessionRoutes from './sessions';

const router = Router();

router.use('/auth', authRoutes);
router.use('/booths', boothRoutes);
router.use('/papers', paperRoutes);
router.use('/sessions', sessionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
