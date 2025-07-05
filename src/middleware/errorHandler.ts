import { Context, Next } from 'hono';
import { log } from '../config/logger';
import { CustomError, formatError, isOperationalError } from '../utils/errors';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    // Log del error
    const errorDetails = {
      method: c.req.method,
      url: c.req.url,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (isOperationalError(error as Error)) {
      log.warn('Error operacional:', {
        error: (error as Error).message,
        ...errorDetails,
      });
    } else {
      log.error('Error no esperado:', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        ...errorDetails,
      });
    }

    // Formatear y enviar respuesta de error
    const formattedError = formatError(error as Error);
    return c.json(formattedError, formattedError.statusCode as any);
  }
};

export const notFoundHandler = (c: Context) => {
  const errorResponse = {
    success: false,
    error: 'Ruta no encontrada',
    statusCode: 404,
    path: c.req.url,
    method: c.req.method,
  };

  log.warn('Ruta no encontrada:', {
    method: c.req.method,
    url: c.req.url,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
  });

  return c.json(errorResponse, 404 as any);
}; 