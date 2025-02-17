let Grid = require("gridfs-stream");
let express = require("express");
let router = express.Router();
let model = require("../model/database_schemas.js");

router.get("/master/consumed", async (request, response) => {
  try {
    let consumed = await model.consumedMaster
      .find({ active: true })
      .sort({ description: -1 });
    consumed = consumed.map((x) => x.description);
    response.json({
      status: "OK",
      message: null,
      documents: consumed,
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

router.get("/master/activity", async (request, response) => {
  try {
    let activity = await model.activityMaster
      .find({ active: true })
      .sort({ _id: 1 });
    activity = activity.map((x) => x.description);
    response.json({
      status: "OK",
      message: null,
      documents: activity,
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

router.get("/master/lenses", async (request, response) => {
  try {
    let lenses = await model.Lens.find({ active: true }).sort({ _id: 1 });
    response.json({
      status: "OK",
      message: null,
      documents: lenses,
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

router.get("/master/consultations", async (request, response) => {
  try {
    let consultations = await model.MasterConsultation.find({
      active: true,
    }).sort({ _id: 1 });
    response.json({
      status: "OK",
      message: null,
      documents: consultations,
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

router.get("/master/medicine_presentation", async (request, response) => {
  try {
    let presentations = await model.MedicinePresentation.find({
      active: true,
    }).sort({ _id: 1 });
    response.json({
      status: "OK",
      message: null,
      documents: presentations,
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

router.get("/master/medicine_administration", async (request, response) => {
  try {
    let administrations = await model.MedicineAdministration.find({
      active: true,
    }).sort({ _id: 1 });
    response.json({
      status: "OK",
      message: null,
      documents: administrations,
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

module.exports = router;
