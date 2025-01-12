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
const mongoose = require('mongoose');

router.post("/nutritionist_sheet", async (request, response) => {
  try {
    if (request.body.data.digital_signature) {
      const signature = await signatura_base64(
        request.body.data.digital_signature
      );
      request.body.data.digital_signature = signature;
    }
    request.body.data.colitis = request.body.data.colitis ? "Afirma" : "Niega";
    request.body.data.gastritis = request.body.data.gastritis
      ? "Afirma"
      : "Niega";
    request.body.data.constipation = request.body.data.constipation
      ? "Afirma"
      : "Niega";
    request.body.data.diarrhea = request.body.data.diarrhea
      ? "Afirma"
      : "Niega";
    request.body.data.diabetes = request.body.data.diabetes
      ? "Afirma"
      : "Niega";
    request.body.data.hta = request.body.data.hta ? "Afirma" : "Niega";
    const pdf_data = await create_report_pdf(request.body.name, {
      ...request.body.data,
      date: moment().format("DD-MM-YYYY"),
    });
    const report_id = await save_file(
      `nutritionist_sheet_${request.body.data.patient}.pdf`,
      pdf_data
    );
    request.body.data.pdf = report_id;
    //save colletion
    const nutritionist_sheet = new model.NutritionalControl(request.body.data);
    await nutritionist_sheet.save();

    let currentConsultation = new model.Consultation({
      person: request.body.data.patient,
      name: "Hoja de Control Nutricional",
      control: {
        active: false,
      },
      dateUpload: moment().format("YYYY-MM-DD"),
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

router.get(
  "/nutritionist_sheet/recreate/pdf/:dateInit/:dateEnd",
  async (request, response) => {
    try {
      const nutritionistSheet = model.NutritionalControl;
      let dataList = await nutritionistSheet.find({
        date: {
          $gte: moment(request.params.dateInit, "DDMMYYYY").toDate(),
          $lte: moment(request.params.dateEnd, "DDMMYYYY").toDate(),
        },
      });

      for (const x of dataList) {
        let dataMed =
          (await model.Person.findOne({ _id: x.responsible })) || {};
        let dataPat = (await model.Person.findOne({ _id: x.patient })) || {};
        
        let data = {
          num_exp: dataPat.idQflow,
          pat_name: `${dataPat.forename} ${dataPat.surname}`,
          pat_age: moment().diff(moment(dataPat.birthdate), "years"),
          pat_gender: dataPat.gender,
          date: moment(x.date).utc().format("DD-MM-YYYY"),
          patient: x.patient,
          responsible: x.responsible,
          diagnosisRefer: x.diagnosisReference,
          colitis: x.colitis,
          gastritis: x.gastritis,
          constipation: x.constipation,
          diarrhea: x.diarrhea,
          diabetes: x.diabetes,
          hta: x.hta,
          otherRecords: x.other,
          previousSurgery: x.previousSurgeries,
          currentMedication: x.currentMedication,
          currentMedicationFrom: x.medicationSince,
          glycemia: x.glycemia,
          hemoglobin: x.hemoglobin,
          triglycerides: x.triglycerides,
          cholesterol: x.cholesterol,
          creatinine: x.creatine,
          uricAcid: x.uricAcid,
          albumin: x.albumin,
          hematocrit: x.hematocytes,
          glycosylatedh: x.hgli,
          hdl: x.hdl,
          sodium: x.sodium,
          ld: x.ld,
          calcium: x.calcium,
          magnesium: x.magnesium,
          unpleasantFoods: x.unpleasantFood,
          allergicFoods: x.allergicFood,
          intolerableFoods: x.intolerantFood,
          weight: x.weight,
          idealWeight: x.idealWeight,
          goalWeight: x.goalWeight,
          size: x.size,
          imc: x.imc,
          nutritionalStatus: x.nutritionalStatus,
          WaistCircumference: x.waistCircumference,
          cho: x.cho,
          chon: x.chon,
          cooh: x.cooh,
          prescribedDiet: x.prescribedDiet,
          comments: x.comments,
          lifestyle: x.itemsActivity,
          consumptionFrequency: x.itemsConsumption,
          phy_name: `${dataMed.forename} ${dataMed.surname}`,
          digital_signature: dataMed.digital_signature,
          clinicHistory: x.clinicHistory,
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
        };
        
        if (data.digital_signature) {
          const signature = await signatura_base64(data.digital_signature);
          data.digital_signature = signature;
        }
        data.colitis = data.colitis ? "Afirma" : "Niega";
        data.gastritis = data.gastritis ? "Afirma" : "Niega";
        data.constipation = data.constipation ? "Afirma" : "Niega";
        data.diarrhea = data.diarrhea ? "Afirma" : "Niega";
        data.diabetes = data.diabetes ? "Afirma" : "Niega";
        data.hta = data.hta ? "Afirma" : "Niega";
        const pdf_data = await create_report_pdf("nutritionist_sheet.html", {
          ...data,
          date: data.date,
        });
        const report_id = await save_file(
          `nutritionist_sheet_${data.patient}.pdf`,
          pdf_data
        );
        // data.pdf = report_id
        // // //save colletion
        // // const nutritionist_sheet = new model.NutritionalControl(data)
        // // await nutritionist_sheet.save()

        await model.NutritionalControl.updateOne(
          {
            _id: mongoose.Types.ObjectId(x._id),
          },
          {
            $set: {
              pdf: report_id,
            },
          }
        );

        await deleteFile(x.pdf);
        // console.log("old id", x.pdf);
        // console.log("new id", report_id);
        // console.log("type", typeof x.pdf);
        await model.Consultation.updateOne(
          {
            file: mongoose.Types.ObjectId(x.pdf),
          },
          {
            $set: {
              file: report_id,
            },
          }
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
