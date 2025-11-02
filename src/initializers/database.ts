import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Prisma Client singleton
class Database {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        Database.instance.$on('query' as never, (e: any) => {
          logger.debug('Query: ' + e.query);
          logger.debug('Duration: ' + e.duration + 'ms');
        });
      }

      // Log errors
      Database.instance.$on('error' as never, (e: any) => {
        logger.error('Prisma Error: ' + e.message);
      });

      // Log warnings
      Database.instance.$on('warn' as never, (e: any) => {
        logger.warn('Prisma Warning: ' + e.message);
      });

      logger.info('Database connection initialized');
    }

    return Database.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = Database.getInstance();
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = Database.getInstance();
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
      throw error;
    }
  }
}

export const prisma = Database.getInstance();
export default Database;
