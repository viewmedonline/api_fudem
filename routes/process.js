let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')

router.post('/consultations/insert', (request, response) => {
      let currentConsultation = new model.Consultation(request.body)
      currentConsultation.save()
        .then(result =>{
          response.json({
            'status': 'OK',
            'message': null,
            'documents': [ result ]
          })
        })
        .catch(error =>{
          console.log('Microservice[Consultation_insert]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Consultation not inserted',
            'documents': []
          })
        })
})

router.put('/consultation/:consultationId', (request, response) => {

      model.Consultation.findByIdAndUpdate( {'_id':request.params.consultationId}, request.body )
        .where('control.active').equals(true)
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': [ result ]
          })
        })
        .catch(error => {
          console.log('Microservice[consultation_update]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Record not found',
            'documents': []
          })
        })
})

router.get('/consultation/:consultationId', (request, response) => {
      model.Consultation.find( {'_id': request.params.consultationId} )
        .where('control.active').equals(true)
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': result
          })
        })
        .catch(error => {
          console.log('Microservice[consultation_query]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Consultation not found',
            'documents': []
          })
        })
})
router.post('/consultations/:active', (request, response) => {
      let currentConsultation = model.Consultation
      currentConsultation.find( request.body )
        .where('control.active').equals(request.params.active)
        .sort({ 'datetime': -1 })
        .populate( 'person')
        .populate('file')
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': result
          })
          mongoose.connection.close()
        })
        .catch(error =>{
          console.log('Microservice[consultation_query]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'ConsultationNotFound',
            'documents': []
          })
          mongoose.connection.close()
        })
})


module.exports = router;
