# 🚀 Script para Activar OpenAPI

## Comando Único

```bash
# Instalar dependencias OpenAPI (ya están en package.json)
bun install && echo "✅ Dependencias instaladas"
```

## Cambios Automáticos que Debes Hacer

### 1. Actualizar `src/index.ts`

**Cambiar:**

```typescript
import { Hono } from "hono";
const app = new Hono();
```

**Por:**

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
const app = new OpenAPIHono();
```

**Y agregar (antes de las rutas):**

```typescript
// Documentación OpenAPI (solo desarrollo)
if (config.env === "development") {
  // Especificación OpenAPI JSON
  app.doc("/api/v1/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Mi API",
      description: "Documentación auto-generada desde el código",
    },
  });

  // UI de Swagger
  app.get("/api/v1/docs", swaggerUI({ url: "/api/v1/openapi.json" }));
}
```

### 2. Activar Ejemplo de Usuarios

**Descomentar todo el código en:**

- `src/routes/users-example.ts`

**Agregar en `src/index.ts`:**

```typescript
import usersExample from "./routes/users-example";
app.route("/api/v1", usersExample);
```

### 3. Resultado

Después de estos cambios:

- `http://localhost:3000/api/v1/docs` → Documentación Swagger
- `http://localhost:3000/api/v1/openapi.json` → Especificación OpenAPI
- Validación automática en todas las rutas
- Documentación que se actualiza automáticamente

### 4. Verificar que Funciona

```bash
# Ejecutar el servidor
bun run dev

# Probar en otra terminal
curl http://localhost:3000/api/v1/users
```

## ✨ Magia de OpenAPI

Una vez activado, cada vez que definas una ruta con `createRoute`:

```typescript
const route = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Crear usuario",
  // ... resto de configuración
});

app.openapi(route, async (c) => {
  // Tu lógica aquí
  // Validación automática ✨
  // Documentación automática ✨
});
```

**¡Y listo!** La documentación se genera sola desde tu código.

---

**¿Necesitas ayuda con algún paso?** Todo está configurado para que funcione inmediatamente.
