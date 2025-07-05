import * as winston from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');
import { config } from './index';

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaString}`;
  })
);

// Configuración de transportes
const transports: winston.transport[] = [
  // Consola para desarrollo
  new winston.transports.Console({
    format: consoleFormat,
    level: config.env === 'development' ? 'debug' : config.logging.level,
  }),
  
  // Archivos rotativos para errores
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    zippedArchive: true,
  }),
  
  // Archivos rotativos para todos los logs
  new DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    zippedArchive: true,
  }),
];

// Crear instancia del logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
  exitOnError: false,
});

// Crear wrapper para logging estructurado
export const log = {
  error: (message: string, meta?: Record<string, any>) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },
  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },
  // Método especial para logs HTTP
  http: (req: { method: string; url: string; ip?: string }, res: { statusCode: number }, duration: number) => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  },
};

export default logger; 