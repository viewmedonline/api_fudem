let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
let Grid = require('gridfs-stream')
let mongoose = require('mongoose')

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

router.get('/nurse_sheet/:idUser', async (request, response) => {

  const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };
  const signatura_base64 = async (fileId) => {
    console.log(fileId);
    Grid.mongo = mongoose.mongo

    let data_base64 = await model.File.findById(fileId)
      .then(async data => {

        let conn = mongoose.connection
        let gfs = Grid(conn.db)
        // let signature = null

        // Check if the file exists in the database
        const base64_signature = await new Promise((resolve, reject) => {
          gfs.exist({ _id: fileId }, async (err, found) => {
            if (err) {
              reject(err);
            }
            // Search file from MongoDB
            let readstream = gfs.createReadStream({
              _id: fileId
            });

            const buffer = await streamToBuffer(readstream);
            const base64 = buffer.toString('base64');
            resolve(base64);
          });
        });
        return base64_signature
      })
      .catch(error => {
        console.log('Microservice[get_file]: ' + error)
      })
    return data_base64
  }

  let query = model.nurseSheet.find({ 'patient': request.params.idUser }).populate('notes_nurses.responsible', '_id forename surname digital_signature')
  query.then(async result => {
    result = await Promise.all(result.map(async item => {
      let notes = await Promise.all(item.notes_nurses.map(async note => {
        const signature = await signatura_base64(note.responsible.digital_signature)
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

module.exports = router;
