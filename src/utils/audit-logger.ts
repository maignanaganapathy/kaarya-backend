import logger from '../initializers/logger';

interface AuditLogData {
  userId?: string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
}

export const auditLog = (data: AuditLogData) => {
  logger.info('AUDIT', {
    timestamp: new Date().toISOString(),
    userId: data.userId || 'anonymous',
    action: data.action,
    resource: data.resource,
    details: data.details,
    ip: data.ip,
    userAgent: data.userAgent,
  });
};

export default auditLog;
