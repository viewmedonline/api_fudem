let Grid = require('gridfs-stream')
let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
const { create_report_pdf, signatura_base64, save_file } = require('./general_function.js')


router.post('/surgery_sheet', async (request, response) => {
    try {
        const signature = await signatura_base64(request.body.data.physician_signature)
        request.body.data.digital_signature = signature
        const pdf_data = await create_report_pdf(request.body.name, request.body.data)
        const report_id = await save_file(`surgery_sheet_${request.body.data.num_exp}.pdf`, pdf_data)
        request.body.data.pdf = report_id
        //save colletion
        const surgery_sheet = new model.SurgerySheet(request.body.data)
        await surgery_sheet.save()

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
