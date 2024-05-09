let Grid = require("gridfs-stream");
let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");
const {
  create_report_pdf,
  signatura_base64,
  save_file,
} = require("./general_function.js");

router.post("/psi_process", async (request, response) => {
  try {
    console.log(request.body);
    const psi_process = new model.psyProcess(request.body);
    const psiId = await psi_process.save();

    response.json({
      status: "OK",
      message: null,
      documents: psiId._id,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: "KO",
      message: "Error save psi_process",
      documents: [],
    });
  }
});

//get rows active=true
router.get("/psi_process", async (request, response) => {
  try {
    const psi_process = await model.psyProcess.find({}).sort({ _id: -1 });
    response.json({
      status: "OK",
      message: null,
      documents: psi_process,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: "KO",
      message: "Error get psi_process",
      documents: [],
    });
  }
});

//update
router.put("/psi_process/:idRow", async (request, response) => {
  try {
    const psi_process = await model.psyProcess.findByIdAndUpdate(
      request.params.idRow,
      { $set: request.body.data },
    );
    response.json({
      status: "OK",
      message: null,
      documents: psi_process,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: "KO",
      message: "Error update psi_process",
      documents: [],
    });
  }
}
);

router.post("/psi_process/closed", async (request, response) => {
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
      `psiProcess_${request.body.data.patient}.pdf`,
      pdf_data
    );

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

module.exports = router;
