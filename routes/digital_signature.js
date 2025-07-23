let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js');
let mongoose = require('mongoose');

/**
 * Crear una nueva firma digital
 * POST /digital_signatures
 */
router.post('/digital_signatures', (request, response) => {
    try {
        // Validar datos requeridos
        if (!request.body.person || !request.body.digital_signature) {
            return response.status(400).json({
                'status': 'KO',
                'message': 'Los campos person y digital_signature son requeridos',
                'documents': []
            });
        }

        let currentDigitalSignature = new model.DigitalSignature(request.body);
        
        currentDigitalSignature.save()
            .then(result => {
                response.json({
                    'status': 'OK',
                    'message': 'Firma digital creada exitosamente',
                    'documents': [result]
                });
            })
            .catch(error => {
                console.log('Microservice[digital_signature_insert]: ' + error);
                
                // Manejar errores específicos
                if (error.code === 11000) {
                    response.status(400).json({
                        'status': 'KO',
                        'message': 'Ya existe una firma digital para esta persona con este archivo',
                        'documents': []
                    });
                } else {
                    response.status(500).json({
                        'status': 'KO',
                        'message': 'Error interno del servidor al crear la firma digital',
                        'documents': []
                    });
                }
            });
    } catch (error) {
        console.log('Microservice[digital_signature_insert_exception]: ' + error);
        response.status(500).json({
            'status': 'KO',
            'message': 'Error interno del servidor',
            'documents': []
        });
    }
});

/**
 * Consultar firmas digitales por ID de persona
 * GET /digital_signatures/person/:personId
 */
router.get('/digital_signatures/person/:personId', (request, response) => {
    try {
        let personId = request.params.personId;

        // Validar que el ID sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(personId)) {
            return response.status(400).json({
                'status': 'KO',
                'message': 'ID de persona inválido',
                'documents': []
            });
        }

        model.DigitalSignature.find({ person: personId })
            .populate('person', 'forename surname')
            .populate('digital_signature')
            .sort({ updated_at: -1 })
            .then(results => {
                response.json({
                    'status': 'OK',
                    'message': `Se encontraron ${results.length} firmas digitales`,
                    'documents': results
                });
            })
            .catch(error => {
                console.log('Microservice[digital_signature_get_by_person]: ' + error);
                response.status(500).json({
                    'status': 'KO',
                    'message': 'Error interno del servidor al consultar firmas digitales',
                    'documents': []
                });
            });
    } catch (error) {
        console.log('Microservice[digital_signature_get_by_person_exception]: ' + error);
        response.status(500).json({
            'status': 'KO',
            'message': 'Error interno del servidor',
            'documents': []
        });
    }
});

/**
 * Consultar firma digital por ID
 * GET /digital_signatures/:id
 */
router.get('/digital_signatures/:id', (request, response) => {
    try {
        let signatureId = request.params.id;

        // Validar que el ID sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(signatureId)) {
            return response.status(400).json({
                'status': 'KO',
                'message': 'ID de firma digital inválido',
                'documents': []
            });
        }

        model.DigitalSignature.findById(signatureId)
            .populate('person', 'forename surname')
            .populate('digital_signature')
            .then(result => {
                if (!result) {
                    return response.status(404).json({
                        'status': 'KO',
                        'message': 'Firma digital no encontrada',
                        'documents': []
                    });
                }

                response.json({
                    'status': 'OK',
                    'message': 'Firma digital encontrada',
                    'documents': [result]
                });
            })
            .catch(error => {
                console.log('Microservice[digital_signature_get_by_id]: ' + error);
                response.status(500).json({
                    'status': 'KO',
                    'message': 'Error interno del servidor al consultar la firma digital',
                    'documents': []
                });
            });
    } catch (error) {
        console.log('Microservice[digital_signature_get_by_id_exception]: ' + error);
        response.status(500).json({
            'status': 'KO',
            'message': 'Error interno del servidor',
            'documents': []
        });
    }
});

/**
 * Eliminar firma digital por ID
 * DELETE /digital_signatures/:id
 */
router.delete('/digital_signatures/:id', (request, response) => {
    try {
        let signatureId = request.params.id;

        // Validar que el ID sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(signatureId)) {
            return response.status(400).json({
                'status': 'KO',
                'message': 'ID de firma digital inválido',
                'documents': []
            });
        }

        model.DigitalSignature.findByIdAndDelete(signatureId)
            .then(result => {
                if (!result) {
                    return response.status(404).json({
                        'status': 'KO',
                        'message': 'Firma digital no encontrada',
                        'documents': []
                    });
                }

                response.json({
                    'status': 'OK',
                    'message': 'Firma digital eliminada exitosamente',
                    'documents': [result]
                });
            })
            .catch(error => {
                console.log('Microservice[digital_signature_delete]: ' + error);
                response.status(500).json({
                    'status': 'KO',
                    'message': 'Error interno del servidor al eliminar la firma digital',
                    'documents': []
                });
            });
    } catch (error) {
        console.log('Microservice[digital_signature_delete_exception]: ' + error);
        response.status(500).json({
            'status': 'KO',
            'message': 'Error interno del servidor',
            'documents': []
        });
    }
});

/**
 * Listar todas las firmas digitales (con paginación opcional)
 * GET /digital_signatures
 */
router.get('/digital_signatures', (request, response) => {
    try {
        let page = parseInt(request.query.page) || 1;
        let limit = parseInt(request.query.limit) || 10;
        let skip = (page - 1) * limit;

        // Validar límites
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 10;

        model.DigitalSignature.find({})
            .populate('person', 'forename surname')
            .sort({ updated_at: -1 })
            .skip(skip)
            .limit(limit)
            .then(results => {
                // Contar total de documentos
                model.DigitalSignature.countDocuments({})
                    .then(total => {
                        response.json({
                            'status': 'OK',
                            'message': `Se encontraron ${results.length} firmas digitales`,
                            'documents': results,
                            'pagination': {
                                'current_page': page,
                                'total_pages': Math.ceil(total / limit),
                                'total_documents': total,
                                'limit': limit
                            }
                        });
                    })
                    .catch(countError => {
                        console.log('Microservice[digital_signature_count]: ' + countError);
                        response.json({
                            'status': 'OK',
                            'message': `Se encontraron ${results.length} firmas digitales`,
                            'documents': results
                        });
                    });
            })
            .catch(error => {
                console.log('Microservice[digital_signature_list]: ' + error);
                response.status(500).json({
                    'status': 'KO',
                    'message': 'Error interno del servidor al listar firmas digitales',
                    'documents': []
                });
            });
    } catch (error) {
        console.log('Microservice[digital_signature_list_exception]: ' + error);
        response.status(500).json({
            'status': 'KO',
            'message': 'Error interno del servidor',
            'documents': []
        });
    }
});

module.exports = router;
