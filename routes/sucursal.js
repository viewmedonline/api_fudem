let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt')
let fs = require('fs')
let jwt = require('jsonwebtoken')
let model = require('../model/database_schemas.js')
let mongoose = require('mongoose')
let https = require('http');

router.post('/sucursal', (request, response) => {
      let currentSucursal = new model.branchOffice(request.body)
      currentSucursal.save()
      .then(result => {
        response.json({
          'status': 'OK',
          'message': null,
          'documents': [ result ]
        })

      }).catch(error => {
        console.log('Microservice[Sucursal_insert]: ' + error)
        response.status(400).json({
          'status': 'KO',
          'message': 'UserNotInserted',
          'documents': []
        })

      })
})

router.post('/sucursal/list', (request, response) => {

  let obj = new Object()
  let query = null;


  if(request.body.UnitId)
    obj.UnitId = request.body.UnitId
  if(request.body.UnitType)
    obj.UnitType = request.body.UnitType
  if(request.body.ParentUnitId)
    obj.ParentUnitId = request.body.ParentUnitId
  
  query = model.branchOffice.find(obj).sort({'control.active':-1})
  query.then(result => {
      if (result) {
          response.json({
              'status': 'OK',
              'message': null,
              'documents': result
          })
      } else {
          response.json({
              'status': 'KO',
              'message': 'SucursalNotFound',
              'documents': []
          })
      }

  }).catch(error => {
      console.log('Microservice[Sucursal_query]: ' + error)
      response.status(500).json({
      'status': 'KO',
      'message': 'SucursalSearchingProblem',
      'documents': []
      })
  })
})
router.get('/sucursal/list', (request, response) => {

  let obj = new Object()
  let query = null;


  if(request.body.UnitId)
    obj.UnitId = request.body.UnitId
  
  query = model.branchOffice.find(obj).sort({'control.active':-1})
  query.then(result => {
      if (result) {
          response.json({
              'status': 'OK',
              'message': null,
              'documents': result
          })
      } else {
          response.json({
              'status': 'KO',
              'message': 'SucursalNotFound',
              'documents': []
          })
      }

  }).catch(error => {
      console.log('Microservice[Sucursal_query]: ' + error)
      response.status(500).json({
      'status': 'KO',
      'message': 'SucursalSearchingProblem',
      'documents': []
      })
  })
})
router.put('/sucursalUpdate/:sucursalId', (request, response) => {

    model.branchOffice.findByIdAndUpdate(request.params.sucursalId, { $set: request.body })
        .where('control.active').equals(true)
        .then(result => {
            if (result) {
                response.json({
                    'status': 'OK',
                    'message': null,
                    'documents': [result]
                })
            } else {
                response.status(200).json({
                    'status': 'KO',
                    'message': "SucursalNotFound",
                    'documents': []
                })
            }

        }).catch(error => {
            // there were problems updating the person
            console.log('Microservice[sucursal_update]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'SucursalUpdatingProblem',
                'documents': null
            })
        })
})
router.get('/sucursalListFudem', async  (request, response) => {
  https.get('http://192.168.1.32/QFlow/Patients/Units.aspx', (resp) => {
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      return response.status(200).json({
          'status': 'Ok',
          'message': "Success",
          'documents': JSON.parse(data)
      })
    });
  }).on("error", (err) => {
      console.log("Error: " + err.message);
  });
})
module.exports = router;
