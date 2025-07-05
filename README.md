# Template Hono Profesional

Template robusto y escalable para APIs con Hono, MongoDB, Firebase y logging avanzado.

## 🚀 Características

- **Framework**: Hono - Ultra-fast web framework
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: Firebase Admin SDK
- **Logging**: Winston con rotación de archivos
- **Manejo de errores**: Centralizado y tipado
- **TypeScript**: Configuración estricta
- **Middleware**: Logging, correlación de IDs, manejo de errores
- **Health checks**: Monitoreo completo del sistema
- **Borrado lógico**: Implementado en modelos base
- **Validación**: Zod para variables de entorno (sin dotenv - Bun lo maneja nativamente)

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones
│   ├── index.ts     # Variables de entorno
│   └── logger.ts    # Configuración de Winston
├── middleware/       # Middleware personalizados
│   ├── errorHandler.ts
│   └── logger.ts
├── models/          # Modelos de datos
│   └── BaseModel.ts
├── routes/          # Rutas organizadas
│   └── health.ts
├── services/        # Servicios externos
│   ├── mongodb.ts
│   └── firebase.ts
├── types/           # Tipos TypeScript
│   └── index.ts
├── utils/           # Utilidades
│   ├── errors.ts
│   └── response.ts
└── index.ts         # Punto de entrada
```

## 🛠️ Instalación

1. **Clonar el proyecto**:

   ```bash
   git clone <repo-url>
   cd prueba_hono
   ```

2. **Instalar dependencias**:

   ```bash
   bun install
   ```

3. **Configurar variables de entorno**:

   ```bash
   cp env.example .env
   ```

   Editar `.env` con tus configuraciones.

4. **Iniciar en desarrollo**:
   ```bash
   bun run dev
   ```

## 🔧 Configuración

### Variables de Entorno

Copia `env.example` a `.env` y configura:

- **NODE_ENV**: Entorno (development/production)
- **PORT**: Puerto del servidor
- **MONGODB_URI**: URI de conexión a MongoDB
- **FIREBASE\_\***: Credenciales de Firebase (opcionales)
- **LOG\_\***: Configuración de logging

### MongoDB

El servicio se conecta automáticamente al iniciar. Configurar URI en `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/prueba_hono
```

### Firebase

Firebase es opcional y maneja credenciales automáticamente según el entorno:

**🛠️ Desarrollo:**

```env
# Copiar el JSON completo del archivo de credenciales de Firebase
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

**🚀 Producción (Google Cloud):**

```env
# Sin configuración - Google Cloud maneja las credenciales automáticamente
# FIREBASE_SERVICE_ACCOUNT_KEY= (dejar vacío)
```

**💡 Obtener credenciales:**

1. Ve a [Console de Firebase](https://console.firebase.google.com/)
2. Proyecto → Configuración → Cuentas de servicio
3. Generar nueva clave privada → Descargar JSON
4. Copiar todo el contenido del JSON a `FIREBASE_SERVICE_ACCOUNT_KEY`

## 📊 Logging

El sistema incluye logging robusto con Winston:

- **Consola**: Desarrollo con colores
- **Archivos**: Rotación diaria automática
- **Niveles**: error, warn, info, debug
- **Excepciones**: Captura automática de errores no manejados

Los logs se guardan en:

- `logs/app-YYYY-MM-DD.log` - Logs generales
- `logs/error-YYYY-MM-DD.log` - Solo errores
- `logs/exceptions.log` - Excepciones no capturadas

## 🔍 Health Checks

Endpoints disponibles:

- `GET /health/ping` - Verificación básica
- `GET /health/status` - Estado de servicios
- `GET /health/detailed` - Información detallada del sistema

## 🛡️ Manejo de Errores

### Errores Personalizados

```typescript
import { CustomError } from "./utils/errors";

// Lanzar error personalizado
throw new CustomError("Error específico", 400);

// Errores pre-definidos
throw new NotFoundError("Usuario no encontrado");
throw new ValidationError("Datos inválidos");
throw new UnauthorizedError();
```

### Respuestas Estandarizadas

```typescript
import { sendSuccess, sendError } from "./utils/response";

// Respuesta exitosa
return sendSuccess(c, data, "Operación exitosa");

// Respuesta con paginación
return sendPaginatedSuccess(c, items, pagination);

// Respuesta de error
return sendError(c, "Error mensaje", 400);
```

## 📝 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo con hot reload
bun run dev

# Compilar para producción
bun run build

# Ejecutar producción
bun run start

# Linting
bun run lint

# Verificar tipos
bun run type-check
```

### Crear Nuevas Rutas

```typescript
import { Hono } from "hono";
import { sendSuccess } from "../utils/response";

const router = new Hono();

router.get("/example", async (c) => {
  try {
    const data = await someService();
    return sendSuccess(c, data, "Operación exitosa");
  } catch (error) {
    throw new CustomError("Error específico", 400);
  }
});

export default router;
```

### Crear Nuevos Modelos

```typescript
import { Schema, model } from "mongoose";
import { BaseDocument, addBaseFields, baseSchemaOptions } from "./BaseModel";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  baseSchemaOptions
);

addBaseFields(userSchema);

export default model<BaseDocument>("User", userSchema);
```

## 🔐 Seguridad

- Variables de entorno para configuración sensible
- Validación de entrada con Zod
- Logging de actividad sospechosa
- Manejo seguro de errores (no exponer stack traces en producción)

## 🚀 Despliegue

### Desarrollo

```bash
bun run dev
```

### Producción

```bash
bun run build
bun run start
```

### Docker (Opcional)

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📋 Reglas de Cursor

Este proyecto incluye reglas específicas para Cursor AI en `.cursor/rules` con:

- Patrones de código recomendados
- Estructura de archivos
- Convenciones de naming
- Mejores prácticas de desarrollo

## 📚 Documentación de API

### 🚀 **OpenAPI Auto-Generada (Recomendado)**

**La documentación se genera automáticamente desde tu código** - sin mantenimiento manual, siempre sincronizada.

#### Activación Rápida

```bash
# 1. Instalar dependencias (ya incluidas en package.json)
bun install

# 2. Seguir guía de activación
cat ACTIVAR-OPENAPI.md
```

#### Resultado

- `http://localhost:3000/api/v1/docs` - Documentación Swagger interactiva
- `http://localhost:3000/api/v1/openapi.json` - Especificación OpenAPI
- **Validación automática** en todas las rutas
- **Documentación siempre actualizada** desde el código

#### Ventajas de OpenAPI

- ✅ **Auto-generación** desde código
- ✅ **Validación automática** de requests/responses
- ✅ **Tipos TypeScript** consistentes
- ✅ **Nunca desactualizada**
- ✅ **UI interactiva** para testing

Ver **[ACTIVAR-OPENAPI.md](ACTIVAR-OPENAPI.md)** para activación y **[COMO-DOCUMENTAR-ENDPOINTS.md](COMO-DOCUMENTAR-ENDPOINTS.md)** para documentar endpoints.

### 🛡️ **Seguridad**

- ✅ Documentación **solo en desarrollo**
- ❌ **No disponible en producción**
- 🔒 Información mínima en endpoints públicos

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- **Activar OpenAPI**: [ACTIVAR-OPENAPI.md](ACTIVAR-OPENAPI.md)
- **Documentar Endpoints**: [COMO-DOCUMENTAR-ENDPOINTS.md](COMO-DOCUMENTAR-ENDPOINTS.md)
- **Reglas Cursor**: `.cursor/rules`
- **Issues**: Abrir un issue en GitHub
- **Logs**: Revisar directorio `logs/`
- **Health**: `GET /health/detailed`
