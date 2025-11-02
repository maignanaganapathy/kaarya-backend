import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ApiResponse } from '../utils/api-response';
import logger from '../initializers/logger';

/**
 * Middleware to validate request using Zod schema
 */
export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Validation error', { errors, path: req.path });

        return ApiResponse.error(res, 'Validation failed', 400, errors);
      }
      next(error);
    }
  };
};
