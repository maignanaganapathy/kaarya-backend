import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import logger from '../initializers/logger';
import { Prisma } from '@prisma/client';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    ApiResponse.error(res, err.message, err.statusCode, err.errors, err.stack);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      ApiResponse.error(res, 'A record with this value already exists', 409);
      return;
    }
    if (err.code === 'P2025') {
      ApiResponse.error(res, 'Record not found', 404);
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.error(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.error(res, 'Token expired', 401);
    return;
  }

  // Default error
  ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    500,
    undefined,
    err.stack
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};
