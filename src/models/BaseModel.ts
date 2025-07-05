import { Schema, Document, Model } from 'mongoose';
import { BaseModel } from '../types';

export interface BaseDocument extends Document, Omit<BaseModel, '_id'> {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

export const addBaseFields = (schema: Schema) => {
  // Agregar campo de borrado lógico
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Middleware para filtrar documentos eliminados
  schema.pre(/^find/, function(this: any, next: any) {
    // Solo filtrar si no se especifica incluir eliminados
    if (!this.getOptions().includeDeleted) {
      this.where({ deletedAt: null });
    }
    next();
  });

  // Método para borrado lógico
  schema.methods.softDelete = function(callback?: (err?: Error) => void) {
    this.deletedAt = new Date();
    return this.save(callback);
  };

  // Método para restaurar
  schema.methods.restore = function(callback?: (err?: Error) => void) {
    this.deletedAt = null;
    return this.save(callback);
  };

  // Método estático para encontrar eliminados
  schema.statics.findDeleted = function() {
    return this.find({ deletedAt: { $ne: null } });
  };

  // Método estático para encontrar todo incluyendo eliminados
  schema.statics.findWithDeleted = function() {
    return this.find().setOptions({ includeDeleted: true });
  };
};

export default BaseDocument; 