/*Script multiproceso compatible con Node.js 10
Utiliza child_process para procesar múltiples lotes en paralelo*/

const { spawn } = require("child_process");
const mongoose = require("mongoose");
const Consulta = require("../model/database_schemas").Consultation;
const dbConfig = require("../config/db_config");
const os = require("os");
const path = require("path");

// Función para crear barra de progreso visual
const createProgressBar = function (current, total, barLength) {
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
const updateProgress = function (
  current,
  total,
  updated,
  skipped,
  startTime,
  activeWorkers
) {
  const percentage = ((current / total) * 100).toFixed(1);
  const progressBar = createProgressBar(current, total);
  const elapsedSeconds = (new Date() - startTime) / 1000;
  const avgTimePerDoc = elapsedSeconds / current;
  const remainingDocs = total - current;
  const estimatedRemainingSeconds = remainingDocs * avgTimePerDoc;
  const estimatedRemainingMinutes = Math.round(estimatedRemainingSeconds / 60);
  const docsPerSecond = (current / elapsedSeconds).toFixed(1);

  process.stdout.write(
    "\r" +
      progressBar +
      " " +
      current.toLocaleString() +
      "/" +
      total.toLocaleString() +
      " " +
      "(" +
      percentage +
      "%) | Actualizadas: " +
      updated.toLocaleString() +
      " | " +
      "Omitidas: " +
      skipped.toLocaleString() +
      " | " +
      docsPerSecond +
      "/s | " +
      "ETA: " +
      estimatedRemainingMinutes +
      "min | Workers: " +
      activeWorkers
  );
};

const updateConsultationsMultiprocess = function () {
  return new Promise(function (resolve, reject) {
    mongoose
      .connect(dbConfig.url, dbConfig.options)
      .then(function () {
        return Consulta.count({
          file: { $exists: false },
        });
      })
      .then(function (consultationsCount) {
        console.log(
          "Total de consultas a procesar: " +
            consultationsCount.toLocaleString()
        );

        if (consultationsCount === 0) {
          console.log("No hay consultas para procesar");
          return resolve();
        }

        // Configuración de multiproceso para PRODUCCIÓN (Node.js 10)
        const numCPUs = os.cpus().length;
        // Para producción: usar máximo 25% de los CPUs disponibles, mínimo 1, máximo 2
        const maxWorkers = Math.max(1, Math.min(Math.floor(numCPUs * 0.4), 3));
        const batchSize = 1000; // Lotes más pequeños para Node.js 10
        const totalBatches = Math.ceil(consultationsCount / batchSize);

        // Delay entre lotes para no saturar la base de datos
        const delayBetweenBatches = 100; // 200ms de pausa entre lotes

        console.log("Configuración multiproceso (Node.js 10 Compatible):");
        console.log("- CPUs disponibles: " + numCPUs);
        console.log("- Workers a usar: " + maxWorkers + " (40% de CPUs)");
        console.log("- Tamaño de lote: " + batchSize);
        console.log("- Total de lotes: " + totalBatches);
        console.log("- Delay entre lotes: " + delayBetweenBatches + "ms");
        console.log("- Modo: CONSERVADOR para producción");
        console.log("");

        let processed = 0;
        let updated = 0;
        let skipped = 0;
        let currentBatch = 0;
        let activeWorkers = 0;
        let completedBatches = 0;

        const dateFrom = new Date();
        console.log("Inicio: " + dateFrom);

        const processNextBatch = function () {
          // Procesar workers de forma conservadora
          if (activeWorkers < maxWorkers && currentBatch < totalBatches) {
            // Añadir delay entre lotes para no saturar la DB
            setTimeout(function () {
              const skip = currentBatch * batchSize;

              // Crear proceso hijo para procesar el lote
              const childProcess = spawn(
                "node",
                [
                  path.join(__dirname, "actualizar_consultas_child.js"),
                  skip.toString(),
                  batchSize.toString(),
                ],
                {
                  stdio: ["pipe", "pipe", "pipe", "ipc"],
                }
              );

              activeWorkers++;
              currentBatch++;

              let childOutput = "";
              let childError = "";

              // Capturar salida del proceso hijo
              childProcess.stdout.on("data", function (data) {
                childOutput += data.toString();
              });

              childProcess.stderr.on("data", function (data) {
                childError += data.toString();
              });

              // Manejar mensajes del proceso hijo
              childProcess.on("message", function (message) {
                activeWorkers--;
                completedBatches++;

                if (message.success) {
                  const result = message.result;
                  processed += result.processed;
                  updated += result.updated;
                  skipped += result.skipped;

                  // Actualizar progreso cada lote completado
                  if (processed > 0) {
                    updateProgress(
                      processed,
                      consultationsCount,
                      updated,
                      skipped,
                      dateFrom,
                      activeWorkers
                    );
                  }

                  // Logging detallado cada 10 lotes
                  if (completedBatches % 10 === 0) {
                    console.log("");
                    console.log(
                      "✓ Lote " +
                        completedBatches +
                        " completado - " +
                        result.processed +
                        " consultas procesadas"
                    );
                  }
                } else {
                  console.error("\nError en proceso hijo: " + message.error);
                }

                // Procesar siguiente lote o finalizar
                if (currentBatch < totalBatches) {
                  processNextBatch();
                } else if (activeWorkers === 0) {
                  // Todos los workers terminaron
                  finishProcess();
                }
              });

              // Manejar errores del proceso hijo
              childProcess.on("error", function (error) {
                activeWorkers--;
                console.error("\nError en proceso hijo:", error.message);

                if (currentBatch < totalBatches) {
                  processNextBatch();
                } else if (activeWorkers === 0) {
                  finishProcess();
                }
              });

              // Manejar cierre del proceso hijo
              childProcess.on("close", function (code) {
                if (code !== 0 && !childError.includes("success")) {
                  console.error("\nProceso hijo terminó con código:", code);
                  if (childError) {
                    console.error("Error:", childError);
                  }
                }
              });
            }, delayBetweenBatches);
          }
        };

        const finishProcess = function () {
          // Mostrar progreso final
          updateProgress(
            processed,
            consultationsCount,
            updated,
            skipped,
            dateFrom,
            0
          );
          console.log("");

          // Estadísticas finales
          const dateTo = new Date();
          const duration = (dateTo - dateFrom) / 1000;
          const durationMinutes = Math.round(duration / 60);
          const docsPerSecond = (processed / duration).toFixed(2);
          const successRate =
            processed > 0 ? ((updated / processed) * 100).toFixed(2) : "0.00";

          console.log("\n=== PROCESO MULTIPROCESO COMPLETADO (Node.js 10) ===");
          console.log("Inicio: " + dateFrom);
          console.log("Fin: " + dateTo);
          console.log(
            "Duración total: " +
              durationMinutes +
              " minutos (" +
              Math.round(duration) +
              " segundos)"
          );
          console.log(
            "Velocidad de procesamiento: " +
              docsPerSecond +
              " consultas/segundo"
          );
          console.log("Workers utilizados: " + maxWorkers);
          console.log("\n=== ESTADÍSTICAS ===");
          console.log(
            "Total de consultas procesadas: " + processed.toLocaleString()
          );
          console.log(
            "Consultas actualizadas: " +
              updated.toLocaleString() +
              " (" +
              successRate +
              "%)"
          );
          console.log(
            "Consultas omitidas (sin firma): " + skipped.toLocaleString()
          );
          console.log("Tasa de éxito: " + successRate + "%");
          console.log("\n✓ Proceso completado exitosamente");

          mongoose.connection
            .close()
            .then(function () {
              resolve();
            })
            .catch(function (error) {
              console.error("Error cerrando conexión:", error);
              resolve();
            });
        };

        // Iniciar procesamiento
        processNextBatch();
      })
      .catch(function (error) {
        console.error("Error en el proceso principal:", error);
        reject(error);
      });
  });
};

updateConsultationsMultiprocess()
  .then(function () {
    console.log("Proceso multiproceso terminado");
    process.exit(0);
  })
  .catch(function (error) {
    console.error(error);
    process.exit(1);
  });
