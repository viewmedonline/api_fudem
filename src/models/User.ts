import { Schema, model, Document } from 'mongoose';
import { BaseDocument, addBaseFields, baseSchemaOptions } from './BaseModel';

// Interface para el documento de usuario
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    notifications: boolean;
    language: string;
    timezone: string;
  };
  
  // Métodos del documento
  generateAuthToken(): string;
  comparePassword(password: string): Promise<boolean>;
  toPublicJSON(): Partial<IUser>;
}

// Schema del usuario
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
  },
  
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor ingrese un email válido'
    ],
  },
  
  password: {
    type: String,
    select: false, // No incluir en queries por defecto
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  
  avatar: {
    type: String,
    default: null,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  lastLogin: {
    type: Date,
    default: null,
  },
  
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en', 'fr', 'de'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  
}, baseSchemaOptions);

// Agregar campos base (createdAt, updatedAt, deletedAt)
addBaseFields(userSchema);

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Middleware pre-save para hash de contraseña
userSchema.pre('save', async function(next: any) {
  if (!this.isModified('password')) return next();
  
  try {
    // Aquí iría el hash de la contraseña
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para generar token de autenticación
userSchema.methods.generateAuthToken = function(): string {
  // Aquí iría la lógica para generar JWT
  return `token-${this._id}`;
};

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.password) return false;
  
  try {
    // Aquí iría la comparación con bcrypt
    // return await bcrypt.compare(password, this.password);
    return this.password === password; // Temporal - usar hash en producción
  } catch (error) {
    return false;
  }
};

// Método para retornar datos públicos del usuario
userSchema.methods.toPublicJSON = function(): Partial<IUser> {
  const userObject = this.toObject();
  
  // Eliminar campos sensibles
  delete userObject.password;
  delete userObject.deletedAt;
  delete userObject.__v;
  
  return userObject;
};

// Método estático para encontrar usuario por email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Método estático para encontrar usuarios activos
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Método estático para buscar usuarios por rol
userSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isActive: true });
};

// Virtual para obtener nombre completo (si se agregara apellido)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Middleware post-save para logging
userSchema.post('save', function(doc) {
  console.log(`Usuario ${doc.email} ha sido guardado`);
});

// Exportar el modelo
export default model<IUser>('User', userSchema); 