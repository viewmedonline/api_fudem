/*
 * Script para limpiar el campo temporal _skip_signature de constancias
 * Compatible con Node.js 10
 */

const mongoose = require("mongoose");
const Constancy = require("../model/database_schemas").Constancy;
const dbConfig = require("../config/db_config");

const cleanSkipSignatureField = function () {
  return new Promise(function (resolve, reject) {
    console.log("🧹 Limpiando campo temporal _skip_signature de constancias...");

    mongoose.connect(dbConfig.url, dbConfig.options)
      .then(function () {
        return Constancy.updateMany(
          { _skip_signature: { $exists: true } },
          { $unset: { _skip_signature: "" } }
        );
      })
      .then(function (result) {
        console.log("✅ Campo _skip_signature eliminado de " + result.modifiedCount + " constancias");
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
    console.log("✅ Limpieza de constancias completada");
    process.exit(0);
  })
  .catch(function (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  });
