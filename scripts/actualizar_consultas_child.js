/**
 * Proceso hijo para procesar lotes de consultas (Compatible con Node.js 10)
 * Se ejecuta como proceso separado para paralelización
 */

const mongoose = require("mongoose");
const Consulta = require("../model/database_schemas").Consultation;
const Person = require("../model/database_schemas").Person;
const dbConfig = require("../config/db_config");

// Cache para firmas digitales
const signatureCache = {};

const processConsultationsBatch = function(skip, limit) {
  return new Promise(function(resolve, reject) {
    // Configuración optimizada para producción (Node.js 10)
    const productionOptions = Object.assign({}, dbConfig.options, {
      // Opciones compatibles con versiones antiguas de Mongoose
      useNewUrlParser: false,
      bufferMaxEntries: 0,
      bufferCommands: false,
      useUnifiedTopology: false
    });
    
    mongoose.connect(dbConfig.url, productionOptions)
      .then(function() {
        // Buscar lote específico
        return Consulta.find(
          { file: { $exists: false } },
          {
            _id: 1,
            "objOphthalmology.data.responsableConsultation": 1,
            "objOptometrist.data.responsableConsultation": 1,
          }
        )
        .skip(skip)
        .limit(limit)
        .lean();
      })
      .then(function(consultations) {
        if (consultations.length === 0) {
          return resolve({
            processed: 0,
            updated: 0,
            skipped: 0
          });
        }

        // Recopilar IDs únicos de usuarios
        const userIds = [];
        const userIdSet = {};
        
        for (let i = 0; i < consultations.length; i++) {
          const consultation = consultations[i];
          
          if (consultation.objOphthalmology && 
              consultation.objOphthalmology.data && 
              consultation.objOphthalmology.data.responsableConsultation) {
            const id = consultation.objOphthalmology.data.responsableConsultation.toString();
            if (!userIdSet[id]) {
              userIds.push(consultation.objOphthalmology.data.responsableConsultation);
              userIdSet[id] = true;
            }
          }
          
          if (consultation.objOptometrist && 
              consultation.objOptometrist.data && 
              consultation.objOptometrist.data.responsableConsultation) {
            const id = consultation.objOptometrist.data.responsableConsultation.toString();
            if (!userIdSet[id]) {
              userIds.push(consultation.objOptometrist.data.responsableConsultation);
              userIdSet[id] = true;
            }
          }
        }

        // Pre-cargar firmas si hay usuarios
        if (userIds.length > 0) {
          return Person.find(
            { _id: { $in: userIds } },
            { _id: 1, digital_signature: 1 }
          ).lean()
          .then(function(persons) {
            // Llenar cache de firmas
            for (let i = 0; i < persons.length; i++) {
              const person = persons[i];
              signatureCache[person._id.toString()] = person.digital_signature || null;
            }
            
            return consultations;
          });
        } else {
          return consultations;
        }
      })
      .then(function(consultations) {
        // Preparar operaciones bulk
        const batchOperations = [];
        let updated = 0;
        let skipped = 0;

        for (let i = 0; i < consultations.length; i++) {
          const consultation = consultations[i];
          const updateFields = {
            digital_signature_ofta: null,
            digital_signature_opto: null,
          };
          
          let hasUpdate = false;

          // Buscar firma del oftalmólogo
          if (consultation.objOphthalmology && 
              consultation.objOphthalmology.data && 
              consultation.objOphthalmology.data.responsableConsultation) {
            const signature = signatureCache[consultation.objOphthalmology.data.responsableConsultation.toString()];
            if (signature) {
              updateFields.digital_signature_ofta = signature;
              hasUpdate = true;
            }
          }

          // Buscar firma del optometrista
          if (consultation.objOptometrist && 
              consultation.objOptometrist.data && 
              consultation.objOptometrist.data.responsableConsultation) {
            const signature = signatureCache[consultation.objOptometrist.data.responsableConsultation.toString()];
            if (signature) {
              updateFields.digital_signature_opto = signature;
              hasUpdate = true;
            }
          }

          batchOperations.push({
            updateOne: {
              filter: { _id: consultation._id },
              update: { $set: updateFields },
            },
          });
          
          if (hasUpdate) {
            updated++;
          } else {
            skipped++;
          }
        }

        // Ejecutar operaciones bulk
        if (batchOperations.length > 0) {
          return Consulta.bulkWrite(batchOperations, { ordered: false })
            .then(function() {
              return {
                processed: consultations.length,
                updated: updated,
                skipped: skipped
              };
            });
        } else {
          return {
            processed: consultations.length,
            updated: updated,
            skipped: skipped
          };
        }
      })
      .then(function(result) {
        // Limpiar cache para liberar memoria
        for (const key in signatureCache) {
          delete signatureCache[key];
        }
        
        // Cerrar conexión de forma limpia
        return mongoose.connection.close()
          .then(function() {
            // Forzar garbage collection si está disponible
            if (global.gc) {
              global.gc();
            }
            
            resolve(result);
          });
      })
      .catch(function(error) {
        console.error("Error en proceso hijo (skip: " + skip + "):", error.message);
        
        // Intentar cerrar conexión aunque haya error
        mongoose.connection.close()
          .then(function() {
            reject(error);
          })
          .catch(function() {
            reject(error);
          });
      });
  });
};

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const skip = parseInt(args[0]) || 0;
const limit = parseInt(args[1]) || 500;

// Ejecutar el trabajo
processConsultationsBatch(skip, limit)
  .then(function(result) {
    // Enviar resultado al proceso padre
    if (process.send) {
      process.send({ success: true, result: result });
    } else {
      console.log(JSON.stringify({ success: true, result: result }));
    }
    process.exit(0);
  })
  .catch(function(error) {
    // Enviar error al proceso padre
    if (process.send) {
      process.send({ success: false, error: error.message });
    } else {
      console.error(JSON.stringify({ success: false, error: error.message }));
    }
    process.exit(1);
  });
