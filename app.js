/**
 * @api {post} /users Insert user's data
 * @apiName user_insert
 * @apiGroup user
 * @apiVersion 1.0.1
 *
 * @apiDescription Save the user's data within the database.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {String} user        User's Name.
 * @apiParam {String} passwd      User's password.
 * @apiParam {String} [services]  Optional services: .
 * @apiParam {String} role        User's role can be: "Physician", "Admision", "Institution", "Intern".
 * @apiParam {String} idUserFudem Q-Flow user id.
 * @apiParam {String} [token]     Token returned by user registration.
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *        "user": "juanc",
 *        "passwd": "qwerty2",
 *        "services": "null",
 *        "role": "Physician",
 *        "idUserFudem": "005",
 *        "token": "null"
 *    }
 *
 * @apiSuccess (200) {String}     status                       Response status.
 * @apiSuccess (200) {String}     message                      Response error message setting with null value.
 * @apiSuccess (200) {Object}     documents                    Response values.
 * @apiSuccess (200) {String}     documents._id                User's id.
 * @apiSuccess (200) {String}     documents.passwd             User's password.
 * @apiSuccess (200) {String}     documents.services           Services: .
 * @apiSuccess (200) {String}     documents.role               User's role can be: "Physician", "Admision", "Institution", "Intern".
 * @apiSuccess (200) {String}     documents.idUserFudem        Q-Flow user id.
 * @apiSuccess (200) {String{32}} documents.token              Token returned by user registration.
 * @apiSuccess (200) {Object}     documents.control            Document control information.
 * @apiSuccess (200) {Boolean}    documents.control.active     Tells if the document is active.
 * @apiSuccess (200) {String}     documents.control.created_by Document created by.
 * @apiSuccess (200) {Date}       documents.control.created_at Document's creation date.
 * @apiSuccess (200) {String}     documents.control.updated_by Document updated by.
 * @apiSuccess (200) {Date}       documents.control.updated_at Document's update date.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "control": {
 *                        "active": true,
 *                        "created_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "updated_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "created_at": "2019-01-17T18:56:24.590Z",
 *                        "updated_at": "2019-01-17T18:56:24.590Z"
 *                    },
 *                    "_id": "5c40cfd840292f1210f7d94c",
 *                    "user": "juanc",
 *                    "passwd": "qwerty2",
 *                    "services": "null",
 *                    "role": "Physician",
 *                    "idUserFudem": "005",
 *                    "token": "null"
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status    Response status.
 * @apiError (403) {String} message   Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "status": "KO",
 *       "message": "UserNotInserted",
 *       "documents": []"
 *     }
 *
 **/

/**
 * @api {put} /users/update/:idUserFudem Updates user's data
 * @apiName user_update
 * @apiGroup user
 * @apiVersion 1.0.1
 *
 * @apiDescription Update the user's data within the database.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {String} [_id]       User's ID.
 * @apiParam {String} user        User's Name.
 * @apiParam {String} passwd      User's password.
 * @apiParam {String} [services]  Optional services: .
 * @apiParam {String} role        User's role can be: "Physician", "Admision", "Institution", "Intern".
 * @apiParam {String} [token] Token returned by user registration.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        "_id": "5c40cfd840292f1210f7d94c",
 *        "user": "juanc",
 *        "passwd": "qwerty2",
 *        "services": "null",
 *        "role": "Physician",
 *        "token": "A234817394BasdTg3820Plb90XxzM672"
 *     }
 *
 * @apiSuccess (200) {String}     status                       Response status.
 * @apiSuccess (200) {String}     message                      Response error message setting with null value.
 * @apiSuccess (200) {Object}     documents                    Response values.
 * @apiSuccess (200) {String}     documents._id                User's id.
 * @apiSuccess (200) {String}     documents.passwd             User's password.
 * @apiSuccess (200) {String}     documents.services           Services: .
 * @apiSuccess (200) {String}     documents.role               User's role can be: "Physician", "Admision", "Institution", "Intern".
 * @apiSuccess (200) {String}     documents.idUserFudem        Q-Flow user id.
 * @apiSuccess (200) {String{32}} documents.token              Token returned by user registration.
 * @apiSuccess (200) {Object}     documents.control            Document control information.
 * @apiSuccess (200) {Boolean}    documents.control.active     Tells if the document is active.
 * @apiSuccess (200) {String}     documents.control.created_by Document created by.
 * @apiSuccess (200) {Date}       documents.control.created_at Document's creation date.
 * @apiSuccess (200) {String}     documents.control.updated_by Document updated by.
 * @apiSuccess (200) {Date}       documents.control.updated_at Document's update date.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "control": {
 *                        "active": true,
 *                        "created_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "updated_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "created_at": "2019-01-17T18:56:24.590Z",
 *                        "updated_at": "2019-01-17T18:56:24.590Z"
 *                    },
 *                    "_id": "5c40cfd840292f1210f7d94c",
 *                    "user": "juanc",
 *                    "passwd": "qwerty2",
 *                    "services": "null",
 *                    "role": "Physician",
 *                    "idUserFudem": "005",
 *                    "token": "null"
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status    Response status.
 * @apiError (403) {String} message   Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "status": "KO",
 *       "message": "UserNotInserted",
 *       "documents": []"
 *     }
 *
 **/

