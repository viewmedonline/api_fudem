let Grid = require('gridfs-stream')
let express = require('express');
let router = express.Router();
let model = require('../model/database_schemas.js')
const { create_report_pdf, signatura_base64, save_file,deleteFile } = require('./general_function.js')
const moment = require('moment')
const mongoose = require('mongoose')


router.post('/surgery_sheet', async (request, response) => {
    try {
        const signature = await signatura_base64(request.body.data.physician_signature)
        request.body.data.digital_signature = signature
        const pdf_data = await create_report_pdf(request.body.name, request.body.data)
        const report_id = await save_file(`surgery_sheet_${request.body.data.num_exp}.pdf`, pdf_data)
        request.body.data.pdf = report_id
        request.body.data.date = moment().utc().toDate();
        request.body.data.date_surgery = moment(request.body.data.date_surgery,"DD/MM/YYYY").utc().toDate();

        //save colletion
        const surgery_sheet = new model.SurgerySheet(request.body.data)
        await surgery_sheet.save()

        response.json({
            'status': 'OK',
            'message': null,
            'documents': report_id
        })
    } catch (error) {
        console.log(error)
        response.status(400).json({
            'status': 'KO',
            'message': 'Error creating report',
            'documents': []
        })
    }
})

router.get('/surgery_sheet/recreate/pdf/:dateInit/:dateEnd', async (request, response) => {
    try {
        let dataList = await model.SurgerySheet.find({
            date_surgery:{
                $gte: moment(request.params.dateInit,"DDMMYYYY").utc().toDate(),
                $lte: moment(request.params.dateEnd,"DDMMYYYY").utc().toDate()
            }
        }).populate("patient responsible")

        for (const x of dataList) {

        const getLastConsultation = await model.Consultation.findOne({_id: x.history_id})
        const dataResponsibleLastConsultation = await model.Person.findOne({_id: getLastConsultation.responsableConsultation}) 
        let lastDiagnosis = null       
        if (getLastConsultation && getLastConsultation.diagnostic && getLastConsultation.diagnostic.length > 0) {
            let disct = getLastConsultation.diagnostic;
            
            for (let i in disct) {
                if(disct[i].diagnostic){
                    if(disct[i].diagnostic.es){
                        lastDiagnosis = disct[i].diagnostic.es
                    }
                }
          }
        }
        
        let data = {
            num_exp: x.patient.idQflow,
            pat_name: `${x.patient.forename} ${x.patient.surname}`,
            pat_age: moment().diff(moment(x.patient.birthdate), "years"),
            pat_gender: x.patient.gender,
            diagnosis: lastDiagnosis,
            surgery: x.surgery,
            resumen_history: x.resumen_history,
            biometrics_od: x.biometrics_od,
            biometrics_oi: x.biometrics_oi,
            anesthesia: x.anesthesia,
            supplies_special: x.supplies_special,
            eye_operated: x.eye_operated,
            time_surgery: x.time_surgery,
            lens_placed: x.lens_placed,
            anesthesia_applied: x.anesthesia_applied,
            complications: x.complications,
            description: x.description,
            biopsy_culture: x.biopsy_culture,
            operation_performed: x.operation_performed,
            surgeon_name: x.surgeon_name,
            observations: x.observations,
            physician_name: `${x.responsible.forename} ${x.responsible.surname}`,
            physician_history_name: `${dataResponsibleLastConsultation.forename} ${dataResponsibleLastConsultation.surname}`,
            responsible: x.responsible._id,
            history_id: x.history_id,
            patient: x.patient._id,
            physician_signature:
              x.responsible.digital_signature,
            physician_specialty: x.responsible.role,
            date_surgery: moment(x.date_surgery).utc().format("DD/MM/YYYY"),
          }

        const signature = await signatura_base64(data.physician_signature)
        data.digital_signature = signature

        const pdf_data = await create_report_pdf("surgery_sheet.html", data)
        const report_id = await save_file(`surgery_sheet_${data.num_exp}.pdf`, pdf_data)
        await model.SurgerySheet.updateOne(
            {
            _id: mongoose.Types.ObjectId(x._id),
            },
            {
            $set: {
                pdf: report_id,
            },
            }
        );

        await deleteFile(x.pdf)
        await model.Consultation.updateOne(
          {
            file: mongoose.Types.ObjectId(x.pdf),
          },
          {
            $set: {
              file: report_id,
            },
          }
        );
        }

        response.json({
            'status': 'OK',
            'message': null,
            'documents': true
        })
    } catch (error) {
        console.log(error)
        response.status(400).json({
            'status': 'KO',
            'message': 'Error creating report',
            'documents': []
        })
    }
})

module.exports = router;
