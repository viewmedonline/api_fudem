let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')

router.post('/imaging/insert', (request, response) => {
      let currentImaging = new model.Imaging(request.body)
      currentImaging.save()
        .then(result =>{
          response.json({
            'status': 'OK',
            'message': null,
            'documents': [ result ]
          })
        })
        .catch(error =>{
          console.log('Microservice[Imaging_insert]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Imaging not inserted',
            'documents': []
          })
        })
})


router.get('/imaging/:personId', (request, response) => {
      model.Imaging.find( {'person': request.params.personId} )
        .where('control.active').equals(true)
        .populate('file')
        .then(result => {
          response.json({
            'status': 'OK',
            'message': null,
            'documents': result
          })
        })
        .catch(error => {
          console.log('Microservice[Imaging_query]: ' + error)
          response.status(400).json({
            'status': 'KO',
            'message': 'Imaging not found',
            'documents': []
          })
        })
})
router.put('/imaging/delete/:imageId', (request, response) => {

  model.Imaging.findByIdAndUpdate( request.params.imageId, {$set:request.body} )
  .where('control.active').equals(true)
  .sort({ 'dateImagin': -1 })
  .then(result => {
    if (result) {
      response.json({
        'status': 'OK',
        'message': null,
        'documents': [ result ]
      })
    } else {
      response.status(200).json({
        'status': 'KO',
        'message': "ImaginNotFound",
        'documents': []
      })
    }

  }).catch(error => {
    // there were problems updating the person
    console.log('Microservice[Imagin_update]: ' + error)
    response.status(400).json({
      'status': 'KO',
      'message': 'ImaginUpdatingProblem',
      'documents': null
    })
  })
})

module.exports = router;
