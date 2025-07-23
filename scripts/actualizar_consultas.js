/*este script actualiza las consultas para añadir a partir de ahora el campo 
digital_signature para que no solo haga referencia al usuario sino que guarde lafirma usada para generar dicha historia
esto evita que asignar nuevas firmas a un usuario afecto otros registros*/
const mongoose = require("mongoose");
const Consulta = require("../model/database_schemas").Consultation;
const Person = require("../model/database_schemas").Person;

const dbConfig = require("../config/db_config");

const updateConsultations = async () => {
    try {
        await mongoose.connect(dbConfig.url, dbConfig.options);
        const consultationsCount = await Consulta.find({digital_signature:{$exists:false}}).count();

        let limit = 100;
        let skip = 0;
        let processed = 0;
        
        //datetime inicio
        let dateFrom = new Date();
        console.log("Inicio: " + dateFrom);
        console.log("Total de consultas a procesar: " + consultationsCount);

        while (processed < consultationsCount) {
            const consultations = await Consulta.find({digital_signature:{$exists:false}}).limit(limit).skip(skip);
            
            if (consultations.length === 0) {
                console.log("No hay más consultas para procesar");
                break;
            }
            
            for (const consultation of consultations) {
                const person = await Person.findById(consultation.person);
                if (person && person.digital_signature) {
                    consultation.digital_signature = person.digital_signature;
                    await consultation.save();
                    processed++;
                    
                    if (processed % 100 === 0) {
                        console.log(`Consultas procesadas: ${processed}/${consultationsCount}`);
                    }
                } else {
                    processed++;
                    console.log(`Consulta ${consultation._id} - Persona sin firma digital`);
                }
            }
            
            skip += limit;
        }
        //datetime fin
        let dateTo = new Date();
        let duration = (dateTo - dateFrom) / 1000; // duración en segundos
        
        console.log("Fin: " + dateTo);
        console.log(`Proceso completado en ${duration} segundos`);
        console.log(`Total de consultas procesadas: ${processed}`);
        console.log(`Consultas actualizadas exitosamente`);
    } catch (error) {
        console.error(error);
    }
};

updateConsultations().then(() => {
    console.log("Consultas actualizadas");
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
    
