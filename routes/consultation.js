let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");

router.post("/consultations/insert", (request, response) => {
  let currentConsultation = new model.Consultation(request.body);
  currentConsultation
    .save()
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[Consultation_insert]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Consultation not inserted",
        documents: [],
      });
    });
});

router.put("/consultation/:consultationId", (request, response) => {
  model.Consultation.findByIdAndUpdate(
    { _id: request.params.consultationId },
    request.body
  )
    .where("control.active")
    .equals(true)
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_update]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Record not found",
        documents: [],
      });
    });
});

router.get("/consultation/:consultationId", (request, response) => {
  model.Consultation.find({ _id: request.params.consultationId })
    .where("control.active")
    .equals(true)
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Consultation not found",
        documents: [],
      });
    });
});
router.post("/consultations/:active", (request, response) => {
  let currentConsultation = model.Consultation;
  currentConsultation
    .find(request.body)
    .where("control.active")
    .equals(request.params.active)
    .sort({ "control.created_at": -1 })
    .populate("person")
    .populate("File")
    .populate(
      "responsableConsultation",
      "forename surname role digital_signature"
    )
    .populate("digital_signature")
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
      //mongoose.connection.close()
    })
    .catch((error) => {
      console.log("Microservice[consultation_query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "ConsultationNotFound",
        documents: [],
      });
      //mongoose.connection.close()
    });
});
router.delete("/consultation/:consultationId", (request, response) => {
  model.Consultation.deleteOne({ _id: request.params.consultationId })
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_delete]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Consultation not found",
        documents: [],
      });
    });
});
router.post("/consultationsLast", (request, response) => {
  console.log("Microservice[consultationsLast]: " + request.body);
  if (Object.keys(request.body).length === 0) {
    response.status(400).json({
      status: "KO",
      message: "Missing parameters",
      documents: [],
    });
    return;
  }
  let currentConsultation = model.Consultation;
  request.body.name = { $exists: false };
  currentConsultation
    .find(request.body)
    .where("control.active")
    .equals(false)
    .sort({ "control.created_at": -1 })
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result[0],
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "ConsultationNotFound",
        documents: [],
      });
      //mongoose.connection.close()
    });
});
router.post("/consultationsReport", (request, response) => {
  let currentConsultation = model.Consultation;

  obj = request.body;
  obj2 = request.body.dataReturn;

  delete obj.specialty;
  delete obj.dataReturn;

  currentConsultation
    .find(obj, obj2)
    .sort({ "control.created_at": -1 })
    .populate(
      "person",
      "forename surname idQflow gender birthdate housinglocation"
    )
    .populate("responsableConsultation", "forename surname role")
    .populate("prescription")
    .populate("prescription_of")
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_report]: " + error);
      response.status(400).json({
        status: "KO",
        message: "ConsultationNotFound",
        documents: [],
      });
      //mongoose.connection.close()
    });
});
router.post("/consultationsUpdate", (request, response) => {
  let currentConsultation = model.Consultation;

  obj = request.body;
  /*obj2 = request.body.dataReturn


    delete obj.specialty
    delete obj.dataReturn*/

  currentConsultation
    .find(obj)
    .sort({ "control.created_at": -1 })
    //.populate('person', 'forename surname idQflow gender birthdate housinglocation')
    //.populate('responsableConsultation', 'forename surname role')
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_report]: " + error);
      response.status(400).json({
        status: "KO",
        message: "ConsultationNotFound",
        documents: [],
      });
      //mongoose.connection.close()
    });
});
router.put("/consultationUpdate/:consultationId", (request, response) => {
  model.Consultation.findByIdAndUpdate(
    { _id: request.params.consultationId },
    request.body
  )
    .where("control.active")
    .equals(false)
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_update]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Record not found",
        documents: [],
      });
    });
});
router.get("/consultationClose", (request, response) => {
  model.Consultation.update({}, { "control.active": false }, { multi: true })
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[consultation_update]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Record not found",
        documents: [],
      });
    });
});
module.exports = router;
