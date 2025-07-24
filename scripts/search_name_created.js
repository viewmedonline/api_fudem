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
    let limit = 100;
    let skip = 0;
    let processed = 0;
    while (processed < personsCount) {
      const persons = await personSchema
        .find({ search_name: { $exists: false } })
        .limit(limit)
        .skip(skip);
      for (const person of persons) {
        person.search_name =
          person.forename.toLowerCase() + " " + person.surname.toLowerCase();
        await person.save();
        processed++;
        if (processed % 100 === 0) {
          console.log(`Personas procesadas: ${processed}/${personsCount}`);
        }
      }
      skip += limit;
    }
    console.log("Terminado");
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
