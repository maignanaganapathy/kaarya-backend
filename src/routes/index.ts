import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

/**
 * Health check route
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount routes
 */
router.use('/auth', authRoutes);

export default router;
