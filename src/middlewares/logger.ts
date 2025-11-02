import { Request, Response, NextFunction } from 'express';
import logger from '../initializers/logger';
import { auditLog } from '../utils/audit-logger';
import { IAuthRequest } from '../interfaces/request.interface';

/**
 * Middleware to log all incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const authReq = req as IAuthRequest;

    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: authReq.user?.userId,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request warning', logData);
    } else {
      logger.info('Request completed', logData);
    }

    // Audit log for authenticated requests
    if (authReq.user?.userId) {
      auditLog({
        userId: authReq.user.userId,
        action: `${req.method} ${req.path}`,
        resource: req.path.split('/')[2] || 'unknown',
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    }
  });

  next();
};
