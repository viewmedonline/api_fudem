import mongoose from 'mongoose';
import { config } from '../config';
import { log } from '../config/logger';

class MongoDBService {
  private static instance: MongoDBService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      log.info('MongoDB ya está conectado');
      return;
    }

    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      await mongoose.connect(config.database.uri, options);
      this.isConnected = true;
      
      log.info('MongoDB conectado exitosamente', {
        host: config.database.uri,
        database: config.database.name,
      });

      // Manejo de eventos de conexión
      mongoose.connection.on('error', (error: Error) => {
        log.error('Error en conexión MongoDB:', { error: error.message });
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        log.warn('MongoDB desconectado');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        log.info('MongoDB reconectado');
        this.isConnected = true;
      });

    } catch (error) {
      log.error('Error al conectar con MongoDB:', { 
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      log.info('MongoDB ya está desconectado');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      log.info('MongoDB desconectado exitosamente');
    } catch (error) {
      log.error('Error al desconectar MongoDB:', { 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      });
      throw error;
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      if (!this.isConnectionActive()) {
        return { status: 'unhealthy', details: 'No conectado a MongoDB' };
      }

      // Ping simple para verificar conectividad
      await mongoose.connection.db?.admin().ping();
      
      return { 
        status: 'healthy', 
        details: { 
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        }
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export default MongoDBService.getInstance(); 