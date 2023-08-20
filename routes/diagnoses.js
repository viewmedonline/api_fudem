let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js');
const { log } = require('handlebars');
const mongoose = require('mongoose');

router.put('/diagnoses', (request, response) => {

      let code = null
      let doc = new Object()

      if( typeof(request.body.level) == "number" )
        doc.level = request.body.level
      if( typeof(request.body.code) == "string" ) {
        code = request.body.code

        if( code.indexOf('-') == -1 )
          doc.code = new RegExp(code, 'i')
        else {
          let coderange = new Object()
          coderange.$gte = code.substring( 0, code.indexOf('-') )
          coderange.$lte = code.substring( code.indexOf('-')+1 )
          doc.code = coderange
        }
      }

      model.ICD10DiagnosisFudem.find(doc)
        .select("-control")
      .where('control.active').equals(true)
        .sort({ "diagnostic.es": 1 })
      .then(result => {

        if (result) {

          response.status(200).json({
            'status': 'OK',
            'message': null,
            'documents': result
          })

        } else {
          // There was a problem while searching for the requested documents.
          response.status(400).json({
            'status': 'KO',
            'message': 'DiagnosisSearchingProblem',
            'documents': []
          })
        }

      })
      .catch(error => {

        console.log('Microservice[get_diagnoses]: ' + error)
        response.status(500).json({
          'status': 'KO',
          'message': 'DiagnosisNotFound',
          'documents': []
        })

      })
})

const generarCadenaUnica = () => {
  let marcaDeTiempo = Date.now().toString(36);
  return marcaDeTiempo.slice(-7);
}

//diagnoses upsert
router.post('/diagnoses', (request, response) => {
  let current_diagnosis = request.body
  if (!current_diagnosis._id) {
    current_diagnosis.code = generarCadenaUnica()
    current_diagnosis = new model.ICD10DiagnosisFudem(current_diagnosis)
  } else {
    current_diagnosis._id = mongoose.Types.ObjectId(current_diagnosis._id)
  }
  model.ICD10DiagnosisFudem.findOneAndUpdate({ code: current_diagnosis.code }, current_diagnosis, { upsert: true, new: true }).
    then(result => {
      response.status(200).json({
        'status': 'OK',
        'message': null,
        'documents': [result]
      })
    }).catch(error => {
      console.log('Microservice[diagnosis_insert]: ' + error);
      response.status(500).json({
        'status': 'KO',
        'message': 'DiagnosisNotInserted',
        'documents': []
      })
    })
})

module.exports = router;
