let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt')
let fs = require('fs')
let jwt = require('jsonwebtoken')
let model = require('../model/database_schemas.js')
let mongoose = require('mongoose')


router.post('/persons', (request, response) => {
    let currentPerson = new model.Person(request.body)
    currentPerson.save()
        .then(result => {
            response.json({
                'status': 'OK',
                'message': null,
                'documents': [result]
            })

        }).catch(error => {
            // error when saving the person's data in the database
            console.log('Microservice[person_insert]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'PersonNotInserted',
                'documents': []
            })

        })
})

router.put('/persons', (request, response) => {

    let obj = new Object()
    let query = null;

    if (request.body.forename)
        obj.forename = new RegExp(request.body.forename, 'i')
    if (request.body.surname)
        obj.surname = new RegExp(request.body.surname, 'i')
    if (request.body.email)
        obj.email = request.body.email
    if (request.body.gender)
        obj.gender = new RegExp(request.body.gender, 'i')
    if (request.body.specialty)
        obj.specialty = new RegExp(request.body.specialty, 'i')
    if (request.body.sub_specialty)
        obj.sub_specialty = new RegExp(request.body.sub_specialty, 'i')
    if (request.body._id)
        obj._id = request.body._id
    if (request.body.id_document)
        obj.id_document = request.body.id_document
    if (request.body.user)
        obj.user = { $in: request.body.user }
    if (request.body.type)
        obj.type = { $in: request.body.type }
    if (request.body.expfudemcare)
        obj.expfudemcare = request.body.expfudemcare

    if (request.body.autoComplete)
        obj.idQflow = request.body.autoComplete

    if (request.body.idQflow)
        obj.idQflow = request.body.idQflow


    if (request.body.idQflow)
        obj.idQflow = request.body.idQflow
    if (request.body.role)
        obj.role = { $in: request.body.role }
    if (request.body.address) {

        let objAddress = Array()

        if (request.body.address.country)
            objAddress.push({ "address.country": request.body.address.country })
        if (request.body.address.state)
            objAddress.push({ "address.state": request.body.address.state })
        if (request.body.address.city)
            objAddress.push({ "address.city": request.body.address.city })

        query = model.Person.find(obj).or(objAddress).sort({ 'control.active': -1 }).populate("user")
    } else {
        query = model.Person.find(obj).sort({ 'control.active': -1 }).populate("user")
    }
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
                'message': 'PersonNotFound',
                'documents': []
            })
        }

    }).catch(error => {
        console.log('Microservice[person_query]: ' + error)
        response.status(500).json({
            'status': 'KO',
            'message': 'PersonSearchingProblem',
            'documents': []
        })
    })
})

router.get('/persons/exists/:typePerson/:user/', (request, response) => {
    let query = null
    if (request.params.typePerson == '1') {
        query = model.Person.findOne({ 'idQflow': request.params.user })
    } else {
        query = model.User.findOne({ 'idUserFudem': request.params.user })
    }
    query
        .where('control.active').equals(true)
        .then(result => {
            if (result) {
                let name = null
                if (request.params.typePerson == '1')
                    name = result.forename + " " + result.surname
                else
                    name = result.user

                response.json({
                    'status': 'OK',
                    'message': null,
                    'documents': [{ 'exists': true, "_id": result._id, name: name, 'typeUser': result.role }]
                })

            } else {
                response.json({
                    'status': 'OK',
                    'message': null,
                    'documents': [{ 'exists': false }]
                })
            }

        }).catch(err => {
            response.status(500).json({
                'status': 'KO',
                'message': 'UserSearchingProblem',
                'documents': []
            })


        })
})


router.put('/persons/:personId', (request, response) => {

    model.Person.findByIdAndUpdate(request.params.personId, { $set: request.body })
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
                    'message': "PersonNotFound",
                    'documents': []
                })
            }

        }).catch(error => {
            // there were problems updating the person
            console.log('Microservice[person_update]: ' + error)
            response.status(400).json({
                'status': 'KO',
                'message': 'PersonUpdatingProblem',
                'documents': null
            })
        })
})

router.post('/contacts/persons/list', (request, response) => {

    let query = null

    if (request.body.ids) {
        query = model.Person.find().where('type').equals(request.body.type).where('user').in(request.body.ids).where('control.active').equals(true)
    } else {
        query = model.Person.find().where('type').equals(request.body.type).where('control.active').equals(true)
    }

    query.then(result => {

        if (result) {

            response.status(200).json({
                'status': 'OK',
                'message': null,
                'documents': result
            })
        } else {
            // the contacts have not been found into the person collection
            response.status(200).json({
                'status': 'KO',
                'message': "ContactPersonNotFound",
                'documents': []
            })
        }

    }).catch(error => {
        // there were problems searching the contacts
        console.log('Microservice[list_persons_contacts]: ' + error)
        response.status(500).json({
            'status': 'KO',
            'message': "ContactPersonSearchingProblem",
            'documents': []
        })
    })
})

router.put('/listPersons', (request, response) => {

    let obj = new Object()
    let query = null;

    
    if (request.body._id)
        obj._id = request.body._id
    
    if (request.body.idQflow)
        obj.idQflow = request.body.idQflow

    if (request.body.record)
        obj.record = request.body.record

    if (request.body.role)
        obj.role = { $in: request.body.role }

    query = model.Person.find(obj,{'forename':1,'surname':1,'_id':1,'record':1}).sort({ 'control.active': -1 })
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
                'message': 'PersonNotFound',
                'documents': []
            })
        }

    }).catch(error => {
        console.log('Microservice[person_query]: ' + error)
        response.status(500).json({
            'status': 'KO',
            'message': 'PersonSearchingProblem',
            'documents': []
        })
    })
})
module.exports = router;