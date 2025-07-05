let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");
const {
  signatura_base64,
  create_report_pdf,
  save_file,
} = require("./general_function.js");
const moment = require("moment");

router.post("/reference", async (request, response) => {
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
    `reference_${request.body.data.patient}.pdf`,
    pdf_data
  );
  let currentReferenceSheet = new model.Reference({
    content: request.body.data.content,
    patient: request.body.data.patient,
    responsible: request.body.data.responsible,
    pdf: report_id,
  });
  currentReferenceSheet
    .save()
    .then((result) => {
      let currentConsultation = new model.Consultation({
        person: request.body.data.patient,
        name: "Hoja de Referencia",
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
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[User_insert]: " + error);
      response.status(400).json({
        status: "KO",
        message: "UserNotInserted",
        documents: [],
      });
    });
});

router.get("/references/:idUser", async (request, response) => {
  let query_obj = { patient: request.params.idUser };
  let query = model.Reference.find(query_obj).sort({
    "control.created_at": -1,
  });
  query
    .then(async (result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[User_query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "UserNotFound",
        documents: [],
      });
    });
});

router.delete("/reference/:idSheet", async (request, response) => {
  let query = model.Reference.deleteOne({ _id: request.params.idSheet });
  query
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[Reference_delete]: " + error);
      response.status(400).json({
        status: "KO",
        message: "referenceDeleteError",
        documents: [],
      });
    });
});

module.exports = router;
