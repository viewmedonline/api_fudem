let Grid = require("gridfs-stream");
let mongoose = require("mongoose");
let express = require("express");
let router = express.Router();
let multiparty = require("multiparty");
const fs = require("fs");
const async = require("async");
let model = require("../model/database_schemas.js");
const {
  create_report_pdf,
  signatura_base64,
  save_file,
  deleteFile,
} = require("./general_function.js");

router.post("/report/save", async (request, response) => {
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
      `surgery_sheet_${request.body.data.patient}.pdf`,
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

router.post("/report/preview", async (request, response) => {
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
    response.contentType("application/pdf");
    response.send(pdf_data);
  } catch (error) {
    console.log(error);
  }
});

router.put("/store_file/:fileName", (request, response) => {
  let form = new multiparty.Form();

  Grid.mongo = mongoose.mongo;
  let conn = mongoose.connection;
  let gfs = Grid(conn.db);
  let fileName = request.params.fileName;
  let extension = fileName.split(".").pop();
  let contentType;
  let data;
  let fileId;

  if (extension === "pdf") {
    contentType = "application/pdf";
  } else {
    contentType = "image/" + extension;
  }

  // Create new file into MongoDB
  let writestream = gfs.createWriteStream({
    filename: fileName,
    content_type: contentType,
  });

  form.parse(request, function (err, fields, files) {
    if (typeof files == "object") {
      Object.keys(files).forEach(function (key) {
        async.series(
          [
            function (callback) {
              // Read file from file system and store content in MongoDB
              data = fs.createReadStream(files[key][0].path).pipe(writestream);
              callback(null, null);
            },
            function (callback) {
              data.on("close", function (file) {
                fileId = file._id;
                callback(null, null);
              });
            },
            function (callback) {
              data.on("finish", function (file) {
                callback(null, null);
              });
            },
          ],
          // optional callback
          async function (err, result) {
            await model.Chunks.updateOne(
              { files_id: fileId },
              { $set: { date: Date.now() } }
            );
            response.status(200).json({
              status: "OK",
              message: null,
              documents: [{ id: fileId }],
            });
          }
        );
      });
    } else {
      response.status(400).json({
        status: "KO",
        message: "File not Found",
        documents: [],
      });
    }
  });
});

router.get("/get_file/:fileId", (request, response) => {
  let fileId = request.params.fileId;

  // Assign mongoose driver to Grid
  Grid.mongo = mongoose.mongo;

  model.File.findById(fileId)
    .then((data) => {
      let conn = mongoose.connection;
      let gfs = Grid(conn.db);
      let fileId = request.params.fileId;

      // Check if the file exists in the database
      gfs.exist({ _id: fileId }, (err, found) => {
        if (err) {
          response.status(500).json({
            status: "KO",
            message: "Problems looking for the file",
            documents: [],
          });
        }
        if (!found) {
          response.status(400).json({
            status: "KO",
            message: "File not found",
            documents: [],
          });
        } else {
          // Search file from MongoDB
          let readstream = gfs.createReadStream({
            _id: fileId,
          });
          // Establish a tunnel between the source file and the destination file
          readstream.pipe(response);
        }
      });
    })
    .catch((error) => {
      console.log("Microservice[get_file]: " + error);
      response.status(400).json({
        status: "KO",
        message: "Document not found",
        documents: [],
      });
    });
});

//delete file
router.delete("/delete_file/:fileId", (request, response) => {
  const fileId = request.params.fileId;

  deleteFile(fileId)
    .then((result) => {
      if (result === "success") {
        // Verifica si la eliminación fue exitosa
        response.status(200).json({
          status: "OK",
          message: null,
          documents: [],
        });
      } else {
        // Si result no es 'success', significa que hubo un error
        response.status(400).json({
          status: "KO",
          message: result, // El mensaje de error se encuentra en 'result'
          documents: [],
        });
      }
    })
    .catch((error) => {
      console.log("Microservice[delete_file]: " + error);
      response.status(500).json({
        // Cambia a 500 para un error interno del servidor
        status: "KO",
        message: "Error al eliminar el archivo",
        documents: [],
      });
    });
});

module.exports = router;
