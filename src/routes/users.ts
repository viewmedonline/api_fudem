import { Hono } from 'hono'
import { UserController } from '../controllers/UserController'

const users = new Hono()

// Rutas de usuarios
users.get('/', UserController.getUsers)
users.get('/:id', UserController.getUserById)
users.post('/', UserController.createUser)
users.put('/:id', UserController.updateUser)
users.delete('/:id', UserController.deleteUser)

// Ruta adicional para restaurar usuarios eliminados
users.post('/:id/restore', UserController.restoreUser)

export default users 