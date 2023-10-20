let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
const { signatura_base64, create_report_pdf, save_file } = require('./general_function.js')
const moment = require('moment')

router.post('/nurse_sheet', async (request, response) => {
  let currentNurseSheet = new model.nurseSheet({
    patient: request.body.patient,
    age: request.body.age,
    date_sheet: request.body.date_sheet,
    heart_rate: request.body.heart_rate,
    blood_pressure: request.body.blood_pressure,
  })
  currentNurseSheet.save()
    .then(result => {
      response.json({
        'status': 'OK',
        'message': null,
        'documents': [result]
      })

    }).catch(error => {
      console.log('Microservice[User_insert]: ' + error)
      response.status(400).json({
        'status': 'KO',
        'message': 'UserNotInserted',
        'documents': []
      })

    })
})

router.get('/nurse_sheet/:idUser/:idSheet?', async (request, response) => {

  let query_obj = { 'patient': request.params.idUser }
  if (request.params.idSheet) {
    query_obj._id = request.params.idSheet
  }
  let query = model.nurseSheet.find(query_obj).populate('notes_nurses.responsible', '_id forename surname digital_signature')
  query.then(async result => {
    result = await Promise.all(result.map(async item => {
      let notes = await Promise.all(item.notes_nurses.map(async note => {
        const signature = await signatura_base64(note.responsible.digital_signature)
        console.log(signature);
        const obj_responsible = {
          _id: note.responsible._id,
          forename: note.responsible.forename,
          surname: note.responsible.surname,
          digital_signature: signature
        }
        return {
          _id: note._id,
          note: note.note,
          date: note.date,
          responsible: obj_responsible
        }
      }))
      let obj = {
        _id: item._id,
        name: "Hoja de Enfermeria",
        patient: item.patient,
        age: item.age,
        pdf: item.pdf,
        date: item.date_sheet,
        heart_rate: item.heart_rate,
        blood_pressure: item.blood_pressure,
        notes_nurses: notes
      }
      return obj
    }))
    response.json({
      'status': 'OK',
      'message': null,
      'documents': result
    })
  }).catch(error => {
    console.log('Microservice[User_query]: ' + error)
    response.status(400).json({
      'status': 'KO',
      'message': 'UserNotFound',
      'documents': []
    })
  })
})

router.put('/nurse_sheet/:idSheet', async (request, response) => {
  let query = model.nurseSheet.updateOne({ _id: request.params.idSheet }, { $set: request.body })
  query.then(result => {
    response.json({
      'status': 'OK',
      'message': null,
      'documents': [result]
    })
  }).catch(error => {
    console.log('Microservice[User_update]: ' + error)
    response.status(400).json({
      'status': 'KO',
      'message': 'UserUpdatingProblem',
      'documents': []
    }) 
  })
})

router.put('/nurse_sheet/note/:idSheet', async (request, response) => {
  console.log(request.params.idSheet);
  let query = model.nurseSheet.findByIdAndUpdate(request.params.idSheet, { $push: { notes_nurses: request.body } })
  query.then(result => {
    response.json({
      'status': 'OK',
      'message': null,
      'documents': [result]
    })
  }).catch(error => {
    console.log('Microservice[User_update]: ' + error)
    response.status(400).json({
      'status': 'KO',
      'message': 'UserUpdatingProblem',
      'documents': []
    })
  })
})

router.delete('/nurse_sheet/:idSheet', async (request, response) => {
  let query = model.nurseSheet.deleteOne({ _id: request.params.idSheet })
  query.then(result => {
    response.json({
      'status': 'OK',
      'message': null,
      'documents': [result]
    })
  }).catch(error => {
    console.log('Microservice[User_delete]: ' + error)
    response.status(400).json({
      'status': 'KO',
      'message': 'UserDeletingProblem',
      'documents': []
    })
  })
})

router.put('/nurse_sheet/close/:idSheet', async (request, response) => {
  try {
    let data_sheet = (await model.nurseSheet.findById(request.params.idSheet).populate("patient", "forename surname id_document idQflow").populate({
      path: 'notes_nurses',
      populate: {
        path: 'responsible',
        select: '_id forename surname digital_signature'
      },

    })).toObject()

    data_sheet.notes_nurses = await Promise.all(data_sheet.notes_nurses.map(async item => {
      let newItem = { ...item };

      newItem.responsible.digital_signature = await signatura_base64(item.responsible.digital_signature)
      newItem.date = moment(item.date).format('DD/MM/YYYY hh:mm a')
      return newItem
    }))
    ///creacion de reporte pdf
    let data_report = {
      name: `${data_sheet.patient.forename} ${data_sheet.patient.surname}`,
      age: data_sheet.age,
      date: moment(data_sheet.date_sheet).format('DD/MM/YYYY'),
      exp: data_sheet.patient.idQflow,
      dui: data_sheet.patient.id_document,
      heart_rate: data_sheet.heart_rate,
      blood_pressure: data_sheet.blood_pressure,
      notes_nurses: data_sheet.notes_nurses,
    }

    const report_pdf = await create_report_pdf('nurse_sheet.html', data_report)
    const report_id = await save_file(`nurse_sheet_${data_sheet.patient.idQflow}.pdf`, report_pdf)
    await model.nurseSheet.updateOne({ _id: request.params.idSheet }, { $set: { pdf: report_id } })
    response.json({
      'status': 'OK',
      'message': null,
      'documents': report_id
    })
  } catch (error) {
    console.log('Microservice[close_sheet]: ' + error)

  }
})
module.exports = router;
