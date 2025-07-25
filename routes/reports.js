let express = require("express");
const util = require("util");
const { stringify } = require("csv-stringify");
let router = express.Router();
const fs = require("fs");
let model = require("../model/database_schemas.js");
let moment = require("moment");
const stringifyAsync = util.promisify(stringify);
const utilFs = require("util").promisify;
const writeFile = utilFs(fs.writeFile);
const os = require("os");
const path = require("path");

const searchNameDoctor = async (id) => {
  let doctor = await model.Person.findById(id, "forename surname");
  return doctor;
};

const filterDuplicate = (diagnostics) => {
  const uniqueDiagnostics = [];
  const seenCodes = new Set();
  const seenDiagnostics = new Set();

  for (const diagnostic of diagnostics) {
    const code = diagnostic.code;
    const diagnosticText = diagnostic.diagnostic;

    if (!seenCodes.has(code) && !seenDiagnostics.has(diagnosticText)) {
      uniqueDiagnostics.push(diagnostic);
      seenCodes.add(code);
      seenDiagnostics.add(diagnosticText);
    }
  }

  return uniqueDiagnostics;
};

const writeFiles = async (datos, tempFileName) => {
  const output = await stringifyAsync(datos);
  await writeFile(tempFileName, output, {
    flag: "a",
    encoding: "utf-8",
    mode: 0o666,
  });
};

const replaceValues = async (datos) => {
  return Promise.all(
    datos.map(async (x) => {
      return Promise.all(
        x.map(async (y) => {
          if (typeof y === "string") {
            return y.replace(/;/g, ",");
          }
          return y;
        })
      );
    })
  );
};

router.get(
  "/report/preliminary/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    let datos = [
      [
        "Fecha_Consulta",
        "Nombres de Paciente",
        "Apellidos de Paciente",
        "Genero",
        "Fecha de Nacimiento",
        "ID QFlow",
        "Lee y Escribe",
        "Usa Lentes",
        "Tipo de Consulta",
        "Motivo de consulta",
        "Responsable",
        "Sucursal",
        "HTA",
        "Chagas",
        "Cancer",
        "Diabetes",
        "Hemoglutest",
        "Hepatitis",
        "Cardiopatia",
        "Nefropatia",
        "Neumopatia",
        "Hematopatia",
        "Lesion/Fractura",
        "Tabaquismo",
        "Alcoholismo",
        "Tipo de lentes",
        "Alergico a",
        "Medicamentos actuales",
        "Agudeza visual OD CC",
        "Agudeza visual OD SC",
        "Agudeza visual OI CC",
        "Agudeza visual OI SC",
        "Agudeza Visual Observaciones",
        "Optotipo OI",
        "Optotipo OD",
        "Tonometria OD",
        "Tonometria OI",
        "No colabora",
        "Foto de Retina",
        "Hallazgos",
        "Observaciones",
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
    const fileName =
      "preliminares_" +
      request.params.dateFrom +
      "_" +
      request.params.dateTo +
      ".csv";
    const tempFileName = os.tmpdir() + "/" + fileName;

    await writeFiles(datos, tempFileName);
    datos = [];
    let countResults = 0;
    try {
      countResults = await model.Consultation.find({
        "control.active": false,
        "objPreliminary.data": { $exists: true },
        file: { $exists: false },
        "control.created_at": {
          $gte: dateFrom,
          $lte: dateTo,
        },
      }).count();
    } catch (error) {
      console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
    }
    let cicle = 0;
    let limit = 1000;
    console.log("countResults", countResults);
    while (countResults > cicle) {
      try {
        results = await model.Consultation.find(
          {
            "control.active": false,
            "objPreliminary.data": { $exists: true },
            file: { $exists: false },
            "control.created_at": {
              $gte: dateFrom,
              $lte: dateTo,
            },
          },
          {
            person: 1,
            control: 1,
            objPreliminary: 1,
            sucursalId: 1,
            typeConsultation: 1,
            reasonConsultation: 1,
            responsablePreliminar: 1,
          }
        )
          .limit(limit)
          .skip(cicle)
          .sort({ "control.created_at": -1 })
          .populate("person");
      } catch (error) {
        console.log(
          "Ha ocurrido un error en la busqueda de consultas: " + error
        );
      }

      for (const x of results) {
        try {
          const { antecedent, otrosDatos } = await model.Record.findById(
            x.person.record
          );
          let typeConsultation = (type) => {
            if (!type) {
              return "";
            }
            const value = type.replace(/ /g, "");
            const typesConsultations = {
              Forthefirsttime: "Primera Vez",
              PostOperativePatient: "Paciente Post-Operatorio",
              Control: "Control",
              E: "Emergencia",
            };
            return typesConsultations[value];
          };
          const sucursalResponse = await model.branchOffice.findById(
            x.sucursalId,
            "Name"
          );
          const nameSucursal = sucursalResponse ? sucursalResponse.Name : "";
          datos.push([
            moment(x.objPreliminary.control.created_at).format("DD/MM/YYYY"),
            x.person.forename,
            x.person.surname,
            x.person.gender,
            moment(x.person.birthdate).format("DD/MM/YYYY"),
            x.person.idQflow,
            x.person.readWrtite ? "SI" : "NO",
            x.person.lenses ? "SI" : "NO",
            x.typeConsultation,
            x.reasonConsultation,
            x.responsablePreliminar,
            nameSucursal,
            antecedent.antecedentes[0].value ? "SI" : "NO",
            antecedent.antecedentes[1].value ? "SI" : "NO",
            antecedent.antecedentes[2].value ? "SI" : "NO",
            antecedent.antecedentes[3].value ? "SI" : "NO",
            x.objPreliminary.data.record.antecedent.hemoglutest,
            antecedent.antecedentes[4].value ? "SI" : "NO",
            antecedent.antecedentes[5].value ? "SI" : "NO",
            antecedent.antecedentes[6].value ? "SI" : "NO",
            antecedent.antecedentes[7].value ? "SI" : "NO",
            antecedent.antecedentes[8].value ? "SI" : "NO",
            antecedent.antecedentes[9].value ? "SI" : "NO",
            antecedent.antecedentes[10].value ? "SI" : "NO",
            antecedent.antecedentes[11].value ? "SI" : "NO",

            x.objPreliminary.data.generalData
              ? x.objPreliminary.data.generalData.typeLense
              : "",
            otrosDatos.alergias[0],
            otrosDatos.medicamentos[0],
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoDer.correccion
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoDer.sinCorreccion
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoIzq.correccion
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoIzq.sinCorreccion
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.observation
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoIzq.optotipo
              : "",
            x.objPreliminary.data.agudezaVisual
              ? x.objPreliminary.data.agudezaVisual.ojoDer.optotipo
              : "",
            x.objPreliminary.data.tonometria
              ? x.objPreliminary.data.tonometria.ojoDer
              : "",
            x.objPreliminary.data.tonometria
              ? x.objPreliminary.data.tonometria.ojoIzq
              : "",
            x.objPreliminary.data.reason,
            x.objPreliminary.data.retinal_photo,
            x.objPreliminary.data.retinal_findings,
            x.objPreliminary.data.retinal_observation,
          ]);
          //replace ; in values for ,
          datos = await replaceValues(datos);
          await writeFiles(datos, tempFileName);
          datos = [];
        } catch (error) {
          console.log("Ha ocurrido un error el for: " + error);
          console.log(x._id);
        }
      }
      cicle += limit;
    }
    if (countResults == 0) {
      response
        .status(404)
        .send("No se encontraron resultados para la busqueda");
      return;
    }
    response.setHeader("Content-Type", "text/csv");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=" + fileName
    );
    //download
    response.setHeader("Content-Transfer-Encoding", "binary");

    //read file
    const fileDataRead = await fs.readFileSync(tempFileName, "utf8");
    await fs.unlinkSync(tempFileName);
    response.send(fileDataRead);
  }
);

