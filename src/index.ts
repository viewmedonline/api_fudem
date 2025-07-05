import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { config } from './config'
import { log } from './config/logger'
import mongoService from './services/mongodb'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger, correlationIdMiddleware } from './middleware/logger'
import { sendSuccess } from './utils/response'

// Importar rutas
import healthRoutes from './routes/health'
import usersRoutes from './routes/users'

// Crear app
const app = new Hono()

// Middleware globales
app.use('*', correlationIdMiddleware)
app.use('*', requestLogger)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger())

// Ruta raíz
app.get('/', (c) => {
  return sendSuccess(c, {
    name: 'API FUDEM',
    version: '1.0.0',
    status: 'online',
    documentation: '/docs',
    healthCheck: '/health',
    endpoints: {
      health: '/health',
      users: '/users',
      consultations: '/consultations (próximamente)',
      persons: '/persons (próximamente)',
      records: '/records (próximamente)'
    }
  }, 'Sistema médico FUDEM - API interna')
})

// Ruta de documentación
app.get('/docs', (c) => {
  return c.text(`
# API FUDEM - Documentación

## 🏥 Sistema médico FUDEM - API interna

### 📋 Información General
- **Versión**: 1.0.0
- **Ambiente**: ${config.env}
- **Puerto**: ${config.port}

### 🔗 Endpoints Disponibles

#### Health Check
- \`GET /health\` - Estado básico del sistema
- \`GET /health/detailed\` - Estado detallado con información de servicios
- \`GET /health/ready\` - Verificación de preparación (Kubernetes)
- \`GET /health/live\` - Verificación de vida (Kubernetes)

#### Usuarios
- \`GET /users\` - Listar usuarios (con paginación)
  - Query params: page, limit, role, isActive
- \`GET /users/:id\` - Obtener usuario específico
- \`POST /users\` - Crear nuevo usuario
- \`PUT /users/:id\` - Actualizar usuario
- \`DELETE /users/:id\` - Eliminar usuario (soft delete)
- \`POST /users/:id/restore\` - Restaurar usuario eliminado

### 📚 Documentación Completa
Ver carpeta /docs en el repositorio para documentación detallada de cada endpoint.

### 🔧 Desarrollo
- **Framework**: Hono.js con TypeScript
- **Base de datos**: MongoDB con Mongoose
- **Logging**: Winston con rotación diaria
- **Arquitectura**: MVC con Controllers separados

---
Sistema médico FUDEM - API interna v1.0.0
  `, 200, { 'Content-Type': 'text/plain; charset=utf-8' })
})

// Rutas principales
app.route('/health', healthRoutes)
app.route('/users', usersRoutes)

// Crear grupo API v1 para futuras versiones
const apiV1 = new Hono()
apiV1.get('/', (c) => {
  return sendSuccess(c, {
    version: '1.0.0',
    status: 'active',
    availableRoutes: [
      '/health',
      '/users',
      '/consultations (en desarrollo)',
      '/persons (en desarrollo)',
      '/records (en desarrollo)',
      '/files (en desarrollo)'
    ],
    documentation: '/docs'
  }, 'API v1 - FUDEM')
})

// Montar rutas API v1 (para futuras versiones)
app.route('/api/v1', apiV1)

// Manejo de errores y rutas no encontradas
app.use('*', errorHandler)
app.notFound(notFoundHandler)

// Función de inicialización
async function initializeServices() {
  try {
    log.info('🚀 Iniciando API FUDEM...', {
      version: '1.0.0',
      environment: config.env
    })
    
    // Inicializar MongoDB
    await mongoService.connect()
    log.info('✅ MongoDB conectado exitosamente')
    
    log.info('✅ Todos los servicios inicializados correctamente')
  } catch (error) {
    log.error('❌ Error al inicializar servicios:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
    process.exit(1)
  }
}

// Manejo de cierre elegante
process.on('SIGTERM', async () => {
  log.info('📴 Recibida señal SIGTERM, cerrando servidor...')
  try {
    await mongoService.disconnect()
    log.info('✅ Servicios cerrados correctamente')
    process.exit(0)
  } catch (error) {
    log.error('❌ Error al cerrar servicios:', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
    process.exit(1)
  }
})

process.on('SIGINT', async () => {
  log.info('📴 Recibida señal SIGINT, cerrando servidor...')
  try {
    await mongoService.disconnect()
    log.info('✅ Servicios cerrados correctamente')
    process.exit(0)
  } catch (error) {
    log.error('❌ Error al cerrar servicios:', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
    process.exit(1)
  }
})

// Inicializar servicios al arrancar
initializeServices().then(() => {
  log.info(`🎉 API FUDEM lista en puerto ${config.port}`, {
    env: config.env,
    port: config.port,
    docs: `http://localhost:${config.port}/docs`,
    health: `http://localhost:${config.port}/health`
  })
})

export default app
