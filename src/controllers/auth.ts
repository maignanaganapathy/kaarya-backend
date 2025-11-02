import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';
import { IAuthRequest } from '../interfaces/request.interface';
import logger from '../initializers/logger';

export class AuthController {
  /**
   * Google OAuth Login/Register
   * POST /api/auth/google
   */
  static googleAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { code } = req.body;
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      logger.info('Google auth initiated', { ip, userAgent });

      const result = await AuthService.googleAuth(code, ip, userAgent);

      return ApiResponse.success(res, 'Authentication successful', result, 200);
    }
  );

  /**
   * Refresh Access Token
   * POST /api/auth/refresh
   */
  static refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;

      logger.info('Token refresh requested');

      const result = await AuthService.refreshAccessToken(refreshToken);

      return ApiResponse.success(
        res,
        'Token refreshed successfully',
        result,
        200
      );
    }
  );

  /**
   * Logout
   * POST /api/auth/logout
   */
  static logout = asyncHandler(
    async (req: IAuthRequest, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      logger.info('Logout initiated', { userId });

      await AuthService.logout(refreshToken, userId);

      return ApiResponse.success(res, 'Logout successful', null, 200);
    }
  );

  /**
   * Get Current User
   * GET /api/auth/me
   */
  static getCurrentUser = asyncHandler(
    async (req: IAuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      logger.info('Get current user', { userId });

      const user = await AuthService.getUserById(userId);

      return ApiResponse.success(res, 'User retrieved successfully', user, 200);
    }
  );
}