router.get(
  "/report/optometry/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    let datos = [
      [
        "Fecha_Consulta",
        "Nombres de Paciente",
        "Apellidos de Paciente",
        "Genero",
        "Fecha de Nacimiento",
        "ID QFlow",
        "Motivo de consulta",
        "Responsable",
        "Dio receta",
        "Sucursal",
        "HTA",
        "Chagas",
        "Cancer",
        "Diabetes",
        "Hepatitis",
        "Cardiopatia",
        "Nefropatia",
        "Neumopatia",
        "Hematopatia",
        "Lesion/Fractura",
        "Tabaquismo",
        "Alcoholismo",
        "Agudeza visual OD CC",
        "Agudeza visual OD SC",
        "Agudeza visual OI CC",
        "Agudeza visual OI SC",
        "Agudeza Visual Observaciones",
        "Autorefraccion OD Esfera",
        "Autorefraccion OD Cilindro",
        "Autorefraccion OD Eje",
        "Autorefraccion OI Esfera",
        "Autorefraccion OI Cilindro",
        "Autorefraccion OI Eje",
        "Queratometría OD K1",
        "Queratometría OD Eje",
        "Queratometría OD K2",
        "Queratometría OD Eje",
        "Queratometría OI K1",
        "Queratometría OI Eje",
        "Queratometría OI K2",
        "Queratometría OI Eje",
        "Lensometria OD Esfera",
        "Lensometria OD Cilindro",
        "Lensometria OD Eje",
        "Lensometria OD Prisma",
        "Lensometria OD Adicion",
        "Lensometria OI Esfera",
        "Lensometria OI Cilindro",
        "Lensometria OI Eje",
        "Lensometria OI Prisma",
        "Lensometria OI Adicion",
        "Lensometria tipo de lentes",
        "Refraccion OD Esfera",
        "Refraccion OD Cilindro",
        "Refraccion OD Eje",
        "Refraccion OD Agudeza V",
        "Refraccion OI Esfera",
        "Refraccion OI Cilindro",
        "Refraccion OI Eje",
        "Refraccion OI Agudeza V",
        "Refraccion Ciclopejia",
        "Refraccion Estatica",
        "Refraccion Dinamica",
        "Refraccion OD Adicion",
        "Refraccion OI Adicion",
        "PPC",
        "CT",
        "Reflejos pupilares",
        "RX Final Gafas OD Esfera",
        "RX Final Gafas OD Cilindro",
        "RX Final Gafas OD Eje",
        "RX Final Gafas OD Prisma",
        "RX Final Gafas OD Adicion",
        "RX Final Gafas OD Agudeza V",
        "RX Final Gafas OI Esfera",
        "RX Final Gafas OI Cilindro",
        "RX Final Gafas OI Eje",
        "RX Final Gafas OI Prisma",
        "RX Final Gafas OI Adicion",
        "RX Final Gafas OI Agudeza V",
        "RX Final Gafas Ocupacion",
        "RX Final Gafas Tipo de lente",
        "RX Final Gafas Observaciones",
        "RX Final Lentes de Contacto OD Esfera",
        "RX Final Lentes de Contacto OD Cilindro",
        "RX Final Lentes de Contacto OD Eje",
        "RX Final Lentes de Contacto OD Curva Base",
        "RX Final Lentes de Contacto OD Diametro",
        "RX Final Lentes de Contacto OD Agudeza V",
        "RX Final Lentes de Contacto OD Marca",
        "RX Final Lentes de Contacto OI Esfera",
        "RX Final Lentes de Contacto OI Cilindro",
        "RX Final Lentes de Contacto OI Eje",
        "RX Final Lentes de Contacto OI Curva Base",
        "RX Final Lentes de Contacto OI Diametro",
        "RX Final Lentes de Contacto OI Agudeza V",
        "RX Final Lentes de Contacto OI Marca",
        "RX Final Visión Lejana OD Esfera",
        "RX Final Visión Lejana OD Cilindro",
        "RX Final Visión Lejana OD Eje",
        "RX Final Visión Lejana OD Prisma",
        "RX Final Visión Lejana OD Adicion",
        "RX Final Visión Lejana OD Agudeza V",
        "RX Final Visión Lejana OI Esfera",
        "RX Final Visión Lejana OI Cilindro",
        "RX Final Visión Lejana OI Eje",
        "RX Final Visión Lejana OI Prisma",
        "RX Final Visión Lejana OI Adicion",
        "RX Final Visión Lejana OI Agudeza V",
        "RX Final Visión Lejana tipo de lente",
        "RX Final Visión Lejana Observaciones",
        "RX Final Visión Proxima OD Esfera",
        "RX Final Visión Proxima OD Cilindro",
        "RX Final Visión Proxima OD Eje",
        "RX Final Visión Proxima OD Prisma",
        "RX Final Visión Proxima OD Adicion",
        "RX Final Visión Proxima OD Agudeza V",
        "RX Final Visión Proxima OI Esfera",
        "RX Final Visión Proxima OI Cilindro",
        "RX Final Visión Proxima OI Eje",
        "RX Final Visión Proxima OI Prisma",
        "RX Final Visión Proxima OI Adicion",
        "RX Final Visión Proxima OI Agudeza V",
        "RX Final Visión Proxima tipo de lente",
        "RX Final Visión Proxima Observaciones",
        "RX Final Visión Intermedia OD Esfera",
        "RX Final Visión Intermedia OD Cilindro",
        "RX Final Visión Intermedia OD Eje",
        "RX Final Visión Intermedia OD Prisma",
        "RX Final Visión Intermedia OD Adicion",
        "RX Final Visión Intermedia OD Agudeza V",
        "RX Final Visión Intermedia OI Esfera",
        "RX Final Visión Intermedia OI Cilindro",
        "RX Final Visión Intermedia OI Eje",
        "RX Final Visión Intermedia OI Prisma",
        "RX Final Visión Intermedia OI Adicion",
        "RX Final Visión Intermedia OI Agudeza V",
        "RX Final Visión Intermedia tipo de lente",
        "RX Final Visión Intermedia Observaciones",
        "Diagnostico OD",
        "Diagnostico OI",
        "Observaciones",
        "Refiere oftalmologo",
        "Receta Medica",
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
    const fileName =
      "optometria_" +
      request.params.dateFrom +
      "_" +
      request.params.dateTo +
      ".csv";
    const tempFileName = os.tmpdir() + "/" + fileName;
    await writeFiles(datos, tempFileName);
    datos = [];
    let countResults = 0;
    try {
      countResults = await model.Consultation.find({
        "control.active": false,
        "objOptometrist.data": { $exists: true },
        file: { $exists: false },
        "control.created_at": {
          $gte: dateFrom,
          $lte: dateTo,
        },
      }).count();
    } catch (error) {
      console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
    }
    let cicle = 0;
    let limit = 1000;
    console.log("countResults", countResults);
    while (countResults > cicle) {
      try {
        results = await model.Consultation.find(
          {
            "control.active": false,
            "objOptometrist.data": { $exists: true },
            file: { $exists: false },
            "control.created_at": {
              $gte: dateFrom,
              $lte: dateTo,
            },
          },
          {
            person: 1,
            control: 1,
            objOptometrist: 1,
            sucursalId: 1,
            typeConsultation: 1,
            reasonConsultation: 1,
            prescription: 1,
          }
        )
          .limit(limit)
          .skip(cicle)
          .populate("person");
      } catch (error) {
        console.log(
          "Ha ocurrido un error en la busqueda de consultas: " + error
        );
      }

      let getDiagnosesName = (name) => {
        const objName = {
          hyperopia: "Hipermetropía",
          myopia: "Miopía",
          astigmatism: "Astigmatismo",
          presbyopia: "Presbicia",
          emmetropia: "Emetropia",
          amblyopia: "Ambliopia",
          anisometropia: "Anisometropia",
          squint: "Estrabismo",
        };
        return objName[name];
      };
      for (const x of results) {
        try {
          let nameOpto = await searchNameDoctor(
            x.objOptometrist.data.responsableConsultation
          );

          let objDiagnoses = {
            ojoDer: [],
            ojoIzq: [],
          };

          let receta = x.prescription
            ? await model.Prescription.findById(x.prescription)
            : null;
          let medicines = receta ? receta.prescription : "";
          if (medicines) {
            medicines = medicines
              .map((x) => {
                const medicine = x.medicine || "";
                const doses = x.doses || "";
                const activeIngredient = x.active_ingredient || "";
                const recommendation = x.recomendation || "";
                return [medicine, doses, activeIngredient, recommendation]
                  .filter((field) => field.trim() !== "")
                  .join(" - ");
              })
              .join("; ");
          }

          x.objOptometrist.data.diagnosticoObservaciones.diagnostico.forEach(
            (x) => {
              if (x.eyeRight) {
                objDiagnoses.ojoDer.push(getDiagnosesName(x.name));
              }
              if (x.eyeLeft) {
                objDiagnoses.ojoIzq.push(getDiagnosesName(x.name));
              }
            }
          );
          const sucursalResponse = await model.branchOffice.findById(
            x.sucursalId,
            "Name"
          );
          const nameSucursal = sucursalResponse ? sucursalResponse.Name : "";
          datos.push([
            moment(x.objOptometrist.control.created_at).format("DD/MM/YYYY"),
            x.person.forename,
            x.person.surname,
            x.person.gender,
            moment(x.person.birthdate).format("DD/MM/YYYY"),
            x.person.idQflow,
            x.reasonConsultation,
            `${nameOpto.forename} ${nameOpto.surname}`,
            x.objOptometrist.data.receta,
            nameSucursal,
            x.objOptometrist.data.record.antecedent.antecedentes[0].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[1].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[2].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[3].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[4].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[5].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[6].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[7].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[8].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[9].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[10].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.record.antecedent.antecedentes[11].value
              ? "SI"
              : "NO",
            x.objOptometrist.data.agudezaVisualOPT.ojoDer.correccion,
            x.objOptometrist.data.agudezaVisualOPT.ojoDer.sinCorreccion,
            x.objOptometrist.data.agudezaVisualOPT.ojoIzq.correccion,
            x.objOptometrist.data.agudezaVisualOPT.ojoIzq.sinCorreccion,
            x.objOptometrist.data.agudezaVisualOPT.observation,
            x.objOptometrist.data.autorefraccionA.ojoDer.esfera,
            x.objOptometrist.data.autorefraccionA.ojoDer.cilindro,
            x.objOptometrist.data.autorefraccionA.ojoDer.eje,
            x.objOptometrist.data.autorefraccionA.ojoIzq.esfera,
            x.objOptometrist.data.autorefraccionA.ojoIzq.cilindro,
            x.objOptometrist.data.autorefraccionA.ojoIzq.eje,
            x.objOptometrist.data.queratometria.ojoDer.esfera,
            x.objOptometrist.data.queratometria.ojoDer.ejeEs,
            x.objOptometrist.data.queratometria.ojoDer.cilindro,
            x.objOptometrist.data.queratometria.ojoDer.ejeCil,
            x.objOptometrist.data.queratometria.ojoIzq.esfera,
            x.objOptometrist.data.queratometria.ojoIzq.ejeEs,
            x.objOptometrist.data.queratometria.ojoIzq.cilindro,
            x.objOptometrist.data.queratometria.ojoIzq.ejeCil,
            x.objOptometrist.data.lensometria.ojoDer.esfera,
            x.objOptometrist.data.lensometria.ojoDer.cilindro,
            x.objOptometrist.data.lensometria.ojoDer.eje,
            x.objOptometrist.data.lensometria.ojoDer.prisma,
            x.objOptometrist.data.lensometria.ojoDer.adicion,
            x.objOptometrist.data.lensometria.ojoIzq.esfera,
            x.objOptometrist.data.lensometria.ojoIzq.cilindro,
            x.objOptometrist.data.lensometria.ojoIzq.eje,
            x.objOptometrist.data.lensometria.ojoIzq.prisma,
            x.objOptometrist.data.lensometria.ojoIzq.adicion,
            x.objOptometrist.data.lensometria.typeLenses,
            x.objOptometrist.data.refraccion.ojoDer.esfera,
            x.objOptometrist.data.refraccion.ojoDer.cilindro,
            x.objOptometrist.data.refraccion.ojoDer.eje,
            x.objOptometrist.data.refraccion.ojoDer.av,
            x.objOptometrist.data.refraccion.ojoIzq.esfera,
            x.objOptometrist.data.refraccion.ojoIzq.cilindro,
            x.objOptometrist.data.refraccion.ojoIzq.eje,
            x.objOptometrist.data.refraccion.ojoIzq.av,
            x.objOptometrist.data.refraccion.ciclo,
            x.objOptometrist.data.refraccion.est,
            x.objOptometrist.data.refraccion.dinm,
            x.objOptometrist.data.refraccion.ojoDer.add,
            x.objOptometrist.data.refraccion.ojoIzq.add,
            x.objOptometrist.data.refraccion.ppc,
            x.objOptometrist.data.refraccion.ct,
            x.objOptometrist.data.refraccion.rp,
            x.objOptometrist.data.rxFinalGafas.ojoDer.esfera,
            x.objOptometrist.data.rxFinalGafas.ojoDer.cilindro,
            x.objOptometrist.data.rxFinalGafas.ojoDer.eje,
            x.objOptometrist.data.rxFinalGafas.ojoDer.prisma,
            x.objOptometrist.data.rxFinalGafas.ojoDer.add,
            x.objOptometrist.data.rxFinalGafas.ojoDer.av,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.esfera,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.cilindro,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.eje,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.prismasalariado,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.add,
            x.objOptometrist.data.rxFinalGafas.ojoIzq.av,
            x.objOptometrist.data.rxFinalGafas.ocupation,
            Array.isArray(x.objOptometrist.data.rxFinalGafas.type_lenses) &&
            x.objOptometrist.data.rxFinalGafas.type_lenses.length > 0
              ? x.objOptometrist.data.rxFinalGafas.type_lenses.join()
              : "",
            x.objOptometrist.data.rxFinalGafas.observation,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.esfera,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.cilindro,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.eje,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.cb,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.dia,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.av,
            x.objOptometrist.data.rxFinalLentesContacto.ojoDer.brand,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.esfera,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.cilindro,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.eje,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.cb,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.dia,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.av,
            x.objOptometrist.data.rxFinalLentesContacto.ojoIzq.brand,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.esfera,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.cilindro,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.eje,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.prisma,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.add,
            x.objOptometrist.data.rxFinalVisionLejano.ojoDer.av,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.esfera,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.cilindro,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.eje,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.prisma,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.add,
            x.objOptometrist.data.rxFinalVisionLejano.ojoIzq.av,
            Array.isArray(
              x.objOptometrist.data.rxFinalVisionLejano.type_lenses
            ) &&
            x.objOptometrist.data.rxFinalVisionLejano.type_lenses.length > 0
              ? x.objOptometrist.data.rxFinalVisionLejano.type_lenses.join()
              : "",
            x.objOptometrist.data.rxFinalVisionLejano.observation,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.esfera,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.cilindro,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.eje,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.prisma,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.add,
            x.objOptometrist.data.rxFinalVisionProxima.ojoDer.av,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.esfera,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.cilindro,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.eje,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.prisma,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.add,
            x.objOptometrist.data.rxFinalVisionProxima.ojoIzq.av,
            Array.isArray(
              x.objOptometrist.data.rxFinalVisionProxima.type_lenses
            ) &&
            x.objOptometrist.data.rxFinalVisionProxima.type_lenses.length > 0
              ? x.objOptometrist.data.rxFinalVisionProxima.type_lenses.join()
              : "",
            x.objOptometrist.data.rxFinalVisionProxima.observation,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.esfera,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.cilindro,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.eje,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.prisma,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.add,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoDer.av,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.esfera,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.cilindro,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.eje,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.prisma,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.add,
            x.objOptometrist.data.rxFinalVisionIntermedia.ojoIzq.av,
            Array.isArray(
              x.objOptometrist.data.rxFinalVisionIntermedia.type_lenses
            ) &&
            x.objOptometrist.data.rxFinalVisionIntermedia.type_lenses.length > 0
              ? x.objOptometrist.data.rxFinalVisionIntermedia.type_lenses.join()
              : "",
            x.objOptometrist.data.rxFinalVisionIntermedia.observation,
            objDiagnoses.ojoDer.join(),
            objDiagnoses.ojoIzq.join(),
            x.objOptometrist.data.diagnosticoObservaciones.observaciones,
            x.objOptometrist.data.refer_to_ofta,
            medicines,
          ]);
        } catch (error) {
          console.log("Ha ocurrido un error el for: " + error);
          console.log(x._id);
        }
      }

      cicle += limit;
      //replace ; in values for ,
      datos = await replaceValues(datos);
      await writeFiles(datos, tempFileName);
      datos = [];
    }

    if (countResults == 0) {
      response
        .status(404)
        .send("No se encontraron resultados para la busqueda");
      return;
    }

    response.setHeader("Content-Type", "text/csv");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=" + fileName
    );
    //download
    response.setHeader("Content-Transfer-Encoding", "binary");

    //read file
    const fileDataRead = await fs.readFileSync(tempFileName, "utf8");
    await fs.unlinkSync(tempFileName);
    response.send(fileDataRead);
  }
);

