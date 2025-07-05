import { z } from 'zod';

// Bun carga automáticamente las variables de entorno desde .env
// No necesitamos dotenv ya que Bun lo maneja nativamente

// Schema de validación para variables de entorno
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val: string) => parseInt(val, 10)).default('3000'),
  
  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:27017/prueba_hono'),
  MONGODB_DB_NAME: z.string().default('prueba_hono'),
  
  // Firebase - JSON completo de credenciales (solo para desarrollo)
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),
});

// Validar y exportar configuración
const envVars = envSchema.parse(process.env);

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  database: {
    uri: envVars.MONGODB_URI,
    name: envVars.MONGODB_DB_NAME,
  },
  
  firebase: {
    serviceAccountKey: envVars.FIREBASE_SERVICE_ACCOUNT_KEY,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
    maxSize: envVars.LOG_MAX_SIZE,
    maxFiles: envVars.LOG_MAX_FILES,
  },
}; 