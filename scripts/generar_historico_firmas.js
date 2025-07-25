/**
 * Script para poblar la colección DigitalSignature con firmas existentes
 * Compatible con Node.js 10 - Migra las firmas digitales desde Person a DigitalSignature
 */

const mongoose = require("mongoose");
const Person = require("../model/database_schemas").Person;
const DigitalSignature = require("../model/database_schemas").DigitalSignature;
const dbConfig = require("../config/db_config");

// Función para crear barra de progreso visual
const createProgressBar = function(current, total, barLength) {
  barLength = barLength || 40;
  const percentage = (current / total) * 100;
  const filledLength = Math.max(
    0,
    Math.min(barLength, Math.round((barLength * current) / total))
  );
  const emptyLength = Math.max(0, barLength - filledLength);
  const bar = "█".repeat(filledLength) + "░".repeat(emptyLength);
  return "[" + bar + "] " + percentage.toFixed(1) + "%";
};

// Función para actualizar progreso
const updateProgress = function(current, total, created, skipped, startTime) {
  const percentage = ((current / total) * 100).toFixed(1);
  const progressBar = createProgressBar(current, total);
  const elapsedSeconds = (new Date() - startTime) / 1000;
  const avgTimePerDoc = elapsedSeconds / current;
  const remainingDocs = total - current;
  const estimatedRemainingSeconds = remainingDocs * avgTimePerDoc;
  const estimatedRemainingMinutes = Math.round(estimatedRemainingSeconds / 60);
  const docsPerSecond = (current / elapsedSeconds).toFixed(1);

  process.stdout.write(
    "\r" + progressBar + " " + current.toLocaleString() + "/" + total.toLocaleString() + " " +
      "(" + percentage + "%) | Creadas: " + created.toLocaleString() + " | " +
      "Omitidas: " + skipped.toLocaleString() + " | " + docsPerSecond + "/s | " +
      "ETA: " + estimatedRemainingMinutes + "min"
  );
};

const populateDigitalSignatures = function() {
  return new Promise(function(resolve, reject) {
    console.log("🚀 Iniciando migración de firmas digitales (Node.js 10)...");
    console.log("📋 Conectando a la base de datos...");
    
    // Configuración compatible con Node.js 10
    const compatibleOptions = Object.assign({}, dbConfig.options, {
      useNewUrlParser: false,
      useUnifiedTopology: false
    });
    
    mongoose.connect(dbConfig.url, compatibleOptions)
      .then(function() {
        console.log("✅ Conexión establecida");

        // Contar personas con firma digital
        return Person.count({
          digital_signature: { $exists: true, $ne: null },
        });
      })
      .then(function(personsWithSignatureCount) {
        console.log("📊 Personas con firma digital encontradas: " + personsWithSignatureCount.toLocaleString());

        if (personsWithSignatureCount === 0) {
          console.log("⚠️  No se encontraron personas con firma digital");
          return resolve();
        }

        // Verificar cuántas firmas ya existen en la colección DigitalSignature
        return DigitalSignature.count({})
          .then(function(existingSignaturesCount) {
            console.log("📝 Firmas digitales ya existentes: " + existingSignaturesCount.toLocaleString());

            let processed = 0;
            let created = 0;
            let skipped = 0;
            let errors = 0;
            const batchSize = 500;
            const startTime = new Date();

            console.log("\n⚙️  Configuración:");
            console.log("   📦 Tamaño de lote: " + batchSize);
            console.log("   🎯 Modo: Migración de Person a DigitalSignature");
            console.log("   🔧 Compatible: Node.js 10");
            console.log("\n🕐 Inicio: " + startTime);
            console.log("");

            const processBatch = function() {
              if (processed >= personsWithSignatureCount) {
                return finishProcess();
              }

              // Buscar lote de personas con firma digital
              Person.find(
                {
                  digital_signature: { $exists: true, $ne: null },
                },
                {
                  _id: 1,
                  digital_signature: 1,
                  name: 1,
                  lastname: 1,
                }
              )
                .skip(processed)
                .limit(batchSize)
                .lean()
                .then(function(persons) {
                  if (persons.length === 0) {
                    return finishProcess();
                  }

                  // Preparar operaciones bulk para insertar
                  const bulkOperations = [];
                  const personIds = persons.map(function(p) { return p._id; });

                  // Verificar cuáles ya existen
                  return DigitalSignature.find(
                    { person: { $in: personIds } },
                    { person: 1 }
                  ).lean()
                  .then(function(existingSignatures) {
                    const existingPersonIds = {};
                    for (let i = 0; i < existingSignatures.length; i++) {
                      existingPersonIds[existingSignatures[i].person.toString()] = true;
                    }

                    for (let i = 0; i < persons.length; i++) {
                      const person = persons[i];
                      if (existingPersonIds[person._id.toString()]) {
                        skipped++;
                      } else {
                        bulkOperations.push({
                          insertOne: {
                            document: {
                              digital_signature: person.digital_signature,
                              person: person._id,
                            },
                          },
                        });
                      }
                      processed++;
                    }

                    // Ejecutar operaciones bulk si hay datos para insertar
                    if (bulkOperations.length > 0) {
                      return DigitalSignature.bulkWrite(bulkOperations, {
                        ordered: false,
                      })
                      .then(function(result) {
                        created += result.insertedCount || 0;
                        return processNextBatch();
                      })
                      .catch(function(error) {
                        console.error("\n❌ Error en lote (skip: " + (processed - persons.length) + "):", error.message);
                        errors++;
                        return processNextBatch();
                      });
                    } else {
                      return processNextBatch();
                    }
                  });
                })
                .catch(function(error) {
                  console.error("\n❌ Error procesando lote:", error.message);
                  errors++;
                  return processNextBatch();
                });
            };

            const processNextBatch = function() {
              // Actualizar progreso cada lote
              if (processed > 0) {
                updateProgress(processed, personsWithSignatureCount, created, skipped, startTime);
              }

              // Logging detallado cada 10 lotes
              if (Math.floor(processed / batchSize) % 10 === 0) {
                console.log("");
                console.log("✓ Lote " + Math.floor(processed / batchSize) + " completado - " + batchSize + " personas procesadas");
              }

              // Continuar con el siguiente lote
              setTimeout(processBatch, 10); // Pequeña pausa para no saturar
            };

            const finishProcess = function() {
              // Mostrar progreso final
              updateProgress(processed, personsWithSignatureCount, created, skipped, startTime);
              console.log("");

              // Estadísticas finales
              const endTime = new Date();
              const duration = (endTime - startTime) / 1000;
              const durationMinutes = Math.round(duration / 60);
              const docsPerSecond = (processed / duration).toFixed(2);
              const successRate = processed > 0 ? ((created / processed) * 100).toFixed(2) : "0.00";

              console.log("\n🎉 === MIGRACIÓN COMPLETADA (Node.js 10) ===");
              console.log("🕐 Inicio: " + startTime);
              console.log("🕑 Fin: " + endTime);
              console.log("⏱️  Duración total: " + durationMinutes + " minutos (" + Math.round(duration) + " segundos)");
              console.log("⚡ Velocidad de procesamiento: " + docsPerSecond + " personas/segundo");
              
              console.log("\n📊 === ESTADÍSTICAS ===");
              console.log("📋 Total de personas procesadas: " + processed.toLocaleString());
              console.log("✅ Firmas digitales creadas: " + created.toLocaleString());
              console.log("⏭️  Firmas omitidas (ya existían): " + skipped.toLocaleString());
              console.log("❌ Errores: " + errors);
              console.log("🎯 Tasa de creación: " + successRate + "%");

              // Verificación final
              DigitalSignature.count({})
                .then(function(finalCount) {
                  console.log("\n🔍 === VERIFICACIÓN FINAL ===");
                  console.log("📝 Total de firmas digitales en colección: " + finalCount.toLocaleString());
                  console.log("📈 Incremento: +" + created.toLocaleString() + " firmas");
                  
                  console.log("\n✅ Migración completada exitosamente");

                  return mongoose.connection.close();
                })
                .then(function() {
                  console.log("🔌 Conexión cerrada");
                  resolve();
                })
                .catch(function(error) {
                  console.error("Error cerrando conexión:", error);
                  resolve();
                });
            };

            // Iniciar procesamiento
            processBatch();
          });
      })
      .catch(function(error) {
        console.error("❌ Error en la migración:", error);
        reject(error);
      });
  });
};

