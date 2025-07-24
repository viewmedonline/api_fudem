const mongoose = require("mongoose");
const personSchema = require("../model/database_schemas").Person;
const dbConfig = require("../config/db_config");
async function main() {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options);
    const personsCount = await personSchema
      .find({ search_name: { $exists: false } })
      .count();
    console.log("Total de personas a procesar: " + personsCount);

    if (personsCount === 0) {
      console.log("No hay personas para procesar");
      return;
    }

    let limit = 100;
    let processed = 0;

    while (true) {
      // Siempre buscar desde el inicio ya que los documentos se van actualizando
      const persons = await personSchema
        .find({ search_name: { $exists: false } })
        .limit(limit);

      // Si no hay más documentos que procesar, salir del bucle
      if (persons.length === 0) {
        console.log("No hay más documentos para procesar");
        break;
      }

      for (const person of persons) {
        try {
          person.search_name =
            person.forename.toLowerCase() + " " + person.surname.toLowerCase();
          await person.save();
          processed++;

          if (processed % 100 === 0) {
            console.log(`Personas procesadas: ${processed}`);
          }
        } catch (saveError) {
          console.error(`Error procesando persona ${person._id}:`, saveError);
        }
      }

      console.log(`Lote completado. Total procesadas: ${processed}`);
    }

    console.log(`Terminado. Total de personas procesadas: ${processed}`);
  } catch (error) {
    console.error("Error en el proceso principal:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
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
