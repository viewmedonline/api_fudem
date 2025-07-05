import { AppError } from '../types';

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Mantener el stack trace adecuado
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Conflicto en el recurso') {
    super(message, 409);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Error en la base de datos') {
    super(message, 500);
  }
}

export class ExternalServiceError extends CustomError {
  constructor(message: string = 'Error en servicio externo') {
    super(message, 503);
  }
}

// Función para determinar si un error es operacional
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof CustomError) {
    return error.isOperational;
  }
  return false;
};

// Función para crear respuestas de error estandarizadas
export const formatError = (error: Error) => {
  if (error instanceof CustomError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  return {
    success: false,
    error: 'Error interno del servidor',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { 
      originalError: error.message,
      stack: error.stack 
    })
  };
}; 