/**
 * @api {put} /users Search for the login value of a user's data
 * @apiName user_search
 * @apiGroup user
 * @apiVersion 1.0.1
 *
 * @apiDescription Search the data of a user within the database using the value of 'role' or 'idUserFudem' as a search field.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {String} role        User's role can be: "Physician", "Admision", "Institution", "Intern".
 * @apiParam {String} idUserFudem Q-Flow user id.
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *        "role": "Physician",
 *        "idUserFudem": "005"
 *    }
 *
 * @apiSuccess (200) {String}     status                       Response status.
 * @apiSuccess (200) {String}     message                      Response error message setting with null value.
 * @apiSuccess (200) {Object}     documents                    Response values.
 * @apiSuccess (200) {String}     documents._id                User's id.
 * @apiSuccess (200) {String}     documents.passwd             User's password.
 * @apiSuccess (200) {String}     documents.services           Services: .
 * @apiSuccess (200) {String}     documents.role               User's role can be: "Physician", "Admision", "Institution".
 * @apiSuccess (200) {String}     documents.idUserFudem        Q-Flow user id.
 * @apiSuccess (200) {String{32}} documents.token              Token returned by user registration.
 * @apiSuccess (200) {Object}     documents.control            Document control information.
 * @apiSuccess (200) {Boolean}    documents.control.active     Tells if the document is active.
 * @apiSuccess (200) {String}     documents.control.created_by Document created by.
 * @apiSuccess (200) {Date}       documents.control.created_at Document's creation date.
 * @apiSuccess (200) {String}     documents.control.updated_by Document updated by.
 * @apiSuccess (200) {Date}       documents.control.updated_at Document's update date.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "control": {
 *                        "active": true,
 *                        "created_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "updated_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "created_at": "2019-01-17T18:56:24.590Z",
 *                        "updated_at": "2019-01-17T18:56:24.590Z"
 *                    },
 *                    "_id": "5c40cfd840292f1210f7d94c",
 *                    "user": "juanc",
 *                    "passwd": "qwerty2",
 *                    "services": "null",
 *                    "role": "Physician",
 *                    "idUserFudem": "005",
 *                    "token": "A234817394BasdTg3820Plb90XxzM672"
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status Response status.
 * @apiError (403) {String} message Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "status": "KO",
 *       "message": "UserNotfound",
 *       "documents": []"
 *     }
 *
 **/

