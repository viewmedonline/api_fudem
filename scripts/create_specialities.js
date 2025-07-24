//script para cargar la coleccion de especialidades con especialidades oftalmologicas
const mongoose = require("mongoose");
/**
 * Retina y Vítreo: Retinólogo

Glaucoma: Glaucomatólogo (aunque a menudo se les llama "especialistas en glaucoma" o simplemente "oftalmólogos especializados en glaucoma")

Oftalmología Pediátrica y Estrabismo: Oftalmólogo Pediatra o Estrabólogo

Córnea y Enfermedades Externas: Especialista en Córnea o Corneólogo

Cirugía Refractiva: Cirujano Refractivo

Oculoplastia y Cirugía Reconstructiva: Oculoplástico

Neuro-Oftalmología: Neuro-Oftalmólogo

Uveítis y Enfermedades Inflamatorias Oculares: Especialista en Uveítis

Oncología Ocular: Oncólogo Ocular

Baja Visión: Especialista en Baja Visión
 */

const dbConfig = require("../config/db_config");
const specialtySchema = require("../model/database_schemas").Specialty;

async function main() {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options);
    const specialities = [
      { name: "Retinólogo" },
      { name: "Glaucomatólogo" },
      { name: "Oftalmólogo Pediatra o Estrabólogo" },
      { name: "Especialista en Córnea o Corneólogo" },
      { name: "Cirujano Refractivo" },
      { name: "Oculoplástico" },
      { name: "Neuro-Oftalmólogo" },
      { name: "Especialista en Uveítis" },
      { name: "Oncólogo Ocular" },
      { name: "Especialista en Baja Visión" },
    ];
    await specialtySchema.insertMany(specialities);
  } catch (error) {
    console.log(error);
  }
}
main()
  .then(() => {
    console.log("Terminado");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
