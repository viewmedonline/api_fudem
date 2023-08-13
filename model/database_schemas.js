let mongoose = require('mongoose')
let mongoosePaginate = require('mongoose-paginate')
let Schema = mongoose.Schema

let controlSchema = new Schema({
 _id: false,
 active: { type: Boolean, default: true },
 created_at: { type : Date, default: Date.now },
 created_by: { type: Schema.Types.ObjectId, ref: 'User', default: '1a11aaaa11a1a1111a11a1a1' },
 updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: '1a11aaaa11a1a1111a11a1a1' }
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } })

let geometrySchema = new Schema({
    _id: false,
    type: String,
    coordinates: []
})
let placeSchema = new Schema({
    _id: false,
    country: String,
    state: String,
    city: String,
    street: String,
    geometry: geometrySchema
})
let langSchema = new Schema({
    _id: false,
    en: String,
    es: String,
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })
let icd10diagnosisSchema = new Schema({
    level: Number,
    code: String,
    diagnostic: { type: langSchema, default: {} },
    include: [String],
    discard: [String],
    control: { type: controlSchema, required: true, default: {} }
}, { collection: 'icd10_diagnosis', versionKey: false })

let icd10diagnosisFudemSchema = new Schema({
    level: Number,
    code: String,
    diagnostic: { type: langSchema, default: {} },
    include: [String],
    discard: [String],
    control: { type: controlSchema, required: true, default: {} }
}, { collection: 'icd10_diagnosis_fudem', versionKey: false })

let personSchema = new Schema({
    forename: String,
    surname: String,
    birthdate: Date,
    type_document: String,
    id_document: String,
    without_document: { type: Boolean, default: false },
    gender: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, lowercase: true, trim: true },
    alternate_email: { type: String, lowercase: true, trim: true },
    phone: [String],
    readWrtite: { type: Boolean, default: true },
    address: { type: placeSchema, default: {} },
    background: { type: Schema.Types.ObjectId, ref: 'fs.file' },
    type: String, //Person type: 'patient' or 'physician'
    social_networks: [{ _id: false, name: String, url: String, displayed: { type: Boolean, default: true } }],
    digital_signature: { type: Schema.Types.ObjectId, ref: 'fs.file' },
    curriculum: String,
    id_professional: String,
    medical_school: String,
    specialty: String,
    sub_specialty: String,
    description: String,
    profession: String,
    work_experience: Date,
    services: String,
    photos: [{ type: Schema.Types.ObjectId, ref: 'fs.file' }],
    blood_type: String,
    blood_factor: String,
    progenitor: { type: Schema.Types.ObjectId, ref: 'Person' },
    insurance: [String],
    occupation: String,
    work_name: String,
    work_address: placeSchema,
    work_phone: [String],
    vc_online: { type: Boolean, default: false },
    lenses: { type: Boolean, default: false },
    category: String,
    nationality: String,
    expfudemcare: String,
    expstatus: String,
    housinglocation: String,
    role: { type: String, required: true },
    registrationdate: Date,
    celphone: String,
    record: { type: Schema.Types.ObjectId, ref: 'Record' },
    idQflow: { type: String, required: true },
    brandLenses: { ojoDer: String, ojoIzq: String },
    historyClinic: String,
    control: { type: controlSchema, required: true, default: {} }
}, { collection: 'persons', versionKey: false })

