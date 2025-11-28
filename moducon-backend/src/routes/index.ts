import { Router } from 'express';
import authRoutes from './auth';
import boothRoutes from './booths';
import paperRoutes from './papers';

const router = Router();

router.use('/auth', authRoutes);
router.use('/booths', boothRoutes);
router.use('/papers', paperRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
