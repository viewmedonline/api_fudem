let Grid = require('gridfs-stream')
let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
let moment = require('moment')
const { create_report_pdf, signatura_base64, save_file } = require('./general_function.js')


router.post('/anesthesiology_sheet', async (request, response) => {
    try {
        if (request.body.data.digital_signature) {
            const signature = await signatura_base64(
              request.body.data.digital_signature
            );
            request.body.data.digital_signature = signature;
          }
        const pdf_data = await create_report_pdf(request.body.name, request.body.data)
        const report_id = await save_file(`anesthesiology_sheet_${request.body.data.patient}.pdf`, pdf_data)
        request.body.data.pdf = report_id
        //save colletion
        const anesthesiology_sheet = new model.ReportAnesthesiology(request.body.data)
        await anesthesiology_sheet.save()

        response.json({
            'status': 'OK',
            'message': null,
            'documents': report_id
        })
    } catch (error) {
        console.log(error)
        response.status(400).json({
            'status': 'KO',
            'message': 'Error creating report',
            'documents': []
        })
    }
})

router.get('/anesthesiology_sheet/:patientId', async (request, response) => {
    try {
        const anesthesiology_sheet = await model.ReportAnesthesiology.find({patient:request.params.patientId}).sort({date:-1,_id:-1})

        response.json({
            'status': 'OK',
            'message': null,
            'documents': anesthesiology_sheet
        })
    } catch (error) {
        console.log(error)
        response.status(400).json({
            'status': 'KO',
            'message': 'Error query',
            'documents': []
        })
    }
})

module.exports = router;
