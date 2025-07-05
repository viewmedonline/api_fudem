# 📖 Cómo Documentar Endpoints con OpenAPI

## 🔍 **Diferencia Clave**

### ❌ **Rutas Normales (no documentadas)**

```typescript
const health = new Hono();

health.get("/ping", (c) => {
  return c.json({ message: "pong" });
});
// ❌ NO aparece en la documentación
```

### ✅ **Rutas OpenAPI (auto-documentadas)**

```typescript
const health = new OpenAPIHono();

// 1. DEFINIR cómo se ve la respuesta
const pingRoute = createRoute({
  method: "get",
  path: "/ping",
  tags: ["Health"],
  summary: "Health check básico",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: "Servicio activo",
    },
  },
});

// 2. IMPLEMENTAR la lógica
health.openapi(pingRoute, (c) => {
  return c.json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});
// ✅ Aparece automáticamente en Swagger UI
```

## 🚀 **3 Pasos para Documentar Cualquier Endpoint**

### **Paso 1: Definir Esquemas**

```typescript
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

// Define cómo se ven tus datos
const UserSchema = z.object({
  id: z.string().openapi({ example: "123" }),
  name: z.string().openapi({ example: "Juan Pérez" }),
  email: z.string().email().openapi({ example: "juan@ejemplo.com" }),
});
```

### **Paso 2: Crear Ruta Documentada**

```typescript
const getUserRoute = createRoute({
  method: "get", // HTTP method
  path: "/users/{id}", // URL path
  tags: ["Users"], // Grupo en documentación
  summary: "Obtener usuario", // Título corto
  description: "Busca un usuario por su ID", // Descripción

  // Parámetros de entrada
  request: {
    params: z.object({
      id: z.string().openapi({ example: "123" }),
    }),
  },

  // Posibles respuestas
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Usuario encontrado",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Usuario no encontrado",
    },
  },
});
```

### **Paso 3: Implementar Lógica**

```typescript
users.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid("param"); // ✨ Validación automática

  // Tu lógica normal
  const user = findUserById(id);

  if (!user) {
    return c.json({ error: "Usuario no encontrado" }, 404);
  }

  return c.json(user); // ✨ Tipado automático
});
```

## 📝 **Tipos de Endpoints Documentados**

### **GET Simple**

```typescript
const listRoute = createRoute({
  method: "get",
  path: "/items",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ItemSchema),
        },
      },
      description: "Lista de items",
    },
  },
});
```

### **POST con Body**

```typescript
const createRoute = createRoute({
  method: "post",
  path: "/items",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            description: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ItemSchema,
        },
      },
      description: "Item creado",
    },
  },
});
```

### **GET con Query Parameters**

```typescript
const searchRoute = createRoute({
  method: "get",
  path: "/search",
  request: {
    query: z.object({
      q: z.string().openapi({ example: "búsqueda" }),
      page: z.string().optional().openapi({ example: "1" }),
      limit: z.string().optional().openapi({ example: "10" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            results: z.array(ItemSchema),
            total: z.number(),
            page: z.number(),
          }),
        },
      },
      description: "Resultados de búsqueda",
    },
  },
});
```

## 🏥 **Ejemplo Real: Health Endpoints Documentados**

Ver archivo: `src/routes/health-openapi.ts`

```typescript
// 1. Esquemas
const PingResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
});

// 2. Ruta documentada
const pingRoute = createRoute({
  method: "get",
  path: "/ping",
  tags: ["Health"],
  summary: "Health check básico",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PingResponseSchema,
        },
      },
      description: "Servicio activo",
    },
  },
});

// 3. Implementación
health.openapi(pingRoute, (c) => {
  return c.json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});
```

## 🎯 **Resultado en Swagger UI**

Cuando ejecutes la app verás en `http://localhost:3000/api/v1/docs`:

```
📁 Health
  📄 GET /ping - Health check básico
    📋 Descripción: Verifica que el servicio esté funcionando
    🔄 Try it out (botón para probar)
    📊 Response Schema:
    {
      "message": "string",
      "timestamp": "string"
    }
    ✅ Example Response:
    {
      "message": "pong",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
```

## 🆚 **Comparación: Health Normal vs Health OpenAPI**

### Health Normal (actual)

```typescript
// src/routes/health.ts
health.get("/ping", (c) => {
  return sendSuccess(c, { message: "pong" }, "Servicio activo");
});
// ❌ No documentado, no aparece en Swagger
```

### Health OpenAPI (documentado)

```typescript
// src/routes/health-openapi.ts
health.openapi(pingRoute, (c) => {
  return c.json({ message: "pong", timestamp: new Date().toISOString() });
});
// ✅ Documentado automáticamente, aparece en Swagger
```

## 🔧 **Para Usar Health Documentado**

1. **Cambiar import en `src/index.ts`:**

```typescript
// Cambiar:
import healthRoutes from "./routes/health";

// Por:
import healthRoutes from "./routes/health-openapi";
```

2. **Resultado:** Los endpoints de health aparecerán documentados en Swagger UI

## 💡 **Ventajas de la Documentación OpenAPI**

- ✅ **Auto-generación**: Escribes código → se crea documentación
- ✅ **Validación**: Entrada/salida validada automáticamente
- ✅ **Testing**: UI interactiva para probar endpoints
- ✅ **Tipos**: TypeScript consistente en todo el proyecto
- ✅ **Ejemplos**: Se muestran automáticamente en la documentación
- ✅ **Contratos**: API documentada formalmente

---

**¿Necesitas ayuda documentando un endpoint específico?** ¡Dime cuál y te muestro el código exacto!