// Función para verificar duplicados y limpiar si es necesario
const verifyAndCleanDuplicates = function() {
  return new Promise(function(resolve, reject) {
    console.log("🔍 Verificando duplicados (Node.js 10)...");
    
    const compatibleOptions = Object.assign({}, dbConfig.options, {
      useNewUrlParser: false,
      useUnifiedTopology: false
    });
    
    mongoose.connect(dbConfig.url, compatibleOptions)
      .then(function() {
        // Buscar duplicados usando aggregation
        return DigitalSignature.aggregate([
          {
            $group: {
              _id: "$person",
              count: { $sum: 1 },
              docs: { $push: "$_id" }
            }
          },
          {
            $match: {
              count: { $gt: 1 }
            }
          }
        ]);
      })
      .then(function(duplicates) {
        if (duplicates.length === 0) {
          console.log("✅ No se encontraron duplicados");
          return mongoose.connection.close().then(function() {
            resolve();
          });
        }

        console.log("⚠️  Se encontraron " + duplicates.length + " personas con firmas duplicadas");
        
        // Eliminar duplicados (mantener solo el primero)
        let deletedCount = 0;
        let processedDuplicates = 0;

        const processDuplicate = function() {
          if (processedDuplicates >= duplicates.length) {
            console.log("🧹 Eliminados " + deletedCount + " duplicados");
            return mongoose.connection.close().then(function() {
              resolve();
            });
          }

          const duplicate = duplicates[processedDuplicates];
          const docsToDelete = duplicate.docs.slice(1); // Mantener el primero
          
          DigitalSignature.deleteMany({ _id: { $in: docsToDelete } })
            .then(function(result) {
              deletedCount += result.deletedCount || 0;
              processedDuplicates++;
              processDuplicate();
            })
            .catch(function(error) {
              console.error("Error eliminando duplicado:", error);
              processedDuplicates++;
              processDuplicate();
            });
        };

        processDuplicate();
      })
      .catch(function(error) {
        console.error("❌ Error al verificar duplicados:", error);
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

// Ejecutar script
const main = function() {
  const args = process.argv.slice(2);
  
  if (args.indexOf('--clean-duplicates') !== -1) {
    return verifyAndCleanDuplicates();
  } else {
    return populateDigitalSignatures();
  }
};

main()
  .then(function() {
    console.log("🏁 Script terminado (Node.js 10)");
    process.exit(0);
  })
  .catch(function(error) {
    console.error("❌", error);
    process.exit(1);
  });
