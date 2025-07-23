const mongoose = require("mongoose");
const DigitalSignature = require("../model/database_schemas").DigitalSignature;
const personSchema = require("../model/database_schemas").Person;
const dbConfig = require("../config/db_config");
async function main() {
    try {
        await mongoose.connect(dbConfig.url, dbConfig.options);
        const persons = await personSchema.find({digital_signature:{$exists: true}});
        for (const person of persons) {
            //validar si existe ya la firma agregada
            const digitalSignature = await DigitalSignature.findOne({person: person._id,digital_signature: person.digital_signature});
            if (!digitalSignature) {
                const digitalSignature = new DigitalSignature({
                    person: person._id,
                    digital_signature: person.digital_signature,
                });
                await digitalSignature.save();
            }
        }
    } catch (error) {
        console.log(error);
    }
}
main().then(() => {
    console.log("Terminado");
    process.exit(0);
}).catch((error) => {
    console.log(error);
    process.exit(1);
});
    
