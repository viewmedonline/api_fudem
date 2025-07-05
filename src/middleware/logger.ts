import { Context, Next } from 'hono';
import { log } from '../config/logger';
import { randomUUID } from 'crypto';

export const requestLogger = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const requestId = randomUUID();
  
  // Agregar requestId al contexto
  c.set('requestId', requestId);
  
  const requestInfo = {
    requestId,
    method: c.req.method,
    url: c.req.url,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
    timestamp: new Date().toISOString(),
  };

  log.info('Petición recibida:', requestInfo);

  await next();

  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const responseInfo = {
    ...requestInfo,
    statusCode: c.res.status,
    duration: `${duration}ms`,
    contentType: c.res.headers.get('content-type') || 'unknown',
  };

  if (c.res.status >= 400) {
    log.warn('Petición completada con error:', responseInfo);
  } else {
    log.info('Petición completada exitosamente:', responseInfo);
  }
};

export const correlationIdMiddleware = async (c: Context, next: Next) => {
  // Obtener o generar correlation ID
  const correlationId = c.req.header('x-correlation-id') || c.get('requestId') || randomUUID();
  
  // Agregar al contexto
  c.set('correlationId', correlationId);
  
  // Agregar a la respuesta
  c.res.headers.set('x-correlation-id', correlationId);
  
  await next();
}; 