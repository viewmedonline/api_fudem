let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')

router.post('/records', (request, response) => {

      let currentRecord = new model.Record(request.body)

      currentRecord.save()
        .then(result =>{
          response.json({
            'status': 'OK',
            'message': null,
            'documents': [ result ]
          })
        })
        .catch(error =>{
          console.log('Microservice[record_insert]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Record not inserted',
            'documents': []
          })
        })
})

router.put('/records/:recordId', (request, response) => {

      model.Record.findByIdAndUpdate( request.params.recordId, request.body )
        .where('control.active').equals(true)
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': [ result ]
          })
        })
        .catch(error => {
          console.log('Microservice[record_update]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Record not found',
            'documents': []
          })
        })
})

router.get('/records/:recordId', (request, response) => {

      model.Record.find( {'_id': request.params.recordId} )
        .where('control.active').equals(true)
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': result
          })
        })
        .catch(error => {
          console.log('Microservice[record_query]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Exam not found',
            'documents': []
          })
        })
})

module.exports = router;
