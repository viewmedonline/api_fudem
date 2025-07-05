# 🚀 OpenAPI Auto-Generated Documentation

## Por qué OpenAPI es Perfecto para Ti

**OpenAPI genera documentación automática desde tu código** - no necesitas mantener documentación separada, todo se mantiene sincronizado automáticamente.

## 1. Instalación y Configuración

```bash
# Instalar dependencias OpenAPI
bun add @hono/zod-openapi @hono/swagger-ui zod

# Nota: Las dependencias ya están configuradas en package.json
```

## 2. Configuración Básica

### Actualizar src/index.ts

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

// Cambiar de Hono a OpenAPIHono
const app = new OpenAPIHono();

// Documentación automática (solo desarrollo)
if (config.env === "development") {
  // Especificación OpenAPI JSON (se genera automáticamente)
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "My API",
      description: "API documentation auto-generated from code",
    },
  });

  // UI de Swagger (se genera automáticamente)
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));
}
```

## 3. Crear Rutas Auto-Documentadas

### Ejemplo: Ruta de Usuario

```typescript
// src/routes/users.ts
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const users = new OpenAPIHono();

// 1. Definir esquemas (se auto-documentan)
const UserSchema = z.object({
  id: z.string().openapi({ example: "123" }),
  name: z.string().openapi({ example: "Juan Pérez" }),
  email: z.string().email().openapi({ example: "juan@ejemplo.com" }),
  createdAt: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
});

const CreateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre muy corto")
    .openapi({ example: "Juan Pérez" }),
  email: z.string().email().openapi({ example: "juan@ejemplo.com" }),
});

// 2. Definir ruta documentada (se auto-genera la documentación)
const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Crear usuario",
  description: "Crea un nuevo usuario en el sistema",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Usuario creado exitosamente",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            details: z.array(z.string()).optional(),
          }),
        },
      },
      description: "Datos inválidos",
    },
  },
});

// 3. Implementar ruta (validación automática)
users.openapi(createUserRoute, async (c) => {
  // La validación es automática gracias a los esquemas
  const { name, email } = c.req.valid("json");

  // Tu lógica de negocio
  const user = await createUser({ name, email });

  return c.json(user, 201);
});

export default users;
```

## 4. Documentación que se Auto-Genera

### Lo que obtienes automáticamente:

1. **Especificación OpenAPI JSON** completa
2. **UI de Swagger** interactiva
3. **Validación automática** de entrada/salida
4. **Ejemplos** en la documentación
5. **Tipos TypeScript** consistentes

### Ejemplo de documentación generada:

```json
{
  "openapi": "3.0.0",
  "paths": {
    "/users": {
      "post": {
        "tags": ["Users"],
        "summary": "Crear usuario",
        "description": "Crea un nuevo usuario en el sistema",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string", "example": "Juan Pérez" },
                  "email": {
                    "type": "string",
                    "format": "email",
                    "example": "juan@ejemplo.com"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Usuario creado exitosamente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 5. Ventajas de la Auto-Generación

### ✅ **Siempre Sincronizada**

- Cambias código → documentación se actualiza automáticamente
- No hay documentación desactualizada

### ✅ **Validación Automática**

- Los esquemas validan entrada/salida
- Errores automáticos si no coincide

### ✅ **Tipos TypeScript**

- Tipos consistentes en todo el proyecto
- Autocompletado en el IDE

### ✅ **Testing Automático**

- Ejemplos se pueden usar en tests
- Validación de contratos

## 6. Configuración Avanzada

### Múltiples versiones de API

```typescript
// src/routes/v1/index.ts
const v1 = new OpenAPIHono().basePath("/api/v1");

// src/routes/v2/index.ts
const v2 = new OpenAPIHono().basePath("/api/v2");

// Documentación separada por versión
app.doc("/api/v1/openapi.json", v1Config);
app.doc("/api/v2/openapi.json", v2Config);
```

### Esquemas reutilizables

```typescript
// src/schemas/common.ts
export const commonSchemas = {
  ApiResponse: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
  }),

  PaginatedResponse: z.object({
    data: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
  }),
};
```

## 7. Ejemplo Completo de Implementación

### Paso 1: Instalar dependencias

```bash
bun add @hono/zod-openapi @hono/swagger-ui
```

### Paso 2: Actualizar src/index.ts

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

// Cambiar a OpenAPIHono
const app = new OpenAPIHono();

// Documentación automática
if (config.env === "development") {
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Mi API",
      description: "Documentación auto-generada",
    },
  });

  app.get("/docs", swaggerUI({ url: "/openapi.json" }));
}
```

### Paso 3: Crear rutas documentadas

```typescript
// src/routes/health.ts
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const health = new OpenAPIHono();

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Health check",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            uptime: z.number(),
          }),
        },
      },
      description: "Service is healthy",
    },
  },
});

health.openapi(healthRoute, (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default health;
```

## 8. Resultado Final

Después de la implementación tendrás:

1. **http://localhost:3000/docs** - Documentación Swagger interactiva
2. **http://localhost:3000/openapi.json** - Especificación OpenAPI completa
3. **Validación automática** en todas las rutas
4. **Tipos TypeScript** consistentes
5. **Documentación que nunca se desactualiza**

## 9. Comandos para Activar

```bash
# 1. Instalar dependencias
bun add @hono/zod-openapi @hono/swagger-ui

# 2. Actualizar src/index.ts (descomenta las líneas)
# 3. Actualizar src/config/swagger.ts (descomenta las líneas)

# 4. Ejecutar
bun run dev

# 5. Visitar http://localhost:3000/docs
```

## 🎯 **Próximos Pasos**

1. Instala las dependencias
2. Descomenta las líneas en los archivos de configuración
3. Crea tu primera ruta documentada
4. ¡Disfruta de la documentación automática!

---

**¿Necesitas ayuda con algún paso específico?** ¡Dímelo y lo implementamos juntos!
