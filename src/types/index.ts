// Tipos generales del proyecto
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para configuración
export interface DatabaseConfig {
  uri: string;
  name: string;
  options?: Record<string, any>;
}

export interface FirebaseConfig {
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  authUri: string;
  tokenUri: string;
}

export interface LoggerConfig {
  level: string;
  maxSize: string;
  maxFiles: string;
}

// Tipos para modelos
export interface BaseModel {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Tipos para errores
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Tipos para contexto Hono extendido
export interface AppContext {
  userId?: string;
  userRole?: string;
  requestId: string;
} 