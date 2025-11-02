import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../interfaces/request.interface';
import { TokenService } from '../services/token';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import logger from '../initializers/logger';

/**
 * Middleware to verify JWT access token
 */
export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = TokenService.verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
    });

    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.statusCode);
    } else {
      ApiResponse.error(res, 'Authentication failed', 401);
    }
  }
};
