import { Context } from 'hono';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(
  c: Context,
  data: T,
  message: string = 'Operación exitosa',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  
  return c.json(response, statusCode as any);
};

export const sendError = (
  c: Context,
  error: string,
  statusCode: number = 500,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(details && { details }),
  };
  
  return c.json(response, statusCode as any);
};

export const sendPaginatedSuccess = <T>(
  c: Context,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message: string = 'Datos obtenidos exitosamente',
  statusCode: number = 200
): Response => {
  const response: PaginatedResponse<T[]> = {
    success: true,
    data,
    message,
    pagination,
  };
  
  return c.json(response, statusCode as any);
};

export const sendNotFound = (
  c: Context,
  message: string = 'Recurso no encontrado'
): Response => {
  return sendError(c, message, 404);
};

export const sendBadRequest = (
  c: Context,
  message: string = 'Solicitud incorrecta',
  details?: any
): Response => {
  return sendError(c, message, 400, details);
};

export const sendUnauthorized = (
  c: Context,
  message: string = 'No autorizado'
): Response => {
  return sendError(c, message, 401);
};

export const sendForbidden = (
  c: Context,
  message: string = 'Acceso prohibido'
): Response => {
  return sendError(c, message, 403);
};

export const sendConflict = (
  c: Context,
  message: string = 'Conflicto en el recurso'
): Response => {
  return sendError(c, message, 409);
};

export const sendInternalError = (
  c: Context,
  message: string = 'Error interno del servidor'
): Response => {
  return sendError(c, message, 500);
}; 