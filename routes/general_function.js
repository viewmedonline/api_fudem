let Grid = require("gridfs-stream");
let mongoose = require("mongoose");
let model = require("../model/database_schemas.js");
const { readFileSync } = require("fs");
const path = require("path");
// const pdf = require("html-pdf-node");
const Handlebars = require("handlebars");
const fs = require("fs").promises;
let stream = require("stream");
const puppeteer = require('puppeteer');

Handlebars.registerHelper("or", function (v1, v2, options) {
  if (v1 || v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper("incremented", function (index) {
  return index + 1;
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("ifNotEquals", function (arg1, arg2, options) {
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('indexGreaterThanFour', function (options) {
  return this['@index'] > 4;
});

const logo_fudem_base64 = readFileSync(
  path.join(__dirname, "..", "template_report", "logoFudem.jpg"),
  "base64"
);
const logo_form_1 = readFileSync(
  path.join(__dirname, "..", "template_report", "img-form-1.jpg"),
  "base64"
);
const logo_form_2 = readFileSync(
  path.join(__dirname, "..", "template_report", "img-form-2.png"),
  "base64"
);
const logo_form_3 = readFileSync(
  path.join(__dirname, "..", "template_report", "img-form-3.png"),
  "base64"
);
const logo_form_4 = readFileSync(
  path.join(__dirname, "..", "template_report", "img-form-4.png"),
  "base64"
);
const logo_form_5 = readFileSync(
  path.join(__dirname, "..", "template_report", "img-form-5.png"),
  "base64"
);

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
const signatura_base64 = async (fileId) => {
  Grid.mongo = mongoose.mongo;

  let data_base64 = await model.File.findById(fileId)
    .then(async (data) => {
      let conn = mongoose.connection;
      let gfs = Grid(conn.db);
      // let signature = null

      // Check if the file exists in the database
      const base64_signature = await new Promise((resolve, reject) => {
        gfs.exist({ _id: fileId }, async (err, found) => {
          let data_file = await model.File.findById(fileId);
          if (err) {
            reject(err);
          }
          // Search file from MongoDB
          let readstream = gfs.createReadStream({
            _id: fileId,
          });

          const buffer = await streamToBuffer(readstream);
          const base64 = `data:${
            data_file.contentType
          };base64,${buffer.toString("base64")}`;
          resolve(base64);
        });
      });
      return base64_signature;
    })
    .catch((error) => {
      console.log("Microservice[get_file]: " + error);
    });
  return data_base64;
};

const create_report_pdf = async (name, data, bottom = "1cm") => {
  try {
    // Launch a headless browser instance
    const browser = await puppeteer.launch({
      headless: 'new', // Use 'new' for improved security in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Load the HTML template
    const templatePath = path.join(__dirname, "..", "template_report", name);
    const templateHtml = await fs.readFile(templatePath, 'utf8');

    // Render the template with data
    const template_handler = Handlebars.compile(templateHtml);
    data.logo = logo_fudem_base64;
    if (name == "nutritionist_sheet.html") {
      data.logo_form_1 = logo_form_1;
      data.logo_form_2 = logo_form_2;
      data.logo_form_3 = logo_form_3;
      data.logo_form_4 = logo_form_4;
      data.logo_form_5 = logo_form_5;
    }
    const result_template = template_handler(data);

    // Set the HTML content of the page
    await page.setContent(result_template);

    // Configure page margins
    await page.setViewport({
      width: 612, // Letter size in pixels
      height: 792,
      deviceScaleFactor: 1,
    });
    await page.evaluate(() => {
      const { style } = document.body;
      style.margin = '1cm'; // Set margins dynamically
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: bottom,
        left: '1cm',
      },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error for proper handling
  }
};

const save_file = async (name, file_buffer) => {
  Grid.mongo = mongoose.mongo;
  let conn = mongoose.connection;
  let gfs = Grid(conn.db);
  let fileName = name;
  let contentType = "application/pdf";
  let fileId;
  // Create new file into MongoDB
  let writestream = gfs.createWriteStream({
    filename: fileName,
    content_type: contentType,
  });
  let data = file_buffer;
  let s = new stream.Readable();
  s.push(data);
  s.push(null);
  // Read file from file system and store content in MongoDB
  s.pipe(writestream);
  await new Promise((resolve, reject) => {
    writestream.on("close", function (file) {
      fileId = file._id;
      resolve(fileId);
    });
  });
  await model.Chunks.updateOne(
    { files_id: fileId },
    { $set: { date: Date.now() } }
  );
  return fileId;
};

const deleteFile = (id) => {
  Grid.mongo = mongoose.mongo;

  return model.File.findById(id)
    .then((data) => {
      const conn = mongoose.connection;
      const gfs = Grid(conn.db);

      return new Promise((resolve, reject) => {
        gfs.exist({ _id: id }, (err, found) => {
          if (err) {
            reject("Error al buscar el archivo"); // Manejo de error dentro de la promesa
          } else if (!found) {
            reject("Archivo no encontrado"); // Manejo de error dentro de la promesa
          } else {
            gfs.remove({ _id: id }, (err, gridStore) => {
              if (err) {
                reject("Error al eliminar el archivo"); // Manejo de error dentro de la promesa
              } else {
                resolve("success");
              }
            });
          }
        });
      });
    })
    .catch((error) => {
      console.log("Microservice[delete_file]: " + error);
      return "Documento no encontrado";
    });
};

module.exports = {
  signatura_base64,
  create_report_pdf,
  save_file,
  deleteFile,
};
