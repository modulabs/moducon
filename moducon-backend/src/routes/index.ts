import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
