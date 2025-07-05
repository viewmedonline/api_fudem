import { Context } from 'hono'
import { sendSuccess, sendError } from '../utils/response'
import mongoService from '../services/mongodb'
import { log } from '../config/logger'

export class HealthController {
  
  /**
   * Health check básico - respuesta rápida
   */
  static async basicHealthCheck(c: Context) {
    try {
      const healthStatus = {
        status: 'ok',
        service: 'API FUDEM',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        pid: process.pid
      }
      
      return sendSuccess(c, healthStatus, 'Sistema funcionando correctamente')
    } catch (error) {
      log.error('Error en health check básico', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      return sendError(c, 'Error en health check', 500)
    }
  }
  
  /**
   * Health check detallado - incluye verificación de servicios
   */
  static async detailedHealthCheck(c: Context) {
    try {
      // Verificar MongoDB
      const dbHealth = await mongoService.healthCheck()
      
      // Información del sistema
      const systemInfo = {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null
      }
      
      const detailedHealth = {
        status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
        service: 'API FUDEM',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        system: systemInfo,
        services: {
          database: {
            status: dbHealth.status,
            details: dbHealth.details,
            responseTime: await HealthController.measureDbResponseTime()
          },
          api: {
            status: 'healthy',
            details: 'API funcionando correctamente',
            routes: [
              '/health',
              '/health/detailed',
              '/users',
              '/docs'
            ]
          }
        },
        checks: {
          database: dbHealth.status === 'healthy',
          memory: systemInfo.memory.heapUsed < systemInfo.memory.heapTotal * 0.9,
          uptime: systemInfo.uptime > 0
        }
      }
      
      // Determinar código de estado
      const isHealthy = Object.values(detailedHealth.checks).every(check => check === true)
      const statusCode = isHealthy ? 200 : 503
      
      // Log para monitoreo
      log.info('Health check detallado ejecutado', {
        status: detailedHealth.status,
        dbStatus: dbHealth.status,
        correlationId: c.get('correlationId')
      })
      
      return c.json(detailedHealth, statusCode)
      
    } catch (error) {
      log.error('Error en health check detallado', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      
      return c.json({
        status: 'error',
        service: 'API FUDEM',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
  }
  
  /**
   * Endpoint de readiness - para Kubernetes/Docker
   */
  static async readinessCheck(c: Context) {
    try {
      // Verificar que todos los servicios críticos estén listos
      const dbHealth = await mongoService.healthCheck()
      
      const isReady = dbHealth.status === 'healthy'
      
      if (isReady) {
        return sendSuccess(c, {
          status: 'ready',
          timestamp: new Date().toISOString(),
          services: {
            database: 'ready'
          }
        }, 'Servicio listo para recibir tráfico')
      } else {
        return c.json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth.status
          }
        }, 503)
      }
    } catch (error) {
      log.error('Error en readiness check', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      return c.json({
        status: 'not_ready',
        error: 'Readiness check failed'
      }, 503)
    }
  }
  
  /**
   * Endpoint de liveness - para Kubernetes/Docker
   */
  static async livenessCheck(c: Context) {
    try {
      // Verificación básica de que la aplicación esté viva
      return sendSuccess(c, {
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }, 'Aplicación está viva')
    } catch (error) {
      log.error('Error en liveness check', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      return c.json({
        status: 'dead',
        error: 'Liveness check failed'
      }, 500)
    }
  }
  
  /**
   * Medir tiempo de respuesta de la base de datos
   */
  private static async measureDbResponseTime(): Promise<number> {
    try {
      const start = Date.now()
      await mongoService.getConnection().db?.admin().ping()
      return Date.now() - start
    } catch (error) {
      return -1
    }
  }
} 