router.get(
  "/report/ophthalmology/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    let datos = [
      [
        "Fecha_Consulta",
        "Nombres de Paciente",
        "Apellidos de Paciente",
        "Genero",
        "Fecha de Nacimiento",
        "ID QFlow",
        "Responsable",
        "Motivo de consulta",
        "Historia Clinica",
        "Sucursal",
        "HTA",
        "Chagas",
        "Cancer",
        "Diabetes",
        "Hepatitis",
        "Cardiopatia",
        "Nefropatia",
        "Neumopatia",
        "Hematopatia",
        "Lesion/Fractura",
        "Tabaquismo",
        "Alcoholismo",
        "Medicamento actual",
        "Cirugia OD Cataratas",
        "Cirugia OD Glaucoma",
        "Cirugia OD Estrabismo",
        "Cirugia OD Retina",
        "Cirugia OD Plastica",
        "Cirugia OD Pterigion",
        "Cirugia OD Cornea",
        "Cirugia OD Otro",
        "Cirugia OI Cataratas",
        "Cirugia OI Glaucoma",
        "Cirugia OI Estrabismo",
        "Cirugia OI Retina",
        "Cirugia OI Plastica",
        "Cirugia OI Pterigion",
        "Cirugia OI Cornea",
        "Cirugia OI Otro",
        "Posición p mirada OD",
        "Posición p mirada OI",
        "Agudeza visual OD CC",
        "Agudeza visual OD SC",
        "Agudeza visual OD AR",
        "Agudeza visual OI CC",
        "Agudeza visual OI SC",
        "Agudeza visual OI AR",
        "Exámen Externo OD",
        "Exámen Externo OI",
        "Biomicroscopio OD",
        "Biomicroscopio OI",
        "Fundoscopía OD",
        "Fundoscopía OI",
        "Gonioscopia OD",
        "Gonioscopia OI",
        "Tonometría OD",
        "Tonometría OI",
        // "Procedimientos T",
        "Diagnostico",
        "Receta Medica",
        // "Plan",
        // "Observaciones",
        // "Medicamentos",
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
    const fileName =
      "oftalmologia_" +
      request.params.dateFrom +
      "_" +
      request.params.dateTo +
      ".csv";
    const tempFileName = os.tmpdir() + "/" + fileName;
    await writeFiles(datos, tempFileName);
    datos = [];
    let countResults = 0;
    try {
      console.log("dateFrom ", dateFrom);
      console.log("dateTo", dateTo);
      countResults = await model.Consultation.find({
        "control.active": false,
        "objOphthalmology.data": { $exists: true },
        file: { $exists: false },
        "control.created_at": {
          $gte: dateFrom,
          $lte: dateTo,
        },
      }).count();
    } catch (error) {
      console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
    }

    let cicle = 0;
    let limit = 1000;
    console.log("countResults", countResults);
    while (countResults > cicle) {
      try {
        results = await model.Consultation.find(
          {
            "control.active": false,
            "objOphthalmology.data": { $exists: true },
            file: { $exists: false },
            "control.created_at": {
              $gte: dateFrom,
              $lte: dateTo,
            },
          },
          {
            person: 1,
            control: 1,
            objOphthalmology: 1,
            sucursalId: 1,
            typeConsultation: 1,
            reasonConsultation: 1,
            prescription_of: 1,
          }
        )
          .limit(limit)
          .skip(cicle)
          .sort({ "control.created_at": -1 })
          .populate("person");
      } catch (error) {
        console.log(
          "Ha ocurrido un error en la busqueda de consultas: " + error
        );
      }
      for (const x of results) {
        try {
          const { cirugias } = await model.Record.findById(x.person.record);

          let nameOpto = await searchNameDoctor(
            x.objOphthalmology.data.responsableConsultation
          );
          const sucursalResponse = await model.branchOffice.findById(
            x.sucursalId,
            "Name"
          );
          const nameSucursal = sucursalResponse ? sucursalResponse.Name : "";
          let receta = x.prescription_of
            ? await model.Prescription.findById(x.prescription_of)
            : null;
          let medicines = receta ? receta.prescription : "";
          if (medicines) {
            medicines = medicines
              .map((x) => {
                const medicine = x.medicine || "";
                const doses = x.doses || "";
                const activeIngredient = x.active_ingredient || "";
                const recommendation = x.recomendation || "";
                return [medicine, doses, activeIngredient, recommendation]
                  .filter((field) => field.trim() !== "")
                  .join(" - ");
              })
              .join("; ");
          }
          datos.push([
            moment(x.objOphthalmology.control.created_at).format("DD/MM/YYYY"),
            x.person.forename,
            x.person.surname,
            x.person.gender,
            moment(x.person.birthdate).format("DD/MM/YYYY"),
            x.person.idQflow,
            `${nameOpto.forename} ${nameOpto.surname}`,
            x.reasonConsultation,
            x.objOphthalmology.data.historyClinic,
            // x.objOphthalmology.data.observaciones.recetas.length > 0
            //   ? "SI"
            //   : "NO",
            nameSucursal,
            x.objOphthalmology.data.record.antecedent.antecedentes[0].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[1].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[2].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[3].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[4].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[5].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[6].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[7].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[8].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[9].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[10].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.antecedentes[11].value
              ? "SI"
              : "NO",
            x.objOphthalmology.data.record.antecedent.medicamentosAntecedent,
            cirugias.cirugias.length > 0 && cirugias.cirugias[0].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[1].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[2].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[3].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[4].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[5].eyeRight
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[6].eyeRight
              ? "SI"
              : "NO",
            cirugias.othersEyeRigth || "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[0].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[1].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[2].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[3].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[4].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[5].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.length > 0 && cirugias.cirugias[6].eyeLeft
              ? "SI"
              : "NO",
            cirugias.cirugias.othersEyeLeft || "NO",
            `${x.objOphthalmology.data.datapreliminar.ppm.ojoDer.data || ""} ${
              x.objOphthalmology.data.datapreliminar.ppm.ojoDer.otro || ""
            }`,
            `${x.objOphthalmology.data.datapreliminar.ppm.ojoIzq.data || ""} ${
              x.objOphthalmology.data.datapreliminar.ppm.ojoIzq.otro || ""
            }`,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoDer.cc,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoDer.sc,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoDer
              .autocorreccion,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoIzq.cc,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoIzq.sc,
            x.objOphthalmology.data.datapreliminar.agudezavisual.ojoIzq
              .autocorreccion,
            x.objOphthalmology.data.datapreliminar.examenexterno.ojoder,
            x.objOphthalmology.data.datapreliminar.examenexterno.ojoizq,
            x.objOphthalmology.data.datapreliminar.biomicroscopio.ojoder,
            x.objOphthalmology.data.datapreliminar.biomicroscopio.ojoizq,
            x.objOphthalmology.data.datapreliminar.fundoscopia.ojoder,
            x.objOphthalmology.data.datapreliminar.fundoscopia.ojoizq,
            x.objOphthalmology.data.datapreliminar.gonioscopia.ojoder,
            x.objOphthalmology.data.datapreliminar.gonioscopia.ojoizq,
            x.objOphthalmology.data.datapreliminar.tonometria.ojoder,
            x.objOphthalmology.data.datapreliminar.tonometria.ojoizq,
            filterDuplicate(x.objOphthalmology.data.diagnostic)
              .map((x) => x.diagnostic.es)
              .join(),
            medicines,
            // x.objOphthalmology.data.observaciones.observacion,
            // x.objOphthalmology.data.observaciones.medicamentos.join(),
          ]);
          //replace ; in values for ,
          datos = await replaceValues(datos);
          await writeFiles(datos, tempFileName);
          datos = [];
        } catch (error) {
          console.log("Ha ocurrido un error el for: " + error);
          console.log(x._id);
        }
      }
      cicle += limit;
    }

    if (countResults == 0) {
      response
        .status(404)
        .send("No se encontraron resultados para la busqueda");
      return;
    }
    response.setHeader("Content-Type", "text/csv");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=" + fileName
    );
    //download
    response.setHeader("Content-Transfer-Encoding", "binary");

    //read file
    const fileDataRead = await fs.readFileSync(tempFileName, "utf8");
    await fs.unlinkSync(tempFileName);
    response.send(fileDataRead);
  }
);
router.get(
  "/report/pediatrist/:dateFrom/:dateTo/:ext",
  async (request, response) => {
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
        "plan",
      ],
    ];
    const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").format(
      "YYYY-MM-DD 00:00:00"
    );
    const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").format(
      "YYYY-MM-DD 23:59:59"
    );
    let results = [];
    try {
      results = await model.PediatricEvaluation.find({
        date: {
          $gte: dateFrom,
          $lte: dateTo,
        },
      })
        .sort({ date: -1 })
        .populate("patient")
        .populate("responsible");
    } catch (error) {
      console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
    }

    let responseArray = [];
    for (const x of results) {
      let obj = {
        dateConsult: moment(x.date).format("DD/MM/YYYY"),
        namePatient: x.patient.forename,
        lastNamePatient: x.patient.surname,
        birthDate: moment(x.patient.birthdate).format("DD/MM/YYYY"),
        gender: x.patient.gender,
        idQflow: x.patient.idQflow,
        nameDoctor: x.responsible.forename,
        lastNameDoctor: x.responsible.surname,
        diagnosisPre: x.diagnosisPre,
        stateDiagnosis: x.stateDiagnosis,
        clinicObservation: x.clinicObservation,
        recordNP: x.recordNP,
        recordP: x.recordP,
        vaccination: x.vaccination,
        blood_pressure: x.blood_pressure,
        heart_rate: x.heart_rate,
        respiratory_rate: x.respiratory_rate,
        oxygen_saturation: x.oxygen_saturation,
        temp: x.temp,
        weight: x.weight,
        size: x.size,
        physicalExam: x.physicalExam,
        ht: x.ht,
        hb: x.hb,
        platelets: x.platelets,
        tp: x.tp,
        tpt: x.tpt,
        inr: x.inr,
        glucose: x.glucose,
        vih: x.vih,
        ego: x.ego,
        radiography: x.radiography,
        electrocardiogram: x.electrocardiogram,
        comments: x.comments,
        surgical_risk: x.surgical_risk,
        functional_capacity: x.functional_capacity,
        clinical_predictors: x.clinical_predictors,
        clasification_asa: x.clasification_asa,
        plan: x.plan,
      };
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
      //replace ; in values for ,
      datos = await replaceValues(datos);
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
  }
);

