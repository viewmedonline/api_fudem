let Grid = require("gridfs-stream");
let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");
let moment = require("moment");
const {
  create_report_pdf,
  signatura_base64,
  save_file,
  deleteFile,
} = require("./general_function.js");

router.post("/anesthesiology_sheet", async (request, response) => {
  try {
    if (request.body.data.digital_signature) {
      const signature = await signatura_base64(
        request.body.data.digital_signature
      );
      request.body.data.digital_signature = signature;
    }
    const pdf_data = await create_report_pdf(
      request.body.name,
      request.body.data
    );
    const report_id = await save_file(
      `anesthesiology_sheet_${request.body.data.patient}.pdf`,
      pdf_data
    );
    request.body.data.pdf = report_id;
    //save colletion
    const anesthesiology_sheet = new model.ReportAnesthesiology(
      request.body.data
    );
    await anesthesiology_sheet.save();

    let currentConsultation = new model.Consultation({
      person: request.body.data.patient,
      name: "Hoja de Anestesiologia",
      control: {
        active: false,
      },
       dateUpload: moment().format("YYYY-MM-DD HH:mm:ss"),
      file: report_id,
      responsableConsultation: request.body.data.responsible,
    });
    currentConsultation.save()

    response.json({
      status: "OK",
      message: null,
      documents: report_id,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: "KO",
      message: "Error creating report",
      documents: [],
    });
  }
});

router.get("/anesthesiology_sheet/:patientId", async (request, response) => {
  try {
    const anesthesiology_sheet = await model.ReportAnesthesiology.find({
      patient: request.params.patientId,
    }).sort({ date: -1, _id: -1 });

    response.json({
      status: "OK",
      message: null,
      documents: anesthesiology_sheet,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: "KO",
      message: "Error query",
      documents: [],
    });
  }
});

router.get(
  "/anesthesiology_sheet/recreate/pdf/:dateInit/:dateEnd",
  async (request, response) => {
    try {
      const dataList = await model.ReportAnesthesiology.find({
        date: {
          $gte: moment(request.params.dateInit, "DDMMYYYY").utc().toDate(),
          $lte: moment(request.params.dateEnd, "DDMMYYYY").utc().toDate(),
        },
      }).populate("patient responsible").lean();

      for (const x of dataList) {
        let data = {
          num_exp: x.patient.idQflow,
          pat_name: `${x.patient.forename} ${x.patient.surname}`,
          pat_age: moment().diff(x.patient.birthdate, "years"),
          pat_gender: x.patient.gender,
          date: moment().format("YYYY-MM-DD"),
          patient: x.patient._id,
          responsible: x.responsible._id,
          phy_name: `${x.responsible.forename} ${x.responsible.surname}`,
          digital_signature: x.responsible.digital_signature,
          operationDateFormat: x.operationDateFormat,
          operationDate: x.operationDate,
          operationTime: x.operationTime,
          preoperativeDiagnosis: x.preoperativeDiagnosis,
          MedicalHistory: x.MedicalHistory,
          typeAnesthesia: x.typeAnesthesia,
          anesthesiaTechnique: x.anesthesiaTechnique,
          asaClassification: x.asaClassification,
          VitalSigns: x.VitalSigns,
          medicines: x.medicines,
          solutions: x.solutions
        };

        if (data.digital_signature) {
          const signature = await signatura_base64(data.digital_signature);
          data.digital_signature = signature;
        }

        const pdf_data = await create_report_pdf(
          "anesthesiology_sheet.html",
          data
        );
        const report_id = await save_file(
          `anesthesiology_sheet_${data.patient}.pdf`,
          pdf_data
        );
        await deleteFile(x.pdf);
        await model.ReportAnesthesiology.updateOne(
          { _id: x._id },
          { pdf: report_id }
        );
      }

      response.json({
        status: "OK",
        message: null,
        documents: true,
      });
    } catch (error) {
      console.log(error);
      response.status(400).json({
        status: "KO",
        message: "Error creating report",
        documents: [],
      });
    }
  }
);

module.exports = router;