let userSchema = new Schema({
    user: { type: String, required: true },
    passwd: { type: String, required: true },
    services: String,
    role: { type: String, required: true },
    idUserFudem: { type: String, required: true },
    token: String,
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

let antecedentSchema = new Schema({
    _id: false,
    name: String,
    value: { type: Boolean, default: false }
}, { versionKey: false })

let nurseSheet = new Schema({
    patient: {type: Schema.Types.ObjectId, ref: 'Person' },
    age: Number,
    date_sheet: Date,
    heart_rate: String,
    blood_pressure: String,
    pdf: { type: Schema.Types.ObjectId, ref: 'fs.file', default: null },
    notes_nurses: [
        {
            _id: false,
            note: String,
            date: Date,
            responsible: { type: Schema.Types.ObjectId, ref: 'Person' }

        }
    ],
}, { versionKey: false })

let cirugiasSchema = new Schema({
    _id: false,
    name: String,
    eyeRight: { type: Boolean, default: false },
    eyeLeft: { type: Boolean, default: false }
}, { versionKey: false })

let recordSchema = new Schema({
    antecedent: { antecedentes: [antecedentSchema], otros: String, medicamentosAntecedent: String },
    cirugias: { cirugias: [cirugiasSchema], othersEyeRight: String, othersEyeLeft: String },
    otrosDatos: { _id: false, alergias: [String], medicamentos: [String] },
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

let fileSchema = new Schema({
    filename: String,
    contentType: String,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: String,
    metadata: String,
    md5: String,
}, { versionKey: false })

let consultationSchema = new Schema({
    reasonConsultation: String,
    typeConsultation: String,
    agudezaVisual: { ojoDer: { correccion: String, sinCorreccion: String }, ojoIzq: { correccion: String, sinCorreccion: String }, observation: String },
    autorefraccionA: { ojoDer: { esfera: String, cilindro: String, eje: String }, ojoIzq: { esfera: String, cilindro: String, eje: String } },
    queratometria: { ojoDer: { esfera: String, cilindro: String, ejeEs: String, ejeCil: String }, ojoIzq: { esfera: String, cilindro: String, ejeEs: String, ejeCil: String } },
    lensometria: { ojoDer: { esfera: String, cilindro: String, eje: String, adicion: String, prisma: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, adicion: String, prisma: String } },
    tonometria: { ojoDer: String, ojoIzq: String },
    generalData: { typeLense: String },
    agudezaVisualOPT: { ojoDer: { correccion: String, sinCorreccion: String, ph: String, autoTonometria: String }, ojoIzq: { correccion: String, sinCorreccion: String, ph: String, autoTonometria: String } },
    refraccion: { ciclo: { type: Boolean, default: false }, est: { type: Boolean, default: false }, dinm: { type: Boolean, default: false }, ojoDer: { esfera: String, cilindro: String, eje: String, av: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, av: String } },
    rxFinalGafas: { ojoDer: { esfera: String, cilindro: String, eje: String, Prisma: String, ADD: String, av: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, Prisma: String, ADD: String, av: String } },
    rxFinalLentesContacto: { ojoDer: { esfera: String, cilindro: String, eje: String, cb: String, dia: String, av: String, brand: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, cb: String, dia: String, av: String, brand: String } },
    rxFinalVisionLejano: { ojoDer: { esfera: String, cilindro: String, eje: String, prisma: String, av: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, prisma: String, av: String } },
    rxFinalVisionProxima: { ojoDer: { esfera: String, cilindro: String, eje: String, prisma: String, av: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, prisma: String, av: String } },
    rxFinalVisionIntermedia: { ojoDer: { esfera: String, cilindro: String, eje: String, prisma: String, av: String }, ojoIzq: { esfera: String, cilindro: String, eje: String, prisma: String, av: String } },
    diagnosticoObservaciones: { diagnostico: [cirugiasSchema], Observaciones: String },
    datapreliminar: { ppm: { ojoDer: { dato: String, otro: String }, ojoIzq: { dato: String, otro: String } }, agudezavisual: { ojoDer: { sc: String, cc: String, autocorreccion: String }, ojoIzq: { sc: String, cc: String, autocorreccion: String } }, examenexterno: { ojoder: String, ojoizq: String }, biomicroscopio: { ojoder: String, ojoizq: String }, fundoscopia: { ojoder: String, ojoizq: String }, gonioscopia: { ojoder: String, ojoizq: String }, tonometria: { ojoder: String, ojoizq: String } },
    process: [{ process: String, other: String, eye: String }],
    processTherapeutic: [{ process: String, eye: String }],
    treatmentplan: { tratamiento: [antecedentSchema], laser: String, lentes: String, otros: String },
    diagnostic: [],
    observaciones: { observacion: String, medicamentos: [], recetas: [] },
    person: { type: Schema.Types.ObjectId, ref: 'Person' },
    record: recordSchema,
    historyClinic: String,
    file: { type: Schema.Types.ObjectId, ref: 'fs.file' },
    dateUpload: Date,
    name: String,
    responsableConsultation: { type: Schema.Types.ObjectId, ref: 'Person' },
    responsablePreliminar: String,
    optometriaOft: String,
    objPreliminary: {
        control: { type: controlSchema, required: true, default: {} },
        data: {}
    },
    objOphthalmology: {
        control: { type: controlSchema, required: true, default: {} },
        data: {}
    },
    objOptometrist: {
        control: { type: controlSchema, required: true, default: {} },
        data: {}
    },
    next_appointment: String,
    observationsOphthalmology: String,
    sucursalId: { type: Schema.Types.ObjectId, ref: 'branchOffice' },
    receta: String,
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })
 
let imagingSchema = new Schema({
    person: { type: Schema.Types.ObjectId, ref: 'Person' },
    file: { type: Schema.Types.ObjectId, ref: 'fs.file' },
    name: String,
    dateImagin: String,
    responsableConsultation: { type: Schema.Types.ObjectId, ref: 'Person' },
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

let constancyShema = new Schema({
    person: { type: Schema.Types.ObjectId, ref: 'Person' },
    description: String,
    date: Date,
    responsableconstancy: { type: Schema.Types.ObjectId, ref: 'Person' },
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

let  branchOfficeSchema = new Schema({
        Name: String,
        ParentUnitId: Number,
        UnitId: Number,
        Description: String,
        UnitType: String,
        control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

let referenceSchema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Person' },
    pdf: { type: Schema.Types.ObjectId, ref: 'fs.file', default: null },
    responsible: { type: Schema.Types.ObjectId, ref: 'Person' },
    control: { type: controlSchema, required: true, default: {} }
}, { versionKey: false })

module.exports = {
    Person: mongoose.model('Person', personSchema),
    User: mongoose.model('User', userSchema),
    Record: mongoose.model('Record', recordSchema),
    ICD10Diagnosis: mongoose.model('ICD10Diagnosis', icd10diagnosisSchema),
    ICD10DiagnosisFudem: mongoose.model('ICD10DiagnosisFudem', icd10diagnosisFudemSchema),
    Consultation: mongoose.model('Consultation', consultationSchema),
    File: mongoose.model('fs.file', fileSchema),
    Imaging: mongoose.model('Imaging', imagingSchema),
    Constancy: mongoose.model('Constancy', constancyShema),
    branchOffice: mongoose.model('branchOffice', branchOfficeSchema),
    nurseSheet: mongoose.model('nurseSheet', nurseSheet),
    Reference: mongoose.model('Reference', referenceSchema)
}