/**
 * @api {post} /persons Insert person's data
 * @apiName person_insert
 * @apiGroup person
 * @apiVersion 1.0.1
 *
 * @apiDescription Save the person's data within the database.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {Boolean}  readWrtite=true     Read and write
 * @apiParam {Boolean}  lenses=false        Use lenses
 * @apiParam {String}   forename            Person's forename.
 * @apiParam {String}   surname             Person's surname.
 * @apiParam {String}   [registrationdate]  Registration date.
 * @apiParam {String}   [type_document]     Type Document.
 * @apiParam {String}   id_document         Identification document of the person.
 * @apiParam {String}   gender              Gender of the person, the only values are female or male.
 * @apiParam {String[]} phone               It contains the telephone number of the person.
 * @apiParam {String}   type                Person's type which can be: patient or physician.
 * @apiParam {String}   blood_type          Person's blood type.
 * @apiParam {Object}   [address]           Define the address of the person.
 * @apiParam {String}   [address.country]   Country where the person is in.
 * @apiParam {String}   [address.state]     State where the person is in.
 * @apiParam {String}   [address.city]      City where it is.
 * @apiParam {String}   [address.street]    Street and other characteristics that allow to locate the person.
 * @apiParam {String}   email               Contains the person's email.
 * @apiParam {String}   [alternative_email] Person's alternative email.
 * @apiParam {String}   expfudemcare        Expfudemcare.
 * @apiParam {String}   expstatus           Expstatus.
 * @apiParam {String}   housinglocation     Person's housing location.
 * @apiParam {String}   role                Roles: 'optometrist' | 'Patient' | 'ophthalmologist'.
 * @apiParam {Date}     birthdate           Birthdate.
 * @apiParam {String}   occupation          Occupation of the person.
 * @apiParam {String}   profession          Profession of the person.
 * @apiParam {String}   [category]          Category of the person.
 * @apiParam {String}   nationality         Nationality of the person.
 * @apiParam {String}   idQflow             Person's Qflow ID.
 * @apiParam {String}   celphone            Person's celphone.
 * @apiParam {ObjectId} user                User ID system Viewmed.
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *        "readWrtite": true,
 *        "lenses": false,
 *        "forename": "Juan",
 *        "surname": "Prueba",
 *        "registrationdate": "2019-01-07 07:55:32.361",
 *        "birthdate": "1995-02-14 15:18:57.957",
 *        "type_document": "DNI",
 *        "id_document": "25.871.499",
 *        "gender": "male",
 *        "user": "5c40cfd840292f1210f7d94c",
 *        "idQflow": "sdasg342389sdll27as8ds3s",
 *        "email": "juanprueba@gmail.com",
 *        "phone": "0212-555.55.99",
 *        "address": {
 *            "country": "",
 *            "state": "5ad643c61a5139fac282beba",
 *            "city": "2018-04-24 07:55:32.361",
 *            "street": "5ad643c61a5139fac282beba"
 *        },
 *        "role": "Ophtalmologist",
 *        "expfudemcare": "0001",
 *        "expstatus": "0001",
 *        "celphone":"2301237",
 *        "housinglocation": "asdasdasfas",
 *        "occupation": "Psychiatrist",
 *        "profession": "Doctor",
 *        "category": "Medicine",
 *        "nationality": "Venezolano"
 *    }
 *
 * @apiSuccess (200) {String}   status                       Response status.
 * @apiSuccess (200) {String}   message                      Response error message setting with null value.
 * @apiSuccess (200) {Object}   documents                    Response values.
 * @apiSuccess (200) {Boolean}  documents.readWrtite=true    Read and write
 * @apiSuccess (200) {Boolean}  documents.lenses=false       Use lenses
 * @apiSuccess (200) {String}   documents.forename           Person's forename.
 * @apiSuccess (200) {String}   documents.surname            Person's surname.
 * @apiSuccess (200) {String}   documents.registrationdate   Registration date.
 * @apiSuccess (200) {String}   documents.type_document      Type Document.
 * @apiSuccess (200) {String}   documents.id_document        Identification document of the person.
 * @apiSuccess (200) {String}   documents.gender             Gender of the person, the only values are female or male.
 * @apiSuccess (200) {String[]} documents.phone              It contains the telephone number of the person.
 * @apiSuccess (200) {String}   documents.type               Person's type which can be: patient or physician.
 * @apiSuccess (200) {String}   documents.blood_type         Person's blood type.
 * @apiSuccess (200) {Object}   documents.address            Define the address of the person.
 * @apiSuccess (200) {String}   documents.address.country    Country where the person is in.
 * @apiSuccess (200) {String}   documents.address.state      State where the person is in.
 * @apiSuccess (200) {String}   documents.address.city       City where it is.
 * @apiSuccess (200) {String}   documents.address.street     Street and other characteristics that allow to locate the person.
 * @apiSuccess (200) {String}   documents.email              Contains the person's email.
 * @apiSuccess (200) {String}   documents.alternative_email  Person's alternative email.
 * @apiSuccess (200) {String}   documents.expfudemcare       Expfudemcare.
 * @apiSuccess (200) {String}   documents.expstatus          Expstatus.
 * @apiSuccess (200) {String}   documents.housinglocation    Person's housing location.
 * @apiSuccess (200) {String}   documents.role               Roles: 'optometrist' | 'Patient' | 'ophthalmologist'.
 * @apiSuccess (200) {Date}     documents.birthdate          Birthdate.
 * @apiSuccess (200) {String}   documents.occupation         Occupation of the person.
 * @apiSuccess (200) {String}   documents.profession         Profession of the person.
 * @apiSuccess (200) {String}   documents.category           Category of the person.
 * @apiSuccess (200) {String}   documents.celphone           Person's celphone.
 * @apiSuccess (200) {String}   documents.nationality        Nationality of the person.
 * @apiSuccess (200) {String}   documents.idQflow            Person's Qflow ID.
 * @apiSuccess (200) {ObjectId} documents.user               User ID system Viewmed.
 * @apiSuccess (200) {Object}   documents.control            Document control information.
 * @apiSuccess (200) {Boolean}  documents.control.active     Tells if the document is active.
 * @apiSuccess (200) {String}   documents.control.created_by Document created by.
 * @apiSuccess (200) {Date}     documents.control.created_at Document's creation date.
 * @apiSuccess (200) {String}   documents.control.updated_by Document updated by.
 * @apiSuccess (200) {Date}     documents.control.updated_at Document's update date.
 *
 * @apiSuccess (200) {String} documents.token Token returned.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "without_document": false,
 *                    "phone": [
 *                        "0212-555.55.99"
 *                    ],
 *                    "readWrtite": true,
 *                    "address": {
 *                        "country": "",
 *                        "state": "5ad643c61a5139fac282beba",
 *                        "city": "2018-04-24 07:55:32.361",
 *                        "street": "5ad643c61a5139fac282beba"
 *                    },
 *                    "photos": [],
 *                    "insurance": [],
 *                    "work_phone": [],
 *                    "vc_online": false,
 *                    "lenses": false,
 *                    "control": {
 *                        "active": true,
 *                        "created_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "updated_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "created_at": "2019-01-17T20:24:47.462Z",
 *                        "updated_at": "2019-01-17T20:24:47.462Z"
 *                    },
 *                    "_id": "5c40e48f40292f1210f7d959",
 *                    "forename": "Juan",
 *                    "surname": "Prueba",
 *                    "registrationdate": "2019-01-07T07:55:32.361Z",
 *                    "birthdate": "1995-02-14T15:18:57.957Z",
 *                    "type_document": "DNI",
 *                    "id_document": "25.871.499",
 *                    "gender": "male",
 *                    "user": "5c40cfd840292f1210f7d94c",
 *                    "idQflow": "sdasg342389sdll27as8ds3s",
 *                    "email": "juanprueba@gmail.com",
 *                    "role": "Ophtalmologist",
 *                    "expfudemcare": "0001",
 *                    "expstatus": "0001",
 *                    "celphone":"2301237",
 *                    "housinglocation": "asdasdasfas",
 *                    "category": "Medicine",
 *                    "nationality": "Venezolano",
 *                    "social_networks": []
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status Response status.
 * @apiError (403) {String} message Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "status": "KO",
 *       "message": "PersonNotInserted",
 *       "documents": []"
 *     }
 *
 **/

/**
 * @api {get} /persons/exists/:typePerson/:user/ Validates the existence of a person
 * @apiName person_exists
 * @apiGroup person
 * @apiVersion 1.0.0
 *
 * @apiDescription Validate the existence of a person in the system.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {String} user    Person's email.
 *
 * @apiParamExample {url} Request-Example:
 * /persons/exists/1/0003
 *
 * @apiSuccess (200) {String} status Response status.
 * @apiSuccess (200) {String} message Response error message setting with null value.
 * @apiSuccess (200) {Object} documents Response values.
 * @apiSuccess (200) {String} documents.exists valuate user returned.
 * @apiSuccess (200) {String} documents._id Person's id.
 * @apiSuccess (200) {String} documents.name Person's name.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "exists": true,
 *                    "_id": "5c1a968730eb630bf5a52922",
 *                    "name": "Paciente Viewmed"
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status Response status.
 * @apiError (403) {String} message Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "status": "KO",
 *       "message": "PersonNotFound",
 *       "documents": []"
 *     }
 *
 **/

/**
 * @api {put} /persons/:personId Update person's data
 * @apiName person_update
 * @apiGroup person
 * @apiVersion 1.0.1
 *
 * @apiDescription Update the person's data within the database. The apiDoc specification is not complete.
 *
 * @apiHeader {String} Content-Type Content type value.
 *
 * @apiHeaderExample {json} Header-Example:
 *    {
 *       "Content-Type": "application/json"
 *    }
 *
 * @apiParam {Boolean}  readWrtite=true     Read and write
 * @apiParam {Boolean}  lenses=false        Use lenses
 * @apiParam {String}   forename            Person's forename.
 * @apiParam {String}   surname             Person's surname.
 * @apiParam {String}   [registrationdate]  Registration date.
 * @apiParam {String}   [type_document]     Type Document.
 * @apiParam {String}   id_document         Identification document of the person.
 * @apiParam {String}   gender              Gender of the person, the only values are female or male.
 * @apiParam {String[]} phone               It contains the telephone number of the person.
 * @apiParam {String}   type                Person's type which can be: patient or physician.
 * @apiParam {String}   blood_type          Person's blood type.
 * @apiParam {Object}   [address]           Define the address of the person.
 * @apiParam {String}   [address.country]   Country where the person is in.
 * @apiParam {String}   [address.state]     State where the person is in.
 * @apiParam {String}   [address.city]      City where it is.
 * @apiParam {String}   [address.street]    Street and other characteristics that allow to locate the person.
 * @apiParam {String}   email               Contains the person's email.
 * @apiParam {String}   [alternative_email] Person's alternative email.
 * @apiParam {String}   expfudemcare        Expfudemcare.
 * @apiParam {String}   expstatus           Expstatus.
 * @apiParam {String}   housinglocation     Person's housing location.
 * @apiParam {String}   role                Roles: 'optometrist' | 'Patient' | 'ophthalmologist'.
 * @apiParam {Date}     birthdate           Birthdate.
 * @apiParam {String}   celphone            Person's celphone.
 * @apiParam {String}   occupation          Occupation of the person.
 * @apiParam {String}   profession          Profession of the person.
 * @apiParam {String}   [category]          Category of the person.
 * @apiParam {String}   nationality         Nationality of the person.
 * @apiParam {String}   idQflow             Person's Qflow ID.
 * @apiParam {ObjectId} user                User ID system Viewmed.
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *        "readWrtite": true,
 *        "lenses": false,
 *        "forename": "Juan",
 *        "surname": "Prueba",
 *        "registrationdate": "2019-01-07 07:55:32.361",
 *        "birthdate": "1995-02-14 15:18:57.957",
 *        "type_document": "DNI",
 *        "id_document": "25.871.499",
 *        "gender": "male",
 *        "user": "5c40cfd840292f1210f7d94c",
 *        "idQflow": "sdasg342389sdll27as8ds3s",
 *        "email": "juanprueba@gmail.com",
 *        "phone": "0212-555.55.99",
 *        "address": {
 *            "country": "",
 *            "state": "5ad643c61a5139fac282beba",
 *            "city": "2018-04-24 07:55:32.361",
 *            "street": "SUCC"
 *        },
 *        "role": "Ophtalmologist",
 *        "expfudemcare": "0001",
 *        "expstatus": "0001",
 *        "celphone":"2301237",
 *        "housinglocation": "asdasdasfas",
 *        "occupation": "Psychiatrist",
 *        "profession": "Doctorate",
 *        "category": "Medicine",
 *        "nationality": "Venezolano"
 *    }
 *
 * @apiSuccess (200) {String}   status                       Response status.
 * @apiSuccess (200) {String}   message                      Response error message setting with null value.
 * @apiSuccess (200) {Object}   documents                    Response values.
 * @apiSuccess (200) {Boolean}  documents.readWrtite=true    Read and write
 * @apiSuccess (200) {Boolean}  documents.lenses=false       Use lenses
 * @apiSuccess (200) {String}   documents.forename           Person's forename.
 * @apiSuccess (200) {String}   documents.surname            Person's surname.
 * @apiSuccess (200) {String}   documents.registrationdate   Registration date.
 * @apiSuccess (200) {String}   documents.type_document      Type Document.
 * @apiSuccess (200) {String}   documents.id_document        Identification document of the person.
 * @apiSuccess (200) {String}   documents.gender             Gender of the person, the only values are female or male.
 * @apiSuccess (200) {String[]} documents.phone              It contains the telephone number of the person.
 * @apiSuccess (200) {String}   documents.type               Person's type which can be: patient or physician.
 * @apiSuccess (200) {String}   documents.blood_type         Person's blood type.
 * @apiSuccess (200) {Object}   documents.address            Define the address of the person.
 * @apiSuccess (200) {String}   documents.address.country    Country where the person is in.
 * @apiSuccess (200) {String}   documents.address.state      State where the person is in.
 * @apiSuccess (200) {String}   documents.address.city       City where it is.
 * @apiSuccess (200) {String}   documents.address.street     Street and other characteristics that allow to locate the person.
 * @apiSuccess (200) {String}   documents.email              Contains the person's email.
 * @apiSuccess (200) {String}   documents.alternative_email  Person's alternative email.
 * @apiSuccess (200) {String}   documents.expfudemcare       Expfudemcare.
 * @apiSuccess (200) {String}   documents.expstatus          Expstatus.
 * @apiSuccess (200) {String}   documents.housinglocation    Person's housing location.
 * @apiSuccess (200) {String}   documents.role               Roles: 'optometrist' | 'Patient' | 'ophthalmologist'.
 * @apiSuccess (200) {Date}     documents.birthdate          Birthdate.
 * @apiSuccess (200) {String}   celphone                     Person's celphone.
 * @apiSuccess (200) {String}   documents.occupation         Occupation of the person.
 * @apiSuccess (200) {String}   documents.profession         Profession of the person.
 * @apiSuccess (200) {String}   documents.category           Category of the person.
 * @apiSuccess (200) {String}   documents.nationality        Nationality of the person.
 * @apiSuccess (200) {String}   documents.idQflow            Person's Qflow ID.
 * @apiSuccess (200) {ObjectId} documents.user               User ID system Viewmed.
 * @apiSuccess (200) {Object}   documents.control            Document control information.
 * @apiSuccess (200) {Boolean}  documents.control.active     Tells if the document is active.
 * @apiSuccess (200) {String}   documents.control.created_by Document created by.
 * @apiSuccess (200) {Date}     documents.control.created_at Document's creation date.
 * @apiSuccess (200) {String}   documents.control.updated_by Document updated by.
 * @apiSuccess (200) {Date}     documents.control.updated_at Document's update date.
 *
 * @apiSuccess (200) {String} documents.token Token returned.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *        {
 *            "status": "OK",
 *            "message": null,
 *            "documents": [
 *                {
 *                    "without_document": false,
 *                    "phone": [
 *                        "0212-555.55.99"
 *                    ],
 *                    "readWrtite": true,
 *                    "address": {
 *                        "country": "",
 *                        "state": "5ad643c61a5139fac282beba",
 *                        "city": "2018-04-24 07:55:32.361",
 *                        "street": "5ad643c61a5139fac282beba"
 *                    },
 *                    "photos": [],
 *                    "insurance": [],
 *                    "work_phone": [],
 *                    "vc_online": false,
 *                    "lenses": false,
 *                    "control": {
 *                        "active": true,
 *                        "created_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "updated_by": "1a11aaaa11a1a1111a11a1a1",
 *                        "created_at": "2019-01-17T20:24:47.462Z",
 *                        "updated_at": "2019-01-17T20:24:47.462Z"
 *                    },
 *                    "_id": "5c40e48f40292f1210f7d959",
 *                    "forename": "Juan",
 *                    "surname": "Prueba",
 *                    "registrationdate": "2019-01-07T07:55:32.361Z",
 *                    "birthdate": "1995-02-14T15:18:57.957Z",
 *                    "type_document": "DNI",
 *                    "id_document": "25.871.499",
 *                    "gender": "male",
 *                    "user": "5c40cfd840292f1210f7d94c",
 *                    "idQflow": "sdasg342389sdll27as8ds3s",
 *                    "email": "juanprueba@gmail.com",
 *                    "role": "Ophtalmologist",
 *                    "expfudemcare": "0001",
 *                    "expstatus": "0001",
 *                    "celphone":"2301237",
 *                    "housinglocation": "asdasdasfas",
 *                    "category": "Medicine",
 *                    "nationality": "Venezolano",
 *                    "social_networks": []
 *                }
 *            ]
 *        }
 *
 * @apiError (403) {String} status Response status.
 * @apiError (403) {String} message Response error message .
 * @apiError (403) {Object} documents Response values setting with empty list.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": "KO",
 *       "message": "PersonUpdatingProblem",
 *       "documents": []"
 *     }
 *
 **/

