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

module.exports = router;
