/*
 * Script para limpiar el campo temporal _skip_signature de prescripciones
 * Compatible con Node.js 10
 */

const mongoose = require("mongoose");
const Prescription = require("../model/database_schemas").Prescription;
const dbConfig = require("../config/db_config");

const cleanSkipSignatureField = function () {
  return new Promise(function (resolve, reject) {
    console.log("🧹 Limpiando campo temporal _skip_signature...");

    mongoose.connect(dbConfig.url, dbConfig.options)
      .then(function () {
        return Prescription.updateMany(
          { _skip_signature: { $exists: true } },
          { $unset: { _skip_signature: "" } }
        );
      })
      .then(function (result) {
        console.log("✅ Campo _skip_signature eliminado de " + result.modifiedCount + " prescripciones");
        return mongoose.connection.close();
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

cleanSkipSignatureField()
  .then(function () {
    console.log("✅ Limpieza completada");
    process.exit(0);
  })
  .catch(function (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  });
