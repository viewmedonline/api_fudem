let Grid = require("gridfs-stream");
let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");
let moment = require("moment");
const fs = require('fs').promises;
const {
  create_report_pdf,
  signatura_base64,
  save_file,
} = require("./general_function.js");
const mongoose = require('mongoose');

router.post("/pediatrics_sheet", async (request, response) => {
  try {
    if (request.body.data.digital_signature) {
      const signature = await signatura_base64(
        request.body.data.digital_signature
      );
      request.body.data.digital_signature = signature;
    }

    const pdf_data = await create_report_pdf(
      request.body.name,
      { ...request.body.data, date: moment().format("DD-MM-YYYY") },
      "100px"
    );
    const report_id = await save_file(
      `pediatrics_sheet_${request.body.data.patient}.pdf`,
      pdf_data
    );
    request.body.data.pdf = report_id;
    //save colletion
    const pediatrics_sheet = new model.PediatricEvaluation(request.body.data);
    await pediatrics_sheet.save();

    let currentConsultation = new model.Consultation({
      person: request.body.data.patient,
      name: "Evaluación por médico pediatra",
      control: {
        active: false,
      },
       dateUpload: moment().format("YYYY-MM-DD HH:mm:ss"),
      file: report_id,
      responsableConsultation: request.body.data.responsible,
    });
    currentConsultation.save();

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

router.get("/pediatrics_sheet/recreate/pdf/:dateInit/:dateEnd", async (request, response) => {
  try {
    // const dataJson = JSON.parse(await fs.readFile(__dirname+"/pediatrics.json", 'utf8'));
    const pediatrisModel = model.PediatricEvaluation;

    // for (const item of dataJson) {
    //     await pediatrisModel.updateOne({_id:mongoose.Types.ObjectId(item._id)},{$set:{diagnosis:item.diagnoses}})
    // }
    
    let PediatricEvaluation = await pediatrisModel.find({date:{
      $gte: moment(request.params.dateInit, "DDMMYYYY").toDate(),
      $lte: moment(request.params.dateEnd, "DDMMYYYY").toDate(),
    }})

    
    for (const x of PediatricEvaluation) {
      let dataMed = await model.Person.findOne({ _id: x.responsible }) || {};
      let dataPat = await model.Person.findOne({ _id: x.patient }) || {};

      let objdata = {
        name: "pediatrics_evaluation.html",
        data: {
          pdf:"",
          num_exp: dataPat.idQflow,
          pat_name: `${dataPat.forename} ${dataPat.surname}`,
          pat_age: moment().diff(moment(dataPat.birthdate), "years"),
          pat_gender: dataPat.gender,
          date: moment(x.date).format("DD-MM-YYYY"),
          patient: x.patient,
          responsible: x.responsible,
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
          diagnosis: x.diagnosis,
          phy_name: `${dataMed.forename} ${dataMed.surname}`,
          digital_signature: dataMed.digital_signature,
        },
      };

      if (objdata.data.digital_signature) {
        const signature = await signatura_base64(
          objdata.data.digital_signature
        );
        objdata.data.digital_signature = signature;
      }
      const pdf_data = await create_report_pdf(
        objdata.name,
        { ...objdata.data, date: objdata.data.date },
        "100px"
      );
      const report_id = await save_file(
        `pediatrics_sheet_${objdata.data.patient}.pdf`,
        pdf_data
      );
      //save colletion
      console.log("old id",x.pdf);
      console.log("new id",report_id);

      await model.PediatricEvaluation.updateOne(
        { _id: mongoose.Types.ObjectId(x._id) },
        { $set: { pdf: report_id } }
      );

      await model.Consultation.updateOne(
        { file: x.pdf },
        { $set: { file: report_id } }
      );
    }

    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ success: false });
  }
});

module.exports = router;
