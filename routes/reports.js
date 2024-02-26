let express = require("express");
const { stringify } = require("csv-stringify");
let router = express.Router();
const fs = require("fs");
let model = require("../model/database_schemas.js");
let moment = require("moment");

const searchNameDoctor = async (id) => {
  try {
    let doctor = await model.Person.findById(id, "forename surname");
    return doctor;
  } catch (error) {
    console.log("Ha ocurrido un error en la busqueda del doctor: " + error);
  }
};

router.get("/report/:dateFrom/:dateTo/:ext", async (request, response) => {
  let datos = [
    [
      "Fecha_Consulta",
      "Consulta Por",
      "Nombres de Paciente",
      "Apellidos de Paciente",
      "Genero",
      "Fecha de Nacimiento",
      "ID QFlow",
      "Nombres de Medico",
      "Apellidos de Medico",
      "Rol Medico",
      "Sucursal",
      "Motivo",
      "Diagnostico",
      "Procedimientos",
      "Procedimientos Terapeuticos",
      "Medicamentos",
      "Camara de Retina",
      "Hallazgos",
      "Observaciones",
      "Dio Receta",
    ],
  ];
  let responseArray = [];
  try {
    const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY")
      .utc()
      .startOf("day")
      .format();
    const dateTo = moment(request.params.dateTo, "DD-MM-YYYY")
      .utc()
      .endOf("day")
      .format();
    let results = await model.Consultation.find({
      "control.active": false,
      file: { $exists: false },
      "control.created_at": {
        $gte: dateFrom,
        $lte: dateTo,
      },
    })
      .sort({ "control.created_at": -1 })
      .populate("person");

    for (const x of results) {
      try {
        let dateConsult = x.objPreliminary.data
          ? x.objPreliminary.control.created_at
          : x.objOphthalmology.data
          ? x.objOphthalmology.control.created_at
          : x.objOptometrist.control.created_at;

        let obj = {
          dateConsult: moment(dateConsult).format("DD-MM-YYYY"),
          namePatient: x.person.forename,
          lastNamePatient: x.person.surname,
          gender: x.person.gender,
          birthDate: moment(x.person.birthdate).format("DD-MM-YYYY"),
          idQflow: x.person.idQflow,
          sucursal: (await model.branchOffice.findById(x.sucursalId, "Name"))
            .Name,
          reasonConsultation:
            (x.objPreliminary.data
              ? x.objPreliminary.data.reasonConsultation
              : x.objOphthalmology.data
              ? x.objOphthalmology.data.reasonConsultation
              : x.objOptometrist.data.reasonConsultation) || "-",
        };

        if (x.objPreliminary.data) {
          let objPreliminary = { ...obj };
          (objPreliminary.retinalCamera = x.objPreliminary.data
            ? x.objPreliminary.data.retinal_photo
            : "No"),
            (objPreliminary.retinal_findings = x.objPreliminary.data
              ? x.objPreliminary.data.retinal_findings || "-"
              : "-"),
            (objPreliminary.retinal_observations = x.objPreliminary.data
              ? x.objPreliminary.data.retinal_observations || "-"
              : "-"),
            (objPreliminary.role = "Preliminar");
          objPreliminary.nameDoctor =
            x.objPreliminary.data.responsablePreliminar;
          objPreliminary.lastNameDoctor = "-";
          objPreliminary.diagnostic = "-";
          objPreliminary.consultationFor = "Preliminar";
          responseArray.push(objPreliminary);
        }

        if (x.objOphthalmology.data) {
          let objOfta = { ...obj };
          objOfta.role = "Oftalmólogo";
          objOfta.diagnostic =
            x.objOphthalmology.data.diagnostic
              .map((x) => {
                return x.diagnostic.es;
              })
              .join(", ") || "-";
          let nameOfta = await searchNameDoctor(
            x.objOphthalmology.data.responsableConsultation
          );
          objOfta.nameDoctor = nameOfta.forename;
          objOfta.lastNameDoctor = nameOfta.surname;
          objOfta.medicines =
            x.objOphthalmology.data.observaciones.medicamentos.join(", ") ||
            "-";
          (objOfta.procedures =
            x.process
              .map((x) => {
                return x.process + " - Ojo:" + x.eye;
              })
              .join(", ") || "-"),
            (objOfta.proceduresTherapeutic =
              x.processTherapeutic
                .map((x) => {
                  return x.process + " - Ojo:" + x.eye;
                })
                .join(", ") || "-");
          objOfta.consultationFor = "Oftalmología";

          responseArray.push(objOfta);
        }

        if (x.objOptometrist.data) {
          let objOpto = { ...obj };
          const diagnosesOpto = {
            hyperopia: "Hipermetropía",
            myopia: "Miopía",
            astigmatism: "Astigmatismo",
            presbyopia: "Presbicia",
            emmetropia: "Emetropia",
            amblyopia: "Ambliopia",
            anisometropia: "Anisometropia",
            squint: "Estrabismo",
          };

          objOpto.role = "Optometrista";
          objOpto.diagnostic =
            x.objOptometrist.data.diagnosticoObservaciones.diagnostico
              .map((x) => {
                if (!x.eyeRight && !x.eyeLeft) return null;
                const eyes =
                  x.eyeRight && x.eyeLeft ? "Ambos" : x.eyeRight ? "OD" : "OI";
                return `${diagnosesOpto[x.name]} - ${eyes} `;
              })
              .filter((x) => x)
              .join(", ") || "-";
          let nameOpto = await searchNameDoctor(
            x.objOptometrist.data.responsableConsultation
          );
          objOpto.nameDoctor = nameOpto.forename;
          objOpto.lastNameDoctor = nameOpto.surname;
          objOpto.gavePrescription = x.objOptometrist.data.receta;
          objOpto.consultationFor = "Optometría";
          responseArray.push(objOpto);
        }
      } catch (error) {
        console.log("Ha ocurrido un error el for: " + error);
      }
    }
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la busqueda de las consultas: " + error
    );
  }

  if (request.params.ext === "csv") {
    responseArray.forEach((x) => {
      datos.push([
        x.dateConsult,
        x.consultationFor,
        x.namePatient,
        x.lastNamePatient,
        x.gender,
        x.birthDate,
        x.idQflow,
        x.nameDoctor,
        x.lastNameDoctor,
        x.role,
        x.sucursal,
        x.reasonConsultation,
        x.diagnostic,
        x.procedures,
        x.proceduresTherapeutic,
        x.medicines,
        x.retinalCamera,
        x.retinal_findings,
        x.retinal_observations,
        x.gavePrescription,
      ]);
    });
    stringify(datos, (err, output) => {
      if (err) {
        response.status(500).send("Error al generar CSV");
        return;
      }

      response.setHeader("Content-Type", "text/csv");
      response.setHeader(
        "Content-Disposition",
        "attachment; filename=datos.csv"
      );
      response.send(output);
    });
  }
  if (request.params.ext === "json") {
    response.json(responseArray);
  }
});

module.exports = router;
