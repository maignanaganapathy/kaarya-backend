import swaggerJsdoc from 'swagger-jsdoc';
import { APP_CONFIG } from './app';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kaarya API Documentation',
    version: '1.0.0',
    description: 'API documentation for Kaarya backend application',
    contact: {
      name: 'API Support',
      email: 'support@kaarya.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${APP_CONFIG.port}`,
      description: 'Development server',
    },
    {
      url: 'https://api-qa.kaarya.com',
      description: 'QA server',
    },
    {
      url: 'https://api.kaarya.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            example: 'user@example.com',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          profilePicture: {
            type: 'string',
            example: 'https://example.com/photo.jpg',
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Authentication successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              tokens: {
                $ref: '#/components/schemas/Tokens',
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
