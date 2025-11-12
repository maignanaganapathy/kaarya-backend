import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { APP_CONFIG } from './initializers/app';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { requestLogger } from './middlewares/logger';
import routes from './routes';
import logger from './initializers/logger';
import { swaggerSpec } from './initializers/swagger';

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
 * Swagger API Documentation
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Kaarya API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

/**
 * API Routes
 */
app.use('/', routes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Kaarya API',
    version: '1.0.0',
    environment: APP_CONFIG.nodeEnv,
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
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
