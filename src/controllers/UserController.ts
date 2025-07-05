import { Context } from 'hono'
import { sendSuccess, sendError } from '../utils/response'
import User, { IUser } from '../models/User'
import { log } from '../config/logger'

export class UserController {
  
  /**
   * Obtener todos los usuarios con paginación
   */
  static async getUsers(c: Context) {
    try {
      const page = parseInt(c.req.query('page') || '1')
      const limit = parseInt(c.req.query('limit') || '10')
      const role = c.req.query('role')
      const isActive = c.req.query('isActive')
      
      // Validar parámetros
      if (page < 1 || limit < 1 || limit > 100) {
        return sendError(c, 'Parámetros de paginación inválidos', 400)
      }
      
      const skip = (page - 1) * limit
      
      // Construir filtros
      const filters: any = {}
      if (role) filters.role = role
      if (isActive !== undefined) filters.isActive = isActive === 'true'
      
      // Obtener usuarios
      const users = await User.find(filters)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .sort({ createdAt: -1 })
      
      const total = await User.countDocuments(filters)
      
      log.info('Usuarios obtenidos', { 
        page, 
        limit, 
        total, 
        filters,
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, {
        users: users.map(user => user.toPublicJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }, 'Usuarios obtenidos exitosamente')
      
    } catch (error) {
      log.error('Error al obtener usuarios', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
  
  /**
   * Obtener usuario por ID
   */
  static async getUserById(c: Context) {
    try {
      const id = c.req.param('id')
      
      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return sendError(c, 'ID de usuario inválido', 400)
      }
      
      const user = await User.findById(id).select('-password')
      
      if (!user || user.deletedAt) {
        return sendError(c, 'Usuario no encontrado', 404)
      }
      
      log.info('Usuario obtenido por ID', { 
        userId: id,
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, user.toPublicJSON(), 'Usuario obtenido exitosamente')
      
    } catch (error) {
      log.error('Error al obtener usuario por ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: c.req.param('id'),
        correlationId: c.get('correlationId')
      })
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
  
  /**
   * Crear nuevo usuario
   */
  static async createUser(c: Context) {
    try {
      const body = await c.req.json()
      
      // Validación básica
      if (!body.name || !body.email) {
        return sendError(c, 'Nombre y email son requeridos', 400)
      }
      
      // Validar email formato
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return sendError(c, 'Formato de email inválido', 400)
      }
      
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ 
        email: body.email.toLowerCase(),
        deletedAt: null 
      })
      
      if (existingUser) {
        return sendError(c, 'El email ya está registrado', 409)
      }
      
      // Crear usuario
      const userData: Partial<IUser> = {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        role: body.role || 'user',
        isActive: body.isActive !== undefined ? body.isActive : true,
        preferences: {
          notifications: body.preferences?.notifications ?? true,
          language: body.preferences?.language || 'es',
          timezone: body.preferences?.timezone || 'UTC'
        }
      }
      
      if (body.password) {
        userData.password = body.password // En producción: hash aquí
      }
      
      const newUser = new User(userData)
      await newUser.save()
      
      log.info('Usuario creado exitosamente', { 
        userId: newUser._id,
        email: newUser.email,
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, newUser.toPublicJSON(), 'Usuario creado exitosamente', 201)
      
    } catch (error) {
      log.error('Error al crear usuario', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId: c.get('correlationId')
      })
      
      // Errores específicos de Mongoose
      if (error instanceof Error && error.name === 'ValidationError') {
        return sendError(c, 'Datos de usuario inválidos', 400)
      }
      
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
  
  /**
   * Actualizar usuario
   */
  static async updateUser(c: Context) {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()
      
      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return sendError(c, 'ID de usuario inválido', 400)
      }
      
      // Buscar usuario
      const existingUser = await User.findById(id)
      if (!existingUser || existingUser.deletedAt) {
        return sendError(c, 'Usuario no encontrado', 404)
      }
      
      // Validar email si se está actualizando
      if (body.email && body.email !== existingUser.email) {
        const emailExists = await User.findOne({ 
          email: body.email.toLowerCase(),
          _id: { $ne: id },
          deletedAt: null
        })
        
        if (emailExists) {
          return sendError(c, 'El email ya está registrado', 409)
        }
      }
      
      // Campos permitidos para actualización
      const allowedFields = ['name', 'email', 'role', 'isActive', 'preferences', 'avatar']
      const updateData: any = {}
      
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      })
      
      // Normalizar email
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim()
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password')
      
      if (!updatedUser) {
        return sendError(c, 'Error al actualizar usuario', 500)
      }
      
      log.info('Usuario actualizado exitosamente', { 
        userId: id,
        updatedFields: Object.keys(updateData),
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, updatedUser.toPublicJSON(), 'Usuario actualizado exitosamente')
      
    } catch (error) {
      log.error('Error al actualizar usuario', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: c.req.param('id'),
        correlationId: c.get('correlationId')
      })
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return sendError(c, 'Datos de usuario inválidos', 400)
      }
      
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
  
  /**
   * Eliminar usuario (soft delete)
   */
  static async deleteUser(c: Context) {
    try {
      const id = c.req.param('id')
      
      // Validar ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return sendError(c, 'ID de usuario inválido', 400)
      }
      
      const user = await User.findById(id)
      
      if (!user || user.deletedAt) {
        return sendError(c, 'Usuario no encontrado', 404)
      }
      
      // Soft delete
      user.deletedAt = new Date()
      user.isActive = false
      await user.save()
      
      log.info('Usuario eliminado exitosamente', { 
        userId: id,
        email: user.email,
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, null, 'Usuario eliminado exitosamente')
      
    } catch (error) {
      log.error('Error al eliminar usuario', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: c.req.param('id'),
        correlationId: c.get('correlationId')
      })
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
  
  /**
   * Restaurar usuario eliminado
   */
  static async restoreUser(c: Context) {
    try {
      const id = c.req.param('id')
      
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return sendError(c, 'ID de usuario inválido', 400)
      }
      
      const user = await User.findById(id)
      
      if (!user) {
        return sendError(c, 'Usuario no encontrado', 404)
      }
      
      if (!user.deletedAt) {
        return sendError(c, 'El usuario no está eliminado', 400)
      }
      
      // Restaurar usuario
      user.deletedAt = undefined
      user.isActive = true
      await user.save()
      
      log.info('Usuario restaurado exitosamente', { 
        userId: id,
        correlationId: c.get('correlationId')
      })
      
      return sendSuccess(c, user.toPublicJSON(), 'Usuario restaurado exitosamente')
      
    } catch (error) {
      log.error('Error al restaurar usuario', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: c.req.param('id'),
        correlationId: c.get('correlationId')
      })
      return sendError(c, 'Error interno del servidor', 500)
    }
  }
} 