let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
const { signatura_base64, create_report_pdf, save_file } = require('./general_function.js')


router.post('/constancy/insert', (request, response) => {
    let currentConstancy = new model.Constancy(request.body)
    console.log(request.body)
    currentConstancy.save()
        .then(result => {
            response.json({
                'status': 'OK',
                'message': null,
                'documents': [result]
            })
        })
        .catch(error => {
            console.log('Microservice[Constancy_insert]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'Constancy not inserted',
                'documents': []
            })
        })
})
router.post('/constancy/insert/pdf', async (request, response) => {
    if (request.body.data.digital_signature) {
        const signature = await signatura_base64(
          request.body.data.digital_signature
        );
        request.body.data.digital_signature = signature;
      }
    const pdf_data = await create_report_pdf(request.body.name, request.body.data)
    const report_id = await save_file(`constancy_${request.body.data.patient}.pdf`, pdf_data)

    let currentConstancy = new model.Constancy({
        person: request.body.data.patient,
        description: "",
        date: request.body.data.date,
        pdf: report_id,
        responsableconstancy: request.body.data.responsible,
        control: request.body.data.control
    })
    currentConstancy.save()
        .then(result => {
            response.json({
                'status': 'OK',
                'message': null,
                'documents': [result]
            })
        })
        .catch(error => {
            console.log('Microservice[Constancy_insert_pdf]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'Constancy pdf not inserted',
                'documents': []
            })
        })
})
router.put('/constancy', (request, response) => {
    let obj = new Object()
    let query = null;
  
    if (request.body.person)
        obj.person = request.body.person

    model.Constancy.find(obj)
        .populate('person')
        .populate('responsableconstancy', 'forename surname role digital_signature')
        .populate('digital_signature')
        .where('control.active').equals(false)
        .sort({ 'date': -1 })
        .sort({ 'control.created_at': -1 })
        .then(result => {
            response.json({
                'status': 'OK',
                'message': null,
                'documents': result
            })
        })
        .catch(error => {
            console.log('Microservice[constancy_query]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'Constancy not found',
                'documents': []
            })
        })
})
module.exports = router;