let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

let addRequestId = require("express-request-id")();
let morgan = require("morgan");
let logger = require("./logger");

let app = express();

let dbConfig = require(__dirname + "/config/db_config.js");

const person = require("./routes/person");
const diagnoses = require("./routes/diagnoses");
const record = require("./routes/record");
const consultation = require("./routes/consultation");
const user = require("./routes/user");
const file = require("./routes/file");
const imaging = require("./routes/imaging");
const constancy = require("./routes/constancy");
const sucursal = require("./routes/sucursal");
const nurse_sheet = require("./routes/nurse_sheet");
const reference = require("./routes/reference");
const surgery_sheet = require("./routes/surgery_sheet");
const intern_evaluation = require("./routes/intern_evaluation_sheet");
const pediatrics_sheet = require("./routes/pediatrics_sheet");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
let cors = require("cors");
morgan.token("id", function getId(req) {
    return req.id;
});

var loggerFormat = ':id [:date[web]] ":method :url" :status :response-time';

app.use(
    morgan(loggerFormat, {
        skip: function(req, res) {
            return res.statusCode < 400;
        },
        stream: process.stderr
    })
);

app.use(
    morgan(loggerFormat, {
        skip: function(req, res) {
            return res.statusCode >= 400;
        },
        stream: process.stdout
    })
);

