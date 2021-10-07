let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt')
let fs = require('fs')
let jwt = require('jsonwebtoken')
let model = require('../model/database_schemas.js')
let mongoose = require('mongoose')


router.post('/users', (request, response) => {
      let currentUser = new model.User(request.body)
      currentUser.save()
      .then(result => {
        response.json({
          'status': 'OK',
          'message': null,
          'documents': [ result ]
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

router.put('/users', (request, response) => {

	let obj = new Object()
	let query = null;

    if (request.body.idUserFudem)
        obj.idUserFudem = request.body.idUserFudem
    if(request.body.role)
        obj.role = request.body.role
    
    query = model.User.find(obj).sort({'control.active':-1})
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
                'message': 'UserNotFound',
                'documents': []
            })
        }

    }).catch(error => {
        console.log('Microservice[User_query]: ' + error)
        response.status(500).json({
        'status': 'KO',
        'message': 'UserSearchingProblem',
        'documents': []
        })
    })
})

router.put('/users/update/:idUserFudem', (request, response) => {

    model.User.findOneAndUpdate({idUserFudem:request.params.idUserFudem}, request.body)
    .then(result => {
      if (result) {
        response.json({
          'status': 'OK',
          'message': null,
          'documents': [ result ]
        })
      } else {
        response.json({
          'status': 'KO',
          'message': 'UserNotFound',
          'documents': []
        })
      }
    }).catch(error => {
      // there were problems updating the user
      console.log('Microservice[user_update]: ' + error)
      response.status(500).json({
        'status': 'KO',
        'message': 'UserSearchingProblem',
        'documents': []
      })
    })
})

module.exports = router;
