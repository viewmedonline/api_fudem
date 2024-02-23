let Grid = require('gridfs-stream')
let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
let moment = require('moment')
const { create_report_pdf, signatura_base64, save_file } = require('./general_function.js')


router.post('/nutritionist_sheet', async (request, response) => {
    try {
        if (request.body.data.digital_signature) {
            const signature = await signatura_base64(
              request.body.data.digital_signature
            );
            request.body.data.digital_signature = signature;
          }
        request.body.data.colitis = request.body.data.colitis ? 'Afirma' : 'Niega'
        request.body.data.gastritis = request.body.data.gastritis ? 'Afirma' : 'Niega'
        request.body.data.constipation = request.body.data.constipation ? 'Afirma' : 'Niega'
        request.body.data.diarrhea = request.body.data.diarrhea ? 'Afirma' : 'Niega'
        request.body.data.diabetes = request.body.data.diabetes ? 'Afirma' : 'Niega'
        request.body.data.hta = request.body.data.hta ? 'Afirma' : 'Niega'
        const pdf_data = await create_report_pdf(request.body.name, {...request.body.data, date: moment().format("DD-MM-YYYY")})
        const report_id = await save_file(`nutritionist_sheet_${request.body.data.patient}.pdf`, pdf_data)
        request.body.data.pdf = report_id
        //save colletion
        const nutritionist_sheet = new model.NutritionalControl(request.body.data)
        await nutritionist_sheet.save()

        let currentConsultation = new model.Consultation({
            person: request.body.data.patient,
            name: "Hoja de Control Nutricional",
            control: {
              active: false,
            },
            dateUpload: moment().format("YYYY-MM-DD"),
            file: report_id,
            responsableConsultation: request.body.data.responsible,
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
