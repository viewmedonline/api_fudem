// import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { z } from 'zod';
import { config } from './index';

// Configuración base de OpenAPI
export const openAPIConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Template Hono API',
    version: '1.0.0',
    description: 'API robusta con MongoDB, Firebase y logging avanzado',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'https://api.production.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Auth',
      description: 'Authentication operations',
    },
  ],
};

// Esquemas comunes reutilizables
export const commonSchemas = {
  // Respuesta estándar
  ApiResponse: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
  }),

  // Respuesta paginada
  PaginatedResponse: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.array(z.any()).optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }).optional(),
  }),

  // Error response
  ErrorResponse: z.object({
    success: z.literal(false),
    error: z.string(),
    statusCode: z.number().optional(),
    details: z.any().optional(),
  }),

  // Health check response
  HealthResponse: z.object({
    success: z.boolean(),
    data: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      timestamp: z.string(),
      uptime: z.number(),
      memory: z.object({
        rss: z.number(),
        heapTotal: z.number(),
        heapUsed: z.number(),
        external: z.number(),
      }),
      database: z.object({
        status: z.string(),
        details: z.any().optional(),
      }),
      firebase: z.object({
        status: z.string(),
        details: z.any().optional(),
      }),
    }),
  }),
};

// Función para crear documentación solo en desarrollo
export const createDocumentedApp = () => {
  // const app = new OpenAPIHono(); // Descomentar cuando instales @hono/zod-openapi

  // Solo en desarrollo
  if (config.env === 'development') {
    // Endpoint de documentación OpenAPI
    // app.doc('/openapi.json', openAPIConfig);
    
    // UI de Swagger se configurará cuando uses OpenAPIHono
  }

  // return app; // Descomentar cuando instales @hono/zod-openapi
};

// Ejemplo de ruta documentada (descomentar cuando instales @hono/zod-openapi)
/*
export const exampleDocumentedRoute = createRoute({
  method: 'get',
  path: '/health/ping',
  tags: ['Health'],
  summary: 'Basic health check',
  description: 'Returns a simple pong response to verify service is running',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: commonSchemas.ApiResponse,
        },
      },
      description: 'Service is healthy',
    },
    500: {
      content: {
        'application/json': {
          schema: commonSchemas.ErrorResponse,
        },
      },
      description: 'Service error',
    },
  },
});
*/ 