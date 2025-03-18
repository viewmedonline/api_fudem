let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");

router.post("/medicines", (request, response) => {
  let currentMedicine = new model.Medicines(request.body);
  currentMedicine
    .save()
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[Medicine_insert]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Medicine not inserted",
        documents: [],
      });
    });
});

//get all medicines
router.get("/medicines/:type/:all?", (request, response) => {
  let obj = { type: parseInt(request.params.type) };
  if (!request.params.all) {
    obj.active = true;
  }
  model.Medicines.find(obj)
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[Medicine_query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Medicine not found",
        documents: [],
      });
    });
});

//update medicine
router.put("/medicines/:medicineId", (request, response) => {
  model.Medicines.updateOne(
    { _id: request.params.medicineId },
    { $set: request.body }
  )
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[Medicine_update]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Medicine not updated",
        documents: [],
      });
    });
});

router.post("/prescription", (request, response) => {
  let currentPrescription = new model.Prescription(request.body);
  currentPrescription
    .save()
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[Prescription_insert]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Prescription not inserted",
        documents: [],
      });
    });
});

// get prescription by _id
router.get("/prescription/:id", (request, response) => {
  model.Prescription.findById(request.params.id).populate("responsible")
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: [result],
      });
    })
    .catch((error) => {
      console.log("Microservice[Prescription_Query]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Prescription not Query",
        documents: [],
      });
    });
});

router.put("/prescription/:id", (request, response) => {
  model.Prescription.updateOne(
    { _id: request.params.id },
    { $set: request.body }
  )
    .then((result) => {
      response.json({
        status: "OK",
        message: null,
        documents: result,
      });
    })
    .catch((error) => {
      console.log("Microservice[Prescription_update]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Prescription not updated",
        documents: [],
      });
    });
});

module.exports = router;
