# API FUDEM - Sistema Médico

## 🏥 Descripción

API interna para el sistema médico FUDEM desarrollada con Hono.js, TypeScript y MongoDB. Diseñada para gestionar pacientes, consultas médicas, historiales clínicos y más.

## 🚀 Características

### ✅ Tecnologías Implementadas

- **Framework**: Hono.js (ultrarrápido y moderno)
- **Lenguaje**: TypeScript (tipado estático)
- **Base de datos**: MongoDB con Mongoose
- **Logging**: Winston con rotación diaria
- **Arquitectura**: MVC con separación de responsabilidades
- **Validación**: Zod para validación de esquemas
- **Runtime**: Bun (ultra rápido)

### 🏗️ Arquitectura

```
src/
├── controllers/     # Lógica de negocio
├── routes/         # Definición de rutas (limpias)
├── models/         # Modelos de MongoDB
├── services/       # Servicios (DB, externos)
├── middleware/     # Middleware personalizado
├── utils/          # Utilidades
├── config/         # Configuración
└── types/          # Tipos TypeScript
```

## 📋 Endpoints Disponibles

### 🔹 Health Check

| Método | Endpoint           | Descripción                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/health`          | Estado básico del sistema      |
| GET    | `/health/detailed` | Estado detallado con servicios |
| GET    | `/health/ready`    | Readiness check (K8s)          |
| GET    | `/health/live`     | Liveness check (K8s)           |

### 👥 Usuarios

| Método | Endpoint             | Descripción                    |
| ------ | -------------------- | ------------------------------ |
| GET    | `/users`             | Listar usuarios (paginado)     |
| GET    | `/users/:id`         | Obtener usuario específico     |
| POST   | `/users`             | Crear nuevo usuario            |
| PUT    | `/users/:id`         | Actualizar usuario             |
| DELETE | `/users/:id`         | Eliminar usuario (soft delete) |
| POST   | `/users/:id/restore` | Restaurar usuario eliminado    |

### 🔮 Próximamente

- 👤 **Personas** (`/persons`) - Gestión de pacientes y médicos
- 📋 **Consultas** (`/consultations`) - Consultas médicas
- 📄 **Historiales** (`/records`) - Historiales clínicos
- 📁 **Archivos** (`/files`) - Gestión de archivos médicos
- 💊 **Medicamentos** (`/medicines`) - Catálogo de medicamentos
- 🏥 **Sucursales** (`/branches`) - Gestión de sucursales

## ⚙️ Instalación y Configuración

### Prerrequisitos

- Bun >= 1.2.0
- MongoDB >= 4.2
- Node.js >= 18 (para compatibilidad)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd api_fudem

# Instalar dependencias
bun install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Ejecutar en desarrollo
bun run dev

# Build para producción
bun run build
bun run start
```

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/fudem
MONGODB_DB_NAME=fudem

# Logging
LOG_LEVEL=info
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d
```

## 🧪 Testing

```bash
# Ejecutar health check
curl http://localhost:3000/health

# Ver documentación
curl http://localhost:3000/docs

# Crear usuario de prueba
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Juan Pérez","email":"dr.perez@fudem.org","role":"admin"}'
```

## 📊 Monitoreo y Logs

### Health Checks

- **Básico**: `/health` - Respuesta rápida
- **Detallado**: `/health/detailed` - Incluye estado de servicios
- **Kubernetes**: `/health/ready` y `/health/live`

### Logging

- Logs rotativos diarios en `/logs`
- Niveles: `error`, `warn`, `info`, `debug`
- Formato JSON estructurado
- Correlation ID para rastreo

## 🔒 Seguridad

- Validación estricta de entrada con Zod
- Soft delete para preservar datos
- Logging de auditoría
- Validación de ObjectId de MongoDB
- Headers CORS configurados
- Rate limiting (próximamente)

## 🚀 Deployment

### Docker

```dockerfile
FROM oven/bun:alpine
WORKDIR /app
COPY . .
RUN bun install --production
CMD ["bun", "run", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-fudem
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-fudem
  template:
    spec:
      containers:
        - name: api-fudem
          image: api-fudem:latest
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
```

## 🤝 Contribución

### Estructura de Commits

```
feat: agregar endpoint de consultas médicas
fix: corregir validación de email duplicado
docs: actualizar documentación de usuarios
refactor: separar lógica en PersonController
```

### Desarrollo

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar siguiendo la arquitectura MVC
3. Agregar tests unitarios
4. Actualizar documentación
5. Crear Pull Request

## 📞 Soporte

- **Email**: desarrollo@fudem.org
- **Documentación**: `/docs` endpoint
- **Health Status**: `/health/detailed`

---

**API FUDEM v1.0.0** - Sistema médico moderno y escalable
