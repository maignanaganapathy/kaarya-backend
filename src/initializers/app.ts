import config from 'config';

export const APP_CONFIG = {
  port: Number(process.env.PORT) || config.get<number>('server.port'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins:
    process.env.ALLOWED_ORIGINS?.split(',') ||
    config.get<string[]>('cors.origins'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
