let Grid = require('gridfs-stream')
let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
let moment = require('moment')
const { create_report_pdf, signatura_base64, save_file } = require('./general_function.js')


router.post('/pediatrics_sheet', async (request, response) => {
    try {
        if (request.body.data.digital_signature) {
            const signature = await signatura_base64(
              request.body.data.digital_signature
            );
            request.body.data.digital_signature = signature;
          }
        const pdf_data = await create_report_pdf(request.body.name, request.body.data)
        const report_id = await save_file(`pediatrics_sheet_${request.body.data.person}.pdf`, pdf_data)
        request.body.data.pdf = report_id
        //save colletion
        const pediatrics_sheet = new model.PediatricEvaluation(request.body.data)
        await pediatrics_sheet.save()

        let currentConsultation = new model.Consultation({
            person: request.body.data.person,
            name: "Evaluación por médico pediatra",
            control: {
              active: false,
            },
            dateUpload: moment().format("YYYY-MM-DD"),
            file: report_id,
            responsableConsultation: request.body.data.phy_id,
        })
        currentConsultation.save()

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

module.exports = router;