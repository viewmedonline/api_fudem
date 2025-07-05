# API FUDEM - Especificaciones Técnicas

Este archivo define las especificaciones técnicas y configuraciones específicas del proyecto API FUDEM.

## Stack Tecnológico
- Runtime: Node.js v10
- Framework: Express.js 4.x
- Base de datos: MongoDB 6.0
- ODM: Mongoose 7.x
- Autenticación: JWT con passport.js
- Documentación: Swagger/OpenAPI 3.0
- Testing: Jest + Supertest

## Estructura del Proyecto
```
/api_fudem
├── /src
│   ├── /controllers    # Lógica de negocio
│   ├── /models        # Modelos Mongoose
│   ├── /routes        # Definición de endpoints
│   ├── /middleware    # Middlewares personalizados
│   ├── /services      # Servicios externos y lógica compleja
│   ├── /utils         # Utilidades y helpers
│   └── /config        # Configuraciones
├── /tests
│   ├── /unit          # Tests unitarios
│   └── /integration   # Tests de integración
└── /docs              # Documentación del proyecto
```

## Configuración de Base de Datos
- Conexión: MongoDB Atlas
- Colecciones principales:
  - users
  - patients
  - appointments
  - medical_records
- Índices requeridos por colección
- Esquemas con timestamps

## API Endpoints
- Base URL: /api/v1
- Autenticación requerida en headers:
  ```
  Authorization: Bearer <token>
  ```
- Formato de respuesta estándar:
  ```json
  {
    "success": boolean,
    "data": object|array,
    "error": string|null
  }
  ```

## Variables de Entorno
- NODE_ENV
- MONGODB_URI
- JWT_SECRET
- API_PORT
- CORS_ORIGINS

## Dependencias Principales
- express
- mongoose
- passport
- jsonwebtoken
- cors
- helmet
- winston

## Scripts NPM
- start: Inicia en producción
- dev: Inicia con nodemon
- test: Ejecuta tests
- lint: Verifica estilo
- build: Transpila código

## Integración Continua
- GitHub Actions para CI/CD
- Despliegue automático a staging
- Tests automáticos en PRs
- Análisis de código con SonarCloud
