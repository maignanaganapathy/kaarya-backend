import { Router } from 'express';

import {
  googleAuthSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/auth';
import { validate } from '../middlewares/validate';
import { AuthController } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth authentication
 * @access  Public
 */
router.post('/google', validate(googleAuthSchema), AuthController.googleAuth);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  AuthController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  validate(logoutSchema),
  AuthController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
