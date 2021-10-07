let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')

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