router.get(
  "/report/nutritionist/:dateFrom/:dateTo/:ext",
  async (request, response) => {
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
        "Comentarios",
      ],
    ];
    const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").format(
      "YYYY-MM-DD 00:00:00"
    );
    const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").format(
      "YYYY-MM-DD 23:59:59"
    );
    let results = [];
    try {
      results = await model.NutritionalControl.find({
        date: {
          $gte: dateFrom,
          $lte: dateTo,
        },
      })
        .sort({ date: -1 })
        .populate("patient")
        .populate("responsible");
    } catch (error) {
      console.log("Ha ocurrido un error en la busqueda de consultas: " + error);
    }

    let responseArray = [];
    for (const x of results) {
      let obj = {
        dateConsult: moment(x.date).format("DD/MM/YYYY"),
        namePatient: x.patient.forename,
        lastNamePatient: x.patient.surname,
        birthDate: moment(x.patient.birthdate).format("DD/MM/YYYY"),
        gender: x.patient.gender,
        idQflow: x.patient.idQflow,
        nameDoctor: x.responsible.forename,
        lastNameDoctor: x.responsible.surname,
        diagnosisRefer: x.diagnosisRefer,
        clinicHistory: x.clinicHistory,
        colitis: x.colitis,
        gastritis: x.gastritis,
        constipation: x.constipation,
        diarrhea: x.diarrhea,
        diabetes: x.diabetes,
        hta: x.hta,
        otherRecords: x.otherRecords,
        previousSurgery: x.previousSurgery,
        currentMedication: x.currentMedication,
        currentMedicationFrom: x.currentMedicationFrom,
        glycemia: x.glycemia,
        hemoglobin: x.hemoglobin,
        triglycerides: x.triglycerides,
        cholesterol: x.cholesterol,
        creatinine: x.creatinine,
        uricAcid: x.uricAcid,
        albumin: x.albumin,
        hematocrit: x.hematocrit,
        glycosylatedh: x.glycosylatedh,
        hdl: x.hdl,
        sodium: x.sodium,
        ld: x.ld,
        calcium: x.calcium,
        magnesium: x.magnesium,
        lifestyle: x.lifestyle,
        consumptionFrequency: x.consumptionFrequency,
        unpleasantFoods: x.unpleasantFoods,
        allergicFoods: x.allergicFoods,
        intolerableFoods: x.intolerableFoods,
        weight: x.weight,
        size: x.size,
        goalWeight: x.goalWeight,
        idealWeight: x.idealWeight,
        imc: x.imc,
        nutritionalStatus: x.nutritionalStatus,
        bodyFat: x.bodyFat,
        bodyWater: x.bodyWater,
        muscleMass: x.muscleMass,
        physicalAssessment: x.physicalAssessment,
        dciBmr: x.dciBmr,
        metabolicAge: x.metabolicAge,
        boneMass: x.boneMass,
        viseralFat: x.viseralFat,
        diagnosesImg1: x.diagnosesImg1,
        diagnosesImg2: x.diagnosesImg2,
        diagnosesImg3: x.diagnosesImg3,
        diagnosesImg4: x.diagnosesImg4,
        WaistCircumference: x.WaistCircumference,
        cho: x.cho,
        chon: x.chon,
        cooh: x.cooh,
        prescribedDiet: x.prescribedDiet,
        comments: x.comments,
      };
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
      //replace ; in values for ,
      datos = await replaceValues(datos);
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
  }
);

router.get(
  "/report/psychologist1/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    try {
      const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").format(
        "YYYY-MM-DD 00:00:00"
      );
      const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").format(
        "YYYY-MM-DD 23:59:59"
      );
      let dataPsi = await model.psyProcess
        .find({ createdAt: { $gte: dateFrom, $lte: dateTo } })
        .sort({ createdAt: -1 })
        .populate("person")
        .populate("responsableConsultation");

      let dataPsiArray = [];
      const headers = [
        "Numero de sesiones",
        "Estado del proceso",
        "Inicio",
        "Fin",
        "Creado",
        "Resumen del problema",
        "Impresion diagnostica",
        "Diagnostico",
        "Descripciones de sesiones",
        "Responsable",
        "Paciente",
        "ID QFlow",
      ];
      dataPsiArray.push(headers);
      for (const x of dataPsi) {
        dataPsiArray.push([
          x.sessionNumber,
          x.stateProcess,
          moment(x.dateStart).format("DD/MM/YYYY"),
          moment(x.dateEnd).format("DD/MM/YYYY"),
          moment(x.createdAt).format("DD/MM/YYYY"),
          x.problemSummary,
          x.diagnosticImpression,
          x.diagnostic.join(),
          x.descriptions.map((x) => x.description),
          x.responsableConsultation.forename +
            " " +
            x.responsableConsultation.surname,
          x.person.forename + " " + x.person.surname,
          x.person.idQflow,
        ]);
      }
      //replace ; in values for ,
      dataPsiArray = await replaceValues(dataPsiArray);
      stringify(dataPsiArray, (err, output) => {
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
    } catch (error) {
      console.log(error);
      response.status(500).json({
        status: "KO",
        message: "Error al generar CSV",
        documents: [],
      });
    }
  }
);

