# 🚀 Activar OpenAPI - Guía Completa

## 1. Instalar Dependencias

```bash
# Las dependencias ya están en package.json
bun install
```

## 2. Activar Importaciones

En `src/index.ts`:

```typescript
// Cambiar esta línea:
// import usersExample from './routes/users-example' // Descomentar después de instalar dependencias

// Por esta:
import usersExample from "./routes/users-example";

// Y también cambiar:
// app.route('/api/v1', usersExample) // Descomentar después de instalar dependencias

// Por:
app.route("/api/v1", usersExample);
```

## 3. Ejecutar el Servidor

```bash
bun run dev
```

## 4. Probar OpenAPI

### Documentación Swagger UI

```
http://localhost:3000/api/v1/docs
```

### Especificación OpenAPI JSON

```
http://localhost:3000/api/v1/openapi.json
```

### Probar Endpoints

```bash
# Listar usuarios
curl http://localhost:3000/api/v1/users

# Ejemplo de respuesta:
[
  {
    "id": "1",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "user"
  },
  {
    "id": "2",
    "name": "Ana García",
    "email": "ana@ejemplo.com",
    "role": "admin"
  }
]
```

## 5. Crear Nuevas Rutas OpenAPI

```typescript
// src/routes/mi-ruta.ts
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const miRuta = new OpenAPIHono();

// 1. Definir esquema
const MiSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

// 2. Crear ruta documentada
const route = createRoute({
  method: "get",
  path: "/mi-endpoint",
  tags: ["Mi API"],
  summary: "Mi endpoint",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(MiSchema),
        },
      },
      description: "Respuesta exitosa",
    },
  },
});

// 3. Implementar
miRuta.openapi(route, (c) => {
  return c.json([{ id: "1", nombre: "Ejemplo" }]);
});

export default miRuta;
```

## 6. Beneficios Activos

✅ **Documentación Auto-generada**: Cambia código → actualiza documentación
✅ **Validación Automática**: Entrada/salida validada por Zod
✅ **UI Interactiva**: Swagger UI para testing
✅ **Tipos TypeScript**: Consistencia automática
✅ **Solo Desarrollo**: Documentación no expuesta en producción

## 7. Estructura Final

```
src/
├── routes/
│   ├── users-example.ts     ← Ejemplo OpenAPI completo
│   └── mi-nueva-ruta.ts     ← Tus nuevas rutas OpenAPI
├── index.ts                 ← Configuración principal
└── ...
```

## 8. Comandos Útiles

```bash
# Desarrollo
bun run dev

# Ver documentación
open http://localhost:3000/api/v1/docs

# Probar endpoint
curl http://localhost:3000/api/v1/users
```

---

**¡Listo!** Después de seguir estos pasos tendrás **documentación automática** desde tu código.

## 📖 **Siguiente Paso: Documentar tus Endpoints**

Una vez activado OpenAPI, lee la guía completa:
**[COMO-DOCUMENTAR-ENDPOINTS.md](COMO-DOCUMENTAR-ENDPOINTS.md)**

Te enseña paso a paso cómo documentar cualquier endpoint.
