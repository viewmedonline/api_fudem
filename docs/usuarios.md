# 👥 API Usuarios - Documentación

## Descripción

Módulo para gestión de usuarios del sistema FUDEM. Incluye médicos, administrativos, enfermeros y otros roles.

## 🔗 Endpoints

### 1. Listar Usuarios

```http
GET /users
```

**Query Parameters:**

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `role` (opcional): Filtrar por rol (`user`, `admin`, `moderator`)
- `isActive` (opcional): Filtrar por estado (`true`, `false`)

**Ejemplo de Solicitud:**

```bash
curl "http://localhost:3000/users?page=1&limit=5&role=admin&isActive=true"
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "users": [
      {
        "id": "60f1b2b8b8b8b8b8b8b8b8b8",
        "name": "Dr. Juan Pérez",
        "email": "dr.perez@fudem.org",
        "role": "admin",
        "isActive": true,
        "preferences": {
          "notifications": true,
          "language": "es",
          "timezone": "UTC"
        },
        "createdAt": "2023-07-01T10:00:00.000Z",
        "updatedAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Obtener Usuario por ID

```http
GET /users/:id
```

**Parámetros de Ruta:**

- `id`: ObjectId válido del usuario

**Ejemplo de Solicitud:**

```bash
curl http://localhost:3000/users/60f1b2b8b8b8b8b8b8b8b8b8
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": "60f1b2b8b8b8b8b8b8b8b8b8",
    "name": "Dr. Juan Pérez",
    "email": "dr.perez@fudem.org",
    "role": "admin",
    "isActive": true,
    "avatar": null,
    "lastLogin": "2023-07-01T09:30:00.000Z",
    "preferences": {
      "notifications": true,
      "language": "es",
      "timezone": "America/Caracas"
    },
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

### 3. Crear Usuario

```http
POST /users
```

**Cuerpo de la Solicitud:**

```json
{
  "name": "Dra. María González",
  "email": "dra.gonzalez@fudem.org",
  "password": "password123",
  "role": "user",
  "isActive": true,
  "preferences": {
    "notifications": true,
    "language": "es",
    "timezone": "America/Caracas"
  }
}
```

**Campos Requeridos:**

- `name`: Nombre completo (2-100 caracteres)
- `email`: Email válido y único

**Campos Opcionales:**

- `password`: Contraseña (mínimo 6 caracteres)
- `role`: Rol del usuario (`user`, `admin`, `moderator`) - default: `user`
- `isActive`: Estado activo - default: `true`
- `preferences`: Preferencias del usuario
- `avatar`: URL del avatar

**Ejemplo de Solicitud:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dra. María González",
    "email": "dra.gonzalez@fudem.org",
    "role": "user"
  }'
```

**Respuesta Exitosa (201):**

```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "60f1b2b8b8b8b8b8b8b8b8b9",
    "name": "Dra. María González",
    "email": "dra.gonzalez@fudem.org",
    "role": "user",
    "isActive": true,
    "preferences": {
      "notifications": true,
      "language": "es",
      "timezone": "UTC"
    },
    "createdAt": "2023-07-01T11:00:00.000Z",
    "updatedAt": "2023-07-01T11:00:00.000Z"
  }
}
```

### 4. Actualizar Usuario

```http
PUT /users/:id
```

**Parámetros de Ruta:**

- `id`: ObjectId válido del usuario

**Cuerpo de la Solicitud (campos opcionales):**

```json
{
  "name": "Dr. Juan Carlos Pérez",
  "email": "dr.juan.perez@fudem.org",
  "role": "admin",
  "isActive": true,
  "preferences": {
    "notifications": false,
    "language": "en",
    "timezone": "America/New_York"
  },
  "avatar": "https://example.com/avatar.jpg"
}
```

**Ejemplo de Solicitud:**

```bash
curl -X PUT http://localhost:3000/users/60f1b2b8b8b8b8b8b8b8b8b8 \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Juan Carlos Pérez"}'
```

### 5. Eliminar Usuario (Soft Delete)

```http
DELETE /users/:id
```

**Parámetros de Ruta:**

- `id`: ObjectId válido del usuario

**Ejemplo de Solicitud:**

```bash
curl -X DELETE http://localhost:3000/users/60f1b2b8b8b8b8b8b8b8b8b8
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Usuario eliminado exitosamente",
  "data": null
}
```

### 6. Restaurar Usuario

```http
POST /users/:id/restore
```

**Parámetros de Ruta:**

- `id`: ObjectId válido del usuario eliminado

**Ejemplo de Solicitud:**

```bash
curl -X POST http://localhost:3000/users/60f1b2b8b8b8b8b8b8b8b8b8/restore
```

## 🚨 Códigos de Error

### 400 - Bad Request

```json
{
  "status": "error",
  "message": "Nombre y email son requeridos",
  "data": null
}
```

**Casos comunes:**

- Parámetros de paginación inválidos
- ID de usuario inválido (no es ObjectId)
- Email con formato inválido
- Datos de validación incorrectos

### 404 - Not Found

```json
{
  "status": "error",
  "message": "Usuario no encontrado",
  "data": null
}
```

### 409 - Conflict

```json
{
  "status": "error",
  "message": "El email ya está registrado",
  "data": null
}
```

### 500 - Internal Server Error

```json
{
  "status": "error",
  "message": "Error interno del servidor",
  "data": null
}
```

## 📝 Modelos de Datos

### Usuario

```typescript
interface IUser {
  id: string;
  name: string; // Nombre completo
  email: string; // Email único
  password?: string; // Password hasheado (no visible)
  role: "user" | "admin" | "moderator";
  avatar?: string; // URL del avatar
  isActive: boolean; // Estado activo
  lastLogin?: Date; // Último login
  preferences: {
    notifications: boolean; // Recibir notificaciones
    language: string; // Idioma (es, en, fr, de)
    timezone: string; // Zona horaria
  };
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
  deletedAt?: Date; // Fecha de eliminación (soft delete)
}
```

## 🔐 Roles y Permisos

### Roles Disponibles

- **`user`**: Usuario básico - acceso limitado
- **`admin`**: Administrador - acceso completo
- **`moderator`**: Moderador - permisos intermedios

### Permisos por Rol

| Acción              | user | moderator | admin |
| ------------------- | ---- | --------- | ----- |
| Ver usuarios        | ❌   | ✅        | ✅    |
| Crear usuarios      | ❌   | ✅        | ✅    |
| Actualizar usuarios | ❌   | ✅        | ✅    |
| Eliminar usuarios   | ❌   | ❌        | ✅    |
| Restaurar usuarios  | ❌   | ❌        | ✅    |

## 💡 Mejores Prácticas

### Paginación

- Usar `limit` máximo de 100 items
- Implementar `page` para navegación
- Verificar `hasNext` y `hasPrev` para UI

### Filtrado

- Combinar múltiples filtros: `?role=admin&isActive=true`
- Usar valores exactos para enum fields

### Soft Delete

- Los usuarios eliminados no aparecen en listados normales
- Usar endpoint `/restore` para recuperar
- Mantener integridad referencial

### Logging

- Todas las operaciones se registran
- Usar `correlationId` para rastreo
- Monitorear logs para auditoría

---

**Última actualización**: Julio 2024  
**Versión API**: 1.0.0
