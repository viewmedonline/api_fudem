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

router.get("/report/ophthalmologist/:dateFrom/:dateTo/:ext", async (request, response) => {
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
  const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY")
    .utc()
    .startOf("day")
    .format();
  const dateTo = moment(request.params.dateTo, "DD-MM-YYYY")
    .utc()
    .endOf("day")
    .format();
  let results = [];
  try {
    results = await model.Consultation.find({
      "control.active": false,
      file: { $exists: false },
      "control.created_at": {
        $gte: dateFrom,
        $lte: dateTo,
      },
    })
      .sort({ "control.created_at": -1 })
      .populate("person");
  } catch (error) {
    console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
  }

  let responseArray = [];
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
        objPreliminary.nameDoctor = x.objPreliminary.data.responsablePreliminar;
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
          x.objOphthalmology.data.observaciones.medicamentos.join(", ") || "-";
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


router.get("/report/internist/:dateFrom/:dateTo/:ext", async (request, response) => {
  let datos = [
    [
      "fecha de consulta",
      "Nombres de Paciente",
      "Apellidos de Paciente",
      "Fecha de Nacimiento",
      "Genero",
      "ID QFlow",
      "Nombres de Medico",
      "Apellidos de Medico",
      "Diagnostico Preoperatorio",
      "Historio clinica",
      "Antecedentes personales",
      "pa",
      "fc",
      "fr",
      "sato2",
      "Estado Fisico",
      "ht",
      "hb",
      "plaquetas",
      "tp",
      "tpt",
      "inr",
      "glucosa",
      "elisa/vih",
      "ego",
      "hba1c",
      "ecg",
      "rx torax",
      "comentarios",
      "riesgo quirurgico",
      "capacidad funcional",
      "predictores clinicos",
      "clasificacion asa",
      "plan"
    ],
  ];
  const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY")
    .format("DD/MM/YYYY");
  const dateTo = moment(request.params.dateTo, "DD-MM-YYYY")
    .format("DD/MM/YYYY");
  let results = [];
  try {
    results = await model.InternEvaluation.find({
      "date": {
        $gte: dateFrom,
        $lte: dateTo,
      },
    })
      .sort({ "date": -1 })
      .populate("person")
      .populate("responsible");
  } catch (error) {
    console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
  }

  let responseArray = [];
  for (const x of results) {
    let obj = {
      dateConsult: x.date,
      namePatient: x.person.forename,
      lastNamePatient: x.person.surname,
      birthDate: moment(x.person.birthdate).format("DD/MM/YYYY"),
      gender: x.person.gender,
      idQflow: x.person.idQflow,
      nameDoctor: x.responsible.forename,
      lastNameDoctor: x.responsible.surname,
      preoperative_diagnosis :x.preoperative_diagnosis,
      history_clinic :x.history_clinic,
      personal_record :x.personal_record,
      pa :x.pa,
      fc :x.fc,
      fr :x.fr,
      oxygen_saturation :x.oxygen_saturation,
      physical_state :x.physical_state,
      ht :x.ht,
      hb :x.hb,
      platelets :x.platelets,
      tp :x.tp,
      tpt :x.tpt,
      inr :x.inr,
      glucose :x.glucose,
      vih :x.vih,
      ego :x.ego,
      hba1c :x.hba1c,
      radiography :x.radiography,
      electrocardiogram :x.electrocardiogram,
      comments :x.comments,
      surgical_risk :x.surgical_risk,
      functional_capacity :x.functional_capacity,
      clinical_predictors :x.clinical_predictors,
      clasification_asa :x.clasification_asa,
      plan :x.plan
    }
    responseArray.push(obj);
  }

  if (request.params.ext === "csv") {
    responseArray.forEach((x) => {
      datos.push([
        x.dateConsult,
        x.namePatient,
        x.lastNamePatient,
        x.birthDate,
        x.gender,
        x.idQflow,
        x.nameDoctor,
        x.lastNameDoctor,
        x.preoperative_diagnosis ,
        x.history_clinic ,
        x.personal_record ,
        x.pa ,
        x.fc ,
        x.fr ,
        x.oxygen_saturation ,
        x.physical_state ,
        x.ht ,
        x.hb ,
        x.platelets ,
        x.tp ,
        x.tpt ,
        x.inr ,
        x.glucose ,
        x.vih ,
        x.ego ,
        x.hba1c ,
        x.electrocardiogram ,
        x.radiography ,
        x.comments ,
        x.surgical_risk ,
        x.functional_capacity ,
        x.clinical_predictors ,
        x.clasification_asa ,
        x.plan ,
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

router.get("/report/pediatrist/:dateFrom/:dateTo/:ext", async (request, response) => {
  let datos = [
    [
      "fecha de consulta",
      "Nombres de Paciente",
      "Apellidos de Paciente",
      "Fecha de Nacimiento",
      "Genero",
      "ID QFlow",
      "Nombres de Medico",
      "Apellidos de Medico",
      "Diagnostico Preoperatorio",
      "estado",
      "Historio clinica",
      "Antecedentes no patologicos",
      "Antecedentes no patologicos",
      "Vacunacion",
      "pa",
      "fc",
      "fr",
      "sato2",
      "T°",
      "talla",
      "peso",
      "Estado Fisico",
      "ht",
      "hb",
      "plaquetas",
      "tp",
      "tpt",
      "inr",
      "glucosa",
      "elisa/vih",
      "ego",
      "ecg",
      "rx torax",
      "comentarios",
      "riesgo quirurgico",
      "capacidad funcional",
      "predictores clinicos",
      "clasificacion asa",
      "plan"
    ],
  ];
  const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY")
    .format("YYYY-MM-DD 00:00:00");
  const dateTo = moment(request.params.dateTo, "DD-MM-YYYY")
    .format("YYYY-MM-DD 23:59:59");
  let results = [];
  try {
    results = await model.PediatricEvaluation.find({
      "date": {
        $gte: dateFrom,
        $lte: dateTo,
      },
    })
      .sort({ "date": -1 })
      .populate("patient")
      .populate("responsible");
  } catch (error) {
    console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
  }

  let responseArray = [];
  for (const x of results) {
    let obj = {
      dateConsult:  moment(x.date).format("DD/MM/YYYY"),
      namePatient: x.patient.forename,
      lastNamePatient: x.patient.surname,
      birthDate: moment(x.patient.birthdate).format("DD/MM/YYYY"),
      gender: x.patient.gender,
      idQflow: x.patient.idQflow,
      nameDoctor: x.responsible.forename,
      lastNameDoctor: x.responsible.surname,
      diagnosisPre:x.diagnosisPre ,
      stateDiagnosis:x.stateDiagnosis ,
      clinicObservation:x.clinicObservation ,
      recordNP:x.recordNP ,
      recordP:x.recordP ,
      vaccination:x.vaccination ,
      blood_pressure:x.blood_pressure ,
      heart_rate:x.heart_rate ,
      respiratory_rate:x.respiratory_rate ,
      oxygen_saturation:x.oxygen_saturation ,
      temp:x.temp ,
      weight:x.weight ,
      size:x.size ,
      physicalExam:x.physicalExam ,
      ht:x.ht ,
      hb:x.hb ,
      platelets:x.platelets ,
      tp:x.tp ,
      tpt:x.tpt ,
      inr:x.inr ,
      glucose:x.glucose ,
      vih:x.vih ,
      ego:x.ego ,
      radiography:x.radiography ,
      electrocardiogram:x.electrocardiogram ,
      comments:x.comments ,
      surgical_risk:x.surgical_risk ,
      functional_capacity:x.functional_capacity ,
      clinical_predictors:x.clinical_predictors ,
      clasification_asa:x.clasification_asa ,
      plan:x.plan ,
    }
    responseArray.push(obj);
  }

  if (request.params.ext === "csv") {
    responseArray.forEach((x) => {
      datos.push([
        x.dateConsult,
        x.namePatient,
        x.lastNamePatient,
        x.birthDate,
        x.gender,
        x.idQflow,
        x.nameDoctor,
        x.lastNameDoctor,
        x.diagnosisPre,
        x.stateDiagnosis,
        x.clinicObservation,
        x.recordNP,
        x.recordP,
        x.vaccination,
        x.blood_pressure,
        x.heart_rate,
        x.respiratory_rate,
        x.oxygen_saturation,
        x.temp,
        x.size,
        x.weight,
        x.physicalExam,
        x.ht,
        x.hb,
        x.platelets,
        x.tp,
        x.tpt,
        x.inr,
        x.glucose,
        x.vih,
        x.ego,
        x.electrocardiogram,
        x.radiography,
        x.comments,
        x.surgical_risk,
        x.functional_capacity,
        x.clinical_predictors,
        x.clasification_asa,
        x.plan,
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

router.get("/report/nutritionist/:dateFrom/:dateTo/:ext", async (request, response) => {
  let datos = [
    [
      "fecha de consulta",
      "Nombres de Paciente",
      "Apellidos de Paciente",
      "Fecha de Nacimiento",
      "Genero",
      "ID QFlow",
      "Nombres de Medico",
      "Apellidos de Medico",
      "Diagnostico de referencia",
      "Historio clinica",
      "Colitis",
      "Gastritis",
      "Estreñimiento",
      "Diarrea",
      "Diabetes",
      "HA",
      "Otro",
      "Cirugias previas",
      "Toma medicamento",
      "Medicado desde",
      "Glicemia",
      "Hemoglobina",
      "Trigliceridos",
      "Colesterol",
      "Creatina",
      "Acido Urico",
      "Albumina",
      "Hematocitos",
      "H.Glicosilada",
      "HDL",
      "Sodio",
      "LD",
      "Calcio",
      "Magnesio",
      "Recordatorio De 24 Horas",
      "Consumos (Cantidades Y Frecuencias)",
      "Alimentos no agradables",
      "Alimentos alergico",
      "Alimentos intolerante",
      "Peso",
      "Talla",
      "Peso meta",
      "Peso ideal",
      "IMC",
      "Estado de nutricion",
      "% grasa corporal",
      "% de agua corporal",
      "Masa musculo",
      "Valoracion fisica",
      "DCI/BMR",
      "Edad metabolica",
      "Masa Osea",
      "Grasa viseral",
      "Diagnostico IMC niñas 5- 19 años",
      "Diagnostico Talla niñas 5- 19 años",
      "Diagnostico IMC niños 5- 19 años",
      "Diagnostico Talla niños 5- 19 años",  
      "Circunferencia de cintura",
      "CHO%",
      "CHON%",
      "COOH%",
      "Dieta prescrita",
      "Comentarios"
    ],
  ];
  const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY")
    .format("YYYY-MM-DD 00:00:00");
  const dateTo = moment(request.params.dateTo, "DD-MM-YYYY")
    .format("YYYY-MM-DD 23:59:59");
  let results = [];
  try {
    results = await model.NutritionalControl.find({
      "date": {
        $gte: dateFrom,
        $lte: dateTo,
      },
    })
      .sort({ "date": -1 })
      .populate("patient")
      .populate("responsible");
  } catch (error) {
    console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
  }

  let responseArray = [];
  for (const x of results) {
    let obj = {
      dateConsult:  moment(x.date).format("DD/MM/YYYY"),
      namePatient: x.patient.forename,
      lastNamePatient: x.patient.surname,
      birthDate: moment(x.patient.birthdate).format("DD/MM/YYYY"),
      gender: x.patient.gender,
      idQflow: x.patient.idQflow,
      nameDoctor: x.responsible.forename,
      lastNameDoctor: x.responsible.surname,
      diagnosisRefer:x.diagnosisRefer,
      clinicHistory:x.clinicHistory,
      colitis:x.colitis,
      gastritis:x.gastritis,
      constipation:x.constipation,
      diarrhea:x.diarrhea,
      diabetes:x.diabetes,
      hta:x.hta,
      otherRecords:x.otherRecords,
      previousSurgery:x.previousSurgery,
      currentMedication:x.currentMedication,
      currentMedicationFrom:x.currentMedicationFrom,
      glycemia:x.glycemia,
      hemoglobin:x.hemoglobin,
      triglycerides:x.triglycerides,
      cholesterol:x.cholesterol,
      creatinine:x.creatinine,
      uricAcid:x.uricAcid,
      albumin:x.albumin,
      hematocrit:x.hematocrit,
      glycosylatedh:x.glycosylatedh,
      hdl:x.hdl,
      sodium:x.sodium,
      ld:x.ld,
      calcium:x.calcium,
      magnesium:x.magnesium,
      lifestyle:x.lifestyle,
      consumptionFrequency:x.consumptionFrequency,
      unpleasantFoods:x.unpleasantFoods,
      allergicFoods:x.allergicFoods,
      intolerableFoods:x.intolerableFoods,
      weight:x.weight,
      size:x.size,
      goalWeight:x.goalWeight,
      idealWeight:x.idealWeight,
      imc:x.imc,
      nutritionalStatus:x.nutritionalStatus,
      bodyFat:x.bodyFat,
      bodyWater:x.bodyWater,
      muscleMass:x.muscleMass,
      physicalAssessment:x.physicalAssessment,
      dciBmr:x.dciBmr,
      metabolicAge:x.metabolicAge,
      boneMass:x.boneMass,
      viseralFat:x.viseralFat,
      diagnosesImg1:x.diagnosesImg1,
      diagnosesImg2:x.diagnosesImg2,
      diagnosesImg3:x.diagnosesImg3,
      diagnosesImg4:x.diagnosesImg4, 
      WaistCircumference:x.WaistCircumference,
      cho:x.cho,
      chon:x.chon,
      cooh:x.cooh,
      prescribedDiet:x.prescribedDiet,
      comments:x.comments,
    }
    responseArray.push(obj);
  }

  if (request.params.ext === "csv") {
    responseArray.forEach((x) => {
      datos.push([
        x.dateConsult,
        x.namePatient,
        x.lastNamePatient,
        x.birthDate,
        x.gender,
        x.idQflow,
        x.nameDoctor,
        x.lastNameDoctor,
        x.diagnosisRefer,
        x.clinicHistory,
        x.colitis,
        x.gastritis,
        x.constipation,
        x.diarrhea,
        x.diabetes,
        x.hta,
        x.otherRecords,
        x.previousSurgery,
        x.currentMedication,
        x.currentMedicationFrom,
        x.glycemia,
        x.hemoglobin,
        x.triglycerides,
        x.cholesterol,
        x.creatinine,
        x.uricAcid,
        x.albumin,
        x.hematocrit,
        x.glycosylatedh,
        x.hdl,
        x.sodium,
        x.ld,
        x.calcium,
        x.magnesium,
        x.lifestyle,
        x.consumptionFrequency,
        x.unpleasantFoods,
        x.allergicFoods,
        x.intolerableFoods,
        x.weight,
        x.size,
        x.goalWeight,
        x.idealWeight,
        x.imc,
        x.nutritionalStatus,
        x.bodyFat,
        x.bodyWater,
        x.muscleMass,
        x.physicalAssessment,
        x.dciBmr,
        x.metabolicAge,
        x.boneMass,
        x.viseralFat,
        x.diagnosesImg1,
        x.diagnosesImg2,
        x.diagnosesImg3,
        x.diagnosesImg4,
        x.WaistCircumference,
        x.cho,
        x.chon,
        x.cooh,
        x.prescribedDiet,
        x.comments,
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
