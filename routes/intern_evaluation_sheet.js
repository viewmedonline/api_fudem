let Grid = require("gridfs-stream");
let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");
let moment = require("moment")
const {
  create_report_pdf,
  signatura_base64,
  save_file,
  deleteFile
} = require("./general_function.js");
const mongoose = require('mongoose');

router.post("/evaluation", async (request, response) => {
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
      `intern_evaluation_${request.body.data.person}.pdf`,
      pdf_data
    );
    request.body.data.pdf = report_id;
    //save colletion
    request.body.data.date = moment().utc().toDate();
    const surgery_sheet = new model.InternEvaluation(request.body.data);
    await surgery_sheet.save();

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

router.get("/internist/recreate/pdf/:dateInit/:dateEnd", async (request, response) => {
  try {
    const internistEvaluation = model.InternEvaluation;   
    let dataList = await internistEvaluation.aggregate(
      [
        {
        $addFields: {
          fechaConvertida: {
            $dateFromString: {
              dateString: "$date",
              format: "%d/%m/%Y"
            }
          }
        }
      },
      {
        $match: {
          fechaConvertida: {
            $gte: moment(request.params.dateInit,"DDMMYYYY").toDate(),
            $lte: moment(request.params.dateEnd,"DDMMYYYY").toDate()
          }
        }
      }
    ]
    ).exec();
    
    for (const x of dataList) {
      let dataMed = await model.Person.findOne({ _id: x.responsible }) || {};
      let dataPat = await model.Person.findOne({ _id: x.person }) || {};

      let objdata = {
        name: "intern_evaluation.html",
        data: {
          date: x.date,
          num_exp: dataPat.idQflow,
          pat_name: `${dataPat.forename} ${dataPat.surname}`,
          pat_age: moment().diff(moment(dataPat.birthdate), "years"),
          pat_gender: dataPat.gender,
          preoperative_diagnosis:x.preoperative_diagnosis,
          history_clinic:x.history_clinic,
          personal_record:x.personal_record,
          pa:x.pa,
          fc:x.fc,
          fr:x.fr,
          oxygen_saturation:x.oxygen_saturation,
          physical_state:x.physical_state,
          ht:x.ht,
          hb:x.hb,
          platelets:x.platelets,
          tp:x.tp,
          tpt:x.tpt,
          inr:x.inr,
          glucose:x.glucose,
          vih:x.vih,
          ego:x.ego,
          hba1c:x.hba1c,
          radiography:x.radiography,
          electrocardiogram:x.electrocardiogram,
          comments:x.comments,
          surgical_risk:x.surgical_risk,
          functional_capacity:x.functional_capacity,
          clinical_predictors:x.clinical_predictors,
          clasification_asa:x.clasification_asa,
          plan:x.plan,
          physician_signature:dataMed.digital_signature,
          phy_name: `${dataMed.forename} ${dataMed.surname}`,
          responsible: x.responsible,
          person: x.person
        }
      };

      if (objdata.data.physician_signature) {
        const signature = await signatura_base64(
          objdata.data.physician_signature
        );
        objdata.data.digital_signature = signature;
      }
      const pdf_data = await create_report_pdf(
        objdata.name,
        { ...objdata.data, date: objdata.data.date }
      );
      const report_id = await save_file(
        `intern_evaluation_${objdata.data.patient}.pdf`,
        pdf_data
      );
      //save colletion
      console.log("old id",x.pdf);
      console.log("new id",report_id);

      await internistEvaluation.updateOne(
        { _id: mongoose.Types.ObjectId(x._id) },
        { $set: { pdf: report_id } }
      );
      
      await deleteFile(x.pdf)

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
