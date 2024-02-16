let express = require("express");
const { stringify } = require("csv-stringify");
let router = express.Router();
const fs = require("fs");
let model = require("../model/database_schemas.js");
let moment = require("moment");

const searchNameDoctor = async (id) => {
  let doctor = await model.Person.findById(id, "forename surname");
  return doctor;
};

router.get("/report/:dateFrom/:dateTo/:ext", async (request, response) => {
  let datos = [
    [
      "Fecha_Consulta",
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
  const dateFrom = moment.utc(request.params.dateFrom).startOf("day").format();
  const dateTo = moment.utc(request.params.dateTo).endOf("day").format();
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

  let responseArray = [];
  for (const x of results) {
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
      sucursal: (await model.branchOffice.findById(x.sucursalId, "Name")).Name,
      reasonConsultation:
        (x.objPreliminary.data
          ? x.objPreliminary.data.reasonConsultation
          : x.objOphthalmology.data
          ? x.objOphthalmology.data.reasonConsultation
          : x.objOptometrist.data.reasonConsultation) || "",
      procedures:
        x.process
          .map((x) => {
            return x.process + " - Ojo:" + x.eye;
          })
          .join(", ") || "",
      proceduresTherapeutic:
        x.processTherapeutic
          .map((x) => {
            return x.process + " - Ojo:" + x.eye;
          })
          .join(", ") || "",
      retinalCamera: x.objPreliminary.data
        ? x.objPreliminary.data.retinal_photo
        : "No",
      retinal_findings: x.objPreliminary.data
        ? x.objPreliminary.data.retinal_findings || ""
        : "",
      retinal_observations: x.objPreliminary.data
        ? x.objPreliminary.data.retinal_observations || ""
        : "",
    };

    if (x.objOphthalmology.data) {
      obj.role = "Oftalmólogo";
      obj.diagnostic =
        x.objOphthalmology.data.diagnostic
          .map((x) => {
            return x.diagnostic.es;
          })
          .join(", ") || "";
      let nameOfta = await searchNameDoctor(
        x.objOphthalmology.data.responsableConsultation
      );
      obj.nameDoctor = nameOfta.forename;
      obj.lastNameDoctor = nameOfta.surname;
      obj.medicines =
        x.objOphthalmology.data.observaciones.medicamentos.join(", ") || "";
      responseArray.push(obj);
    }

    if (x.objOptometrist.data) {
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

      obj.role = "Optometrista";
      obj.diagnostic =
        x.objOptometrist.data.diagnosticoObservaciones.diagnostico
          .map((x) => {
            if (!x.eyeRight && !x.eyeLeft) return null;
            const eyes =
              x.eyeRight && x.eyeLeft ? "Ambos" : x.eyeRight ? "OD" : "OI";
            return `${diagnosesOpto[x.name]} - ${eyes} `;
          })
          .filter((x) => x)
          .join(", ") || "";
      let nameOpto = await searchNameDoctor(
        x.objOptometrist.data.responsableConsultation
      );
      obj.nameDoctor = nameOpto.forename;
      obj.lastNameDoctor = nameOpto.surname;
      obj.gavePrescription = x.objOptometrist.data.receta;
      responseArray.push(obj);
    }
  }

  if (request.params.ext === "csv") {
    responseArray.forEach((x) => {
      datos.push([
        x.dateConsult,
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
