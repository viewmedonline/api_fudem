let Grid = require('gridfs-stream')
let mongoose = require('mongoose')
let model = require('../model/database_schemas.js')
const { readFileSync } = require("fs");
const path = require('path');
const pdf = require("html-pdf-node");
const Handlebars = require('handlebars');
const fs = require('fs').promises;
let stream = require('stream');

const logo_fudem_base64 = readFileSync(path.join(__dirname, '..', 'template_report', 'logoFudem.jpg'), 'base64');

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};
const signatura_base64 = async (fileId) => {
    Grid.mongo = mongoose.mongo

    let data_base64 = await model.File.findById(fileId)
        .then(async data => {

            let conn = mongoose.connection
            let gfs = Grid(conn.db)
            // let signature = null

            // Check if the file exists in the database
            const base64_signature = await new Promise((resolve, reject) => {
                gfs.exist({ _id: fileId }, async (err, found) => {
                    let data_file = await model.File.findById(fileId)
                    if (err) {
                        reject(err);
                    }
                    // Search file from MongoDB
                    let readstream = gfs.createReadStream({
                        _id: fileId
                    });

                    const buffer = await streamToBuffer(readstream);
                    const base64 = `data:${data_file.contentType};base64,${buffer.toString('base64')}`;
                    resolve(base64);
                });
            });
            return base64_signature
        })
        .catch(error => {
            console.log('Microservice[get_file]: ' + error)
        })
    return data_base64
}

const create_report_pdf = async (name, data, bottom = "2cm") => {
    try {
        const templatePath = path.join(__dirname, '..', 'template_report', name);
        let file_html = await fs.readFile(templatePath, "utf8");
        // const templateHtml = fs.readFileSync(templatePath, 'utf8');
        let options = {
            format: "letter",
            orientation: "portrait", // portrait or landscape
            margin: {
                top: "1cm", // default is 0, units: mm, cm, in, px
                right: "2cm",
                bottom: bottom,
                left: "1cm",
            },
        };
        let template_handler = Handlebars.compile(file_html);
        data.logo = logo_fudem_base64;
        let result_template = template_handler(data);
        return await pdf.generatePdf({ content: result_template }, options)

    } catch (error) {
        console.log(error)
    }

}

const save_file = async (name, file_buffer) => {

    Grid.mongo = mongoose.mongo
    let conn = mongoose.connection
    let gfs = Grid(conn.db)
    let fileName = name
    let contentType = "application/pdf"
    let fileId;
    // Create new file into MongoDB
    let writestream = gfs.createWriteStream({
        filename: fileName,
        content_type: contentType
    })
    let data = file_buffer
    let s = new stream.Readable();
    s.push(data);
    s.push(null);
    // Read file from file system and store content in MongoDB
    s.pipe(writestream)
    await new Promise((resolve, reject) => {
        writestream.on('close', function (file) {
            fileId = file._id
            resolve(fileId)
        })
    })
    return fileId




}


module.exports = {
    signatura_base64,
    create_report_pdf,
    save_file
}