app.use((req, res, next) => {
    var log = logger.loggerInstance.child({
            id: req.id,
            body: req.body
        },
        true
    );
    log.info({
        req: req
    });
    next();
});

app.use(function(req, res, next) {
    function afterResponse() {
        res.removeListener("finish", afterResponse);
        res.removeListener("close", afterResponse);
        var log = logger.loggerInstance.child({
                id: req.id
            },
            true
        );
        log.info({ res: res }, "response");
    }

    res.on("finish", afterResponse);
    res.on("close", afterResponse);
    next();
});

app.use(cors(corsOptions));

app.use(function(err, req, res, next) {

    let stringified = err.body;
    stringified = stringified.replace(/	/g,'').replace(//g,'');
    stringified = JSON.parse(stringified)
    req.body = stringified

    // ⚙️ our function to catch errors from body-parser
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    //   // do your own thing here 👍
      logger.loggerInstance.error("error el ruta", req.protocol + '://' + req.get('host') + req.originalUrl)
      logger.loggerInstance.error(err.body)
      logger.loggerInstance.error("Error message: ",err.message)
      next();
    //   res.status(400).send({ code: 400, message: "bad request" });
    } else next();
    
  });

app.use(person);
app.use(diagnoses);
app.use(record);
app.use(consultation);
app.use(user);
app.use(file);
app.use(imaging);
app.use(constancy);
app.use(sucursal);
app.use(nurse_sheet);
app.use(reference);
app.use(surgery_sheet);
app.use(intern_evaluation);
app.use(pediatrics_sheet)

mongoose.connect(dbConfig.url, dbConfig.options).then(
    () => {
        let model = require(__dirname + "/model/database_schemas.js");

        let msConfig = require(__dirname + "/config/ms_config.js");
        app.listen(msConfig.port, function() {
            console.log("api_viewmed: is listening on port " + msConfig.port);
        });
    },
    err => {
        // error in the connection to the database
        console.log("api_viewmed: " + err);
        response.status(500).json({
            status: "KO",
            message: "DatabaseNotConnection",
            documents: []
        });
    }
);