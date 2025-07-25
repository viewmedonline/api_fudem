/*
 * Script para actualizar prescripciones con firmas digitales del médico responsable
 * Compatible con Node.js 10
 */

const mongoose = require("mongoose");
const Prescription = require("../model/database_schemas").Prescription;
const Person = require("../model/database_schemas").Person;
const dbConfig = require("../config/db_config");

// Función para crear barra de progreso
const createProgressBar = function (current, total, barLength) {
  barLength = barLength || 40;
  const percentage = (current / total) * 100;
  const filledLength = Math.max(0, Math.min(barLength, Math.round((barLength * current) / total)));
  const emptyLength = Math.max(0, barLength - filledLength);
  const bar = "█".repeat(filledLength) + "░".repeat(emptyLength);
  return "[" + bar + "] " + percentage.toFixed(1) + "%";
};

const updatePrescriptionsWithSignatures = function () {
  return new Promise(function (resolve, reject) {
    console.log("🚀 Iniciando actualización de prescripciones con firmas digitales...");

    mongoose.connect(dbConfig.url, dbConfig.options)
      .then(function () {
        return Prescription.count({
          digital_signature: { $exists: false },
          responsible: { $exists: true },
          _skip_signature: { $exists: false }
        });
      })
      .then(function (prescriptionsCount) {
        console.log("📊 Prescripciones encontradas: " + prescriptionsCount.toLocaleString());

        if (prescriptionsCount === 0) {
          console.log("✅ No hay prescripciones para procesar");
          return resolve();
        }

        const batchSize = 500;
        let processed = 0;
        let updated = 0;
        let skipped = 0;
        const dateFrom = new Date();
        const digitalSignaturesCache = {};

        const processBatch = function (currentSkip) {
          // Buscar prescripciones que aún no tienen firma digital
          return Prescription.find({
            digital_signature: { $exists: false },
            responsible: { $exists: true },
            _skip_signature: { $exists: false }
          })
            .limit(batchSize)
            .lean()
            .then(function (prescriptions) {
              if (prescriptions.length === 0) {
                console.log("\n✅ No hay más prescripciones para procesar");
                return Promise.resolve({ finished: true });
              }

              // Obtener IDs únicos de médicos
              const responsibleIds = [];
              for (let i = 0; i < prescriptions.length; i++) {
                const responsibleId = prescriptions[i].responsible.toString();
                if (responsibleIds.indexOf(responsibleId) === -1) {
                  responsibleIds.push(responsibleId);
                }
              }

              // Buscar firmas no cacheadas
              const uncachedIds = [];
              for (let i = 0; i < responsibleIds.length; i++) {
                if (!digitalSignaturesCache.hasOwnProperty(responsibleIds[i])) {
                  uncachedIds.push(mongoose.Types.ObjectId(responsibleIds[i]));
                }
              }

              let fetchPromise = Promise.resolve([]);
              if (uncachedIds.length > 0) {
                fetchPromise = Person.find({
                  _id: { $in: uncachedIds },
                  digital_signature: { $exists: true }
                }).select("_id digital_signature").lean();
              }

              return fetchPromise.then(function (personsWithSignatures) {
                // Actualizar cache
                for (let i = 0; i < personsWithSignatures.length; i++) {
                  const person = personsWithSignatures[i];
                  digitalSignaturesCache[person._id.toString()] = person.digital_signature;
                }

                // Marcar médicos sin firma como null en cache
                for (let i = 0; i < uncachedIds.length; i++) {
                  const id = uncachedIds[i].toString();
                  if (!digitalSignaturesCache.hasOwnProperty(id)) {
                    digitalSignaturesCache[id] = null;
                  }
                }

                // Preparar actualizaciones bulk
                const bulkOps = [];
                const prescriptionsToSkip = [];
                
                for (let i = 0; i < prescriptions.length; i++) {
                  const prescription = prescriptions[i];
                  const responsibleId = prescription.responsible.toString();
                  const digitalSignature = digitalSignaturesCache[responsibleId];

                  processed++;

                  if (digitalSignature) {
                    bulkOps.push({
                      updateOne: {
                        filter: { _id: prescription._id },
                        update: { $set: { digital_signature: digitalSignature } }
                      }
                    });
                    updated++;
                  } else {
                    // Marcar prescripciones sin firma para omitir en futuras consultas
                    prescriptionsToSkip.push({
                      updateOne: {
                        filter: { _id: prescription._id },
                        update: { $set: { _skip_signature: true } }
                      }
                    });
                    skipped++;
                  }
                }

                // Ejecutar actualizaciones
                const promises = [];
                if (bulkOps.length > 0) {
                  promises.push(Prescription.bulkWrite(bulkOps));
                }
                if (prescriptionsToSkip.length > 0) {
                  promises.push(Prescription.bulkWrite(prescriptionsToSkip));
                }

                return Promise.all(promises).then(function () {
                  return { finished: false };
                });
              });
            })
            .then(function (result) {
              // Actualizar progreso
              const percentage = ((processed / prescriptionsCount) * 100).toFixed(1);
              const progressBar = createProgressBar(processed, prescriptionsCount);
              const elapsedSeconds = (new Date() - dateFrom) / 1000;
              const docsPerSecond = (processed / elapsedSeconds).toFixed(1);

              process.stdout.write(
                "\r" + progressBar + " " + processed.toLocaleString() + "/" + 
                prescriptionsCount.toLocaleString() + " (" + percentage + "%) | " +
                "Actualizadas: " + updated.toLocaleString() + " | " +
                "Omitidas: " + skipped.toLocaleString() + " | " + docsPerSecond + "/s"
              );

              // Continuar si no hemos terminado
              if (!result.finished && processed < prescriptionsCount) {
                return processBatch(currentSkip + batchSize);
              }
              
              return result;
            });
        };

        return processBatch(0).then(function () {
          console.log("");
          const dateTo = new Date();
          const duration = (dateTo - dateFrom) / 1000;
          const docsPerSecond = (processed / duration).toFixed(2);
          const successRate = processed > 0 ? ((updated / processed) * 100).toFixed(2) : "0.00";

          console.log("\n🎉 === ACTUALIZACIÓN COMPLETADA ===");
          console.log("⏰ Duración: " + Math.round(duration / 60) + " minutos");
          console.log("🚀 Velocidad: " + docsPerSecond + " prescripciones/segundo");
          console.log("📊 Total procesadas: " + processed.toLocaleString());
          console.log("✅ Actualizadas: " + updated.toLocaleString() + " (" + successRate + "%)");
          console.log("⚠️ Omitidas (sin firma): " + skipped.toLocaleString());

          return mongoose.connection.close();
        });
      })
      .then(function () {
        resolve();
      })
      .catch(function (error) {
        console.error("❌ Error:", error);
        reject(error);
      });
  });
};

updatePrescriptionsWithSignatures()
  .then(function () {
    console.log("✅ Proceso completado");
    process.exit(0);
  })
  .catch(function (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  });
