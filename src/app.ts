import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { APP_CONFIG } from './initializers/app';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { requestLogger } from './middlewares/logger';
import routes from './routes';
import logger from './initializers/logger';

const app: Application = express();

/**
 * Security Middleware
 */
app.use(helmet());

/**
 * CORS Configuration
 */
app.use(
  cors({
    origin: APP_CONFIG.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logger Middleware
 */
app.use(requestLogger);

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Kaarya API',
    version: '1.0.0',
    environment: APP_CONFIG.nodeEnv,
  });
});

/**
 * 404 Not Found Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

logger.info('Express app initialized');

export default app;