router.get(
  "/report/psychologist2/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    try {
      const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").format(
        "DD/MM/YYYY"
      );
      const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").format(
        "DD/MM/YYYY"
      );

      let dataInterviewChildren = await model.PsyInterviewChildren.find({
        dateInit: { $gte: dateFrom, $lte: dateTo },
      })
        .populate("person")
        .populate("responsableConsultation");

      let dataInterviewChildrenArray = [];
      const headers = [
        "paciente",
        "ID QFlow",
        "responsable de la consulta",
        "fecha de inicio",
        "hora de consulta",
        "responsable del paciente",
        "DUI del responsable",
        "razon de la consulta",
        "síntomas presentes",
        "fecha del problema",
        "Informacion del padre",
        "Informacion de la madre",
        "caso de abandono",
        "antecedentes familiares",
        "antecedentes psiquiátricos familiares",
        "antecedentes de abuso de sustancias en la familia",
        "rutina del niño",
        "ciclo de sueño",
        "fija mirada",
        "uso de lentes",
        "problema visual",
        "problema visual descripción",
        "hace amigos fácilmente",
        "porque no hace amigos fácilmente",
        "porque pelea con otros niños",
        "relacion con otros niños",
        "Qué hace en su tiempo libre",
        "que hace cuando esta solo",
        "que no le gusta hacer",
        "juego favorito",
        "Deporte que gusta",
        "programa de tv que le gusta",
        "que lo hace feliz",
        "que lo entristece",
        "que lo enoja",
        "que le da miedo",
        "problemas en embarazo",
        "numero de embarazos",
        "como fue el embarazo",
        "problemas en embarazo (madre)",
        "abuso de sustancias (madre)",
        "problema medico o psiquiátrico en el embarazo",
        "como fue el parto",
        "sufrio problemas en embarazo (hijo o madre)",
        "telefono de responsable",
      ];
      dataInterviewChildrenArray.push(headers);
      for (const x of dataInterviewChildren) {
        dataInterviewChildrenArray.push([
          `${x.person.forename} ${x.person.surname}`,
          x.person.idQflow,
          `${x.responsableConsultation.forename} ${x.responsableConsultation.surname}`,
          x.dateInit,
          x.timeConsultation,
          x.responsableName,
          x.responsableDui,
          x.reasonConsultation,
          x.symptomsPresent,
          x.appearanceProblem,
          x.informationDad,
          x.informationMom,
          x.abandonmentParents,
          x.recordFamilyExist,
          x.recordPsychiatricFamilyExist,
          x.recordFamilyAbuseExist,
          x.childsRoutine,
          x.sleepCycle,
          x.fixGaze,
          x.useGlasses,
          x.visualProblem,
          x.visualProblemDescription,
          x.makeFriendsEasily,
          x.whyNotMakeFriendsEasily,
          x.fightWithOtherChildren,
          x.relationshipWithChildrenOfOtherSex,
          x.whatHeLikesToDoInHisFreeTime,
          x.whatDoIsAlone,
          x.whatNotLikeDo,
          x.favoriteGames,
          x.whatSportsHeLikes,
          x.whatTVShowsHeWatches,
          x.wahtMakesHimHappy,
          x.wahtMakesHimSad,
          x.wahtMakesHimAngry,
          x.wahtMakesHimAfraid,
          x.pregnancyMother,
          x.pregnancyMotherNumber,
          x.howWasPregnancy,
          x.pregnancyMotherProblem,
          x.pregnancyMotherAbuse,
          x.pregnancyMotherPsiProblem,
          x.childBirth,
          x.cordComplication,
          x.responsablePhone,
        ]);
      }
      //replace ; in values for ,
      dataInterviewChildrenArray = await replaceValues(
        dataInterviewChildrenArray
      );
      stringify(dataInterviewChildrenArray, (err, output) => {
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
    } catch (error) {
      console.log(error);
      response.status(500).json({
        status: "KO",
        message: "Error al generar CSV",
        documents: [],
      });
    }
  }
);
router.get(
  "/report/psychologist3/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    try {
      const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").format(
        "DD/MM/YYYY"
      );
      const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").format(
        "DD/MM/YYYY"
      );

      let dataInterviewAdults = await model.PsyInterviewAdults.find({
        dateInit: { $gte: dateFrom, $lte: dateTo },
      })
        .populate("person")
        .populate("responsableConsultation");

      let dataInterviewAdultsArray = [];

      const headers = [
        "paciente",
        "ID QFlow",
        "responsable de consulta",
        "fecha de inicio",
        "hora de consulta",
        "motivo de consulta",
        "cuando se dio cuenta",
        "cousas o circunstancias",
        "curso y características",
        "estado actual del síntoma",
        "fenomenos o situaciones asociadas al síntoma",
        "estado civil",
        "tiene hijos",
        "como es su relacion con su pareja",
        "nombre de hijo/a",
        "edad dehijo/a",
        "vive con usted",
        "relacion con sus padres",
        "tiene hermanos",
        "aspectos relevantes de su infancia",
        "personas significativas en su vida",
        "trabaja actualmente",
        "donde trabaja y desde cuándo",
        "cantidad de personas dependen",
        "a que se debe (no trabaja)",
        "como se mantiene económicamente",
        "ha recibido terapia",
        "descripcion terapia anterior",
        "se relacionan las consultas",
        "ha recibido medicamentos psicofármaco",
        "que medicamento toma",
        "cuanto bebe",
        "actualmente bebe en exceso",
        "alguna vez falto al trabajo",
        "con que frecuencia",
        "ha reducido o eliminado el consumo de alcohol",
        "consumo de alcohol le ha causado problemas con otras personas",
        "Su consumo de alcohol le ha causado problemas psicológicos",
        "problemas o conflictos con alguien de su entorno",
        "Se ve envuelto en peleas",
        "Recibe burlas o humillaciones de parte de alguien de su entorno",
        "Recibe golpes o maltrato físico de parte de alguien de su entorno",
        "Recibe algún otro tipo de maltrato o abuso",
        "ha intentado quitarse la vida",
        "descripcion de la situación",
        "Qué hizo luego de sus intentos suicidas",
      ];
      dataInterviewAdultsArray.push(headers);
      for (const x of dataInterviewAdults) {
        dataInterviewAdultsArray.push([
          `${x.person.forename} ${x.person.surname}`,
          x.person.idQflow,
          `${x.responsableConsultation.forename} ${x.responsableConsultation.surname}`,
          x.dateInit,
          x.timeConsultation,
          x.reasonConsultation,
          x.firstTimeBad,
          x.causesOfProblem,
          x.symptomsCharacteristics,
          x.currentSymptoms,
          x.symptomPhenomenon,
          x.civilState,
          x.haveChildren,
          x.whatLikeRelation,
          x.nameSon,
          x.ageSon,
          x.liveWithYou,
          x.relationParents,
          x.hasBrother,
          x.relevantAspects,
          x.significantPerson,
          x.workActually,
          x.workDescription,
          x.dependents,
          x.notWorkDescription,
          x.howMaintainedEconomy,
          x.psychiatricTreatment,
          x.psychiatricTreatmentDescription,
          x.psychiatricConsultingPrevius,
          x.medicalPsiTreatment,
          x.whatsMedication,
          x.drinkFrequency,
          x.questionDrink,
          x.drinkAlcohol,
          x.frequencyAbsences,
          x.reduceDrink,
          x.drinkProblem,
          x.drinkProblemPsychological,
          x.abuseExist,
          x.fightsExist,
          x.ridiculeParents,
          x.physicalAbuseExist,
          x.otherAbuseExist,
          x.suicideAttempt,
          x.suicideAttemptDescription,
          x.whatDidAfterSuicideAttempts,
        ]);
      }
      //replace ; in values for ,
      dataInterviewAdultsArray = await replaceValues(dataInterviewAdultsArray);
      stringify(dataInterviewAdultsArray, (err, output) => {
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
    } catch (error) {
      console.log(error);
      response.status(500).json({
        status: "KO",
        message: "Error al generar CSV",
        documents: [],
      });
    }
  }
);

router.get(
  "/report/internist/:dateFrom/:dateTo/:ext",
  async (request, response) => {
    try {
      const dateFrom = moment(request.params.dateFrom, "DD-MM-YYYY").toDate();
      const dateTo = moment(request.params.dateTo, "DD-MM-YYYY").toDate();

      let dataInterviewAdults = await model.InternEvaluation.find({
        date: { $gte: dateFrom, $lte: dateTo },
      })
        .populate("person")
        .populate("responsible");

      let dataIternistArr = [];

      const headers = [
        "Paciente",
        "ID QFlow",
        "Responsable de consulta",
        "Fecha",
        "Tipo de consulta",
        "Diagnostico Preoperatorio",
        "Historia Clinica",
        "Antecedentes Personales",
        "PA",
        "FC",
        "FR",
        "SATO2",
        "Estado Fisico",
        "HT",
        "HB",
        "Plaquetas",
        "TP",
        "TPT",
        "INR",
        "Glucosa",
        "Elisa/VIH",
        "EGO",
        "HBA1C",
        "Radiografia Torax",
        "Electrocardiograma",
        "Comentarios",
        "Riesgo quirurgico",
        "Capacidad funcional",
        "Predictores clinicos",
        "Clasificasion ASA",
        "Plan",
      ];
      dataIternistArr.push(headers);
      for (const x of dataInterviewAdults) {
        dataIternistArr.push([
          `${x.person.forename} ${x.person.surname}`,
          x.person.idQflow,
          `${x.responsible.forename} ${x.responsible.surname}`,
          moment(x.date).format("DD/MM/YYYY"),
          x.appointmentType,
          x.preoperative_diagnosis,
          x.history_clinic,
          x.personal_record,
          x.pa,
          x.fc,
          x.fr,
          x.oxygen_saturation,
          x.physical_state,
          x.ht,
          x.hb,
          x.platelets,
          x.tp,
          x.tpt,
          x.inr,
          x.glucose,
          x.vih,
          x.ego,
          x.hba1c,
          x.radiography,
          x.electrocardiogram,
          x.comments,
          x.surgical_risk,
          x.functional_capacity,
          x.clinical_predictors,
          x.clasification_asa,
          x.plan,
        ]);
      }
      //replace ; in values for ,
      dataIternistArr = await replaceValues(dataIternistArr);
      stringify(dataIternistArr, (err, output) => {
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
    } catch (error) {
      console.log(error);
      response.status(500).json({
        status: "KO",
        message: "Error al generar CSV",
        documents: [],
      });
    }
  }
);

module.exports = router;
