let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate");
let Schema = mongoose.Schema;

let controlSchema = new Schema(
  {
    _id: false,
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: "1a11aaaa11a1a1111a11a1a1",
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: "1a11aaaa11a1a1111a11a1a1",
    },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" } }
);

let geometrySchema = new Schema({
  _id: false,
  type: String,
  coordinates: [],
});
let placeSchema = new Schema({
  _id: false,
  country: String,
  state: String,
  city: String,
  street: String,
  geometry: geometrySchema,
});
let langSchema = new Schema(
  {
    _id: false,
    en: String,
    es: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);
let icd10diagnosisSchema = new Schema(
  {
    level: Number,
    code: String,
    diagnostic: { type: langSchema, default: {} },
    include: [String],
    discard: [String],
    control: { type: controlSchema, required: true, default: {} },
  },
  { collection: "icd10_diagnosis", versionKey: false }
);

let icd10diagnosisFudemSchema = new Schema(
  {
    level: Number,
    code: String,
    disable: { type: Boolean, default: false },
    diagnostic: { type: langSchema, default: {} },
    include: [String],
    discard: [String],
    control: { type: controlSchema, required: true, default: {} },
  },
  { collection: "icd10_diagnosis_fudem", versionKey: false }
);

let masterDiagnosisSchema = new Schema(
  {
    disable: { type: Boolean, default: false },
    diagnostic: String,
    type: String,
  },
  { collection: "master_diagnosis_fudem", versionKey: false }
);

let personSchema = new Schema(
  {
    forename: String,
    surname: String,
    birthdate: Date,
    type_document: String,
    id_document: String,
    without_document: { type: Boolean, default: false },
    gender: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, lowercase: true, trim: true },
    alternate_email: { type: String, lowercase: true, trim: true },
    phone: [String],
    readWrtite: { type: Boolean, default: true },
    address: { type: placeSchema, default: {} },
    background: { type: Schema.Types.ObjectId, ref: "fs.file" },
    type: String, //Person type: 'patient' or 'physician'
    social_networks: [
      {
        _id: false,
        name: String,
        url: String,
        displayed: { type: Boolean, default: true },
      },
    ],
    digital_signature: { type: Schema.Types.ObjectId, ref: "fs.file" },
    curriculum: String,
    id_professional: String,
    medical_school: String,
    specialty: String,
    sub_specialty: String,
    description: String,
    profession: String,
    work_experience: Date,
    services: String,
    photos: [{ type: Schema.Types.ObjectId, ref: "fs.file" }],
    blood_type: String,
    blood_factor: String,
    progenitor: { type: Schema.Types.ObjectId, ref: "Person" },
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
    record: { type: Schema.Types.ObjectId, ref: "Record" },
    idQflow: { type: String, required: true },
    brandLenses: { ojoDer: String, ojoIzq: String },
    historyClinic: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { collection: "persons", versionKey: false }
);

let userSchema = new Schema(
  {
    user: { type: String, required: true },
    passwd: { type: String, required: true },
    services: String,
    role: { type: String, required: true },
    idUserFudem: { type: String, required: true },
    token: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let antecedentSchema = new Schema(
  {
    _id: false,
    name: String,
    value: { type: Boolean, default: false },
  },
  { versionKey: false }
);

let nurseSheet = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    age: Number,
    date_sheet: Date,
    heart_rate: String,
    blood_pressure: String,
    hgt: String,
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    notes_nurses: [
      {
        _id: false,
        note: String,
        date: Date,
        responsible: { type: Schema.Types.ObjectId, ref: "Person" },
      },
    ],
  },
  { versionKey: false }
);

const surgerySchema = new Schema(
  {
    surgery: String,
    resumen_history: String,
    biometrics_od: String,
    biometrics_oi: String,
    anesthesia: String,
    supplies_special: String,
    eye_operated: String,
    time_surgery: String,
    lens_placed: String,
    anesthesia_applied: String,
    complications: String,
    description: String,
    biopsy_culture: String,
    operation_performed: String,
    surgeon_name: String,
    observations: String,
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    history_id: { type: Schema.Types.ObjectId, ref: "Consultation" },
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    date_surgery: String,
  },
  { versionKey: false }
);

const internEvaluationSchema = new Schema(
  {
    date: String,
    preoperative_diagnosis: String,
    history_clinic: String,
    personal_record: String,
    pa: String,
    fc: String,
    fr: String,
    oxygen_saturation: String,
    physical_state: String,
    ht: String,
    hb: String,
    platelets: String,
    tp: String,
    tpt: String,
    inr: String,
    glucose: String,
    vih: String,
    ego: String,
    hba1c: String,
    radiography: String,
    electrocardiogram: String,
    comments: String,
    surgical_risk: String,
    functional_capacity: String,
    clinical_predictors: String,
    clasification_asa: String,
    plan: String,
    appointmentType: String,
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    person: { type: Schema.Types.ObjectId, ref: "Person" },
  },
  { versionKey: false }
);

let cirugiasSchema = new Schema(
  {
    _id: false,
    name: String,
    eyeRight: { type: Boolean, default: false },
    eyeLeft: { type: Boolean, default: false },
  },
  { versionKey: false }
);

let recordSchema = new Schema(
  {
    antecedent: {
      antecedentes: [antecedentSchema],
      otros: String,
      medicamentosAntecedent: String,
    },
    cirugias: {
      cirugias: [cirugiasSchema],
      othersEyeRight: String,
      othersEyeLeft: String,
    },
    otrosDatos: { _id: false, alergias: [String], medicamentos: [String] },
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let fileSchema = new Schema(
  {
    filename: String,
    contentType: String,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: String,
    metadata: String,
    md5: String,
  },
  { versionKey: false }
);

let chunkSchema = new Schema(
  {
    _id: false,
    n: Number,
    data: Buffer,
    date: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

let consultationSchema = new Schema(
  {
    reasonConsultation: String,
    typeConsultation: String,
    agudezaVisual: {
      ojoDer: { correccion: String, sinCorreccion: String, optotipo: String },
      ojoIzq: { correccion: String, sinCorreccion: String, optotipo: String },
      observation: String,
    },
    autorefraccionA: {
      ojoDer: { esfera: String, cilindro: String, eje: String },
      ojoIzq: { esfera: String, cilindro: String, eje: String },
    },
    queratometria: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        ejeEs: String,
        ejeCil: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        ejeEs: String,
        ejeCil: String,
      },
    },
    lensometria: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        adicion: String,
        prisma: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        adicion: String,
        prisma: String,
      },
    },
    tonometria: { ojoDer: String, ojoIzq: String },
    reason: String,
    generalData: { typeLense: String },
    agudezaVisualOPT: {
      ojoDer: {
        correccion: String,
        sinCorreccion: String,
        ph: String,
        autoTonometria: String,
        optotipo: String,
      },
      ojoIzq: {
        correccion: String,
        sinCorreccion: String,
        ph: String,
        autoTonometria: String,
        optotipo: String,
      },
      observation: String,
    },
    refraccion: {
      ciclo: { type: Boolean, default: false },
      est: { type: Boolean, default: false },
      dinm: { type: Boolean, default: false },
      ppc: String,
      ct: String,
      rp: String,
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        av: String,
        add: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        av: String,
        add: String,
      },
    },
    rxFinalGafas: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        Prisma: String,
        ADD: String,
        av: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        Prisma: String,
        ADD: String,
        av: String,
      },
      ocupation: String,
      type_lenses: String,
    },
    rxFinalLentesContacto: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        cb: String,
        dia: String,
        av: String,
        brand: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        cb: String,
        dia: String,
        av: String,
        brand: String,
      },
    },
    rxFinalVisionLejano: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
    },
    rxFinalVisionProxima: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
    },
    rxFinalVisionIntermedia: {
      ojoDer: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
      ojoIzq: {
        esfera: String,
        cilindro: String,
        eje: String,
        prisma: String,
        av: String,
      },
    },
    diagnosticoObservaciones: {
      diagnostico: [cirugiasSchema],
      Observaciones: String,
    },
    datapreliminar: {
      ppm: {
        ojoDer: { dato: String, otro: String },
        ojoIzq: { dato: String, otro: String },
      },
      agudezavisual: {
        ojoDer: {
          sc: String,
          cc: String,
          autocorreccion: String,
          optotipo: String,
        },
        ojoIzq: {
          sc: String,
          cc: String,
          autocorreccion: String,
          optotipo: String,
        },
        observation: String,
      },
      examenexterno: { ojoder: String, ojoizq: String },
      biomicroscopio: { ojoder: String, ojoizq: String },
      fundoscopia: { ojoder: String, ojoizq: String },
      gonioscopia: { ojoder: String, ojoizq: String },
      tonometria: { ojoder: String, ojoizq: String },
    },
    process: [{ process: String, other: String, eye: String }],
    processTherapeutic: [{ process: String, eye: String }],
    treatmentplan: {
      tratamiento: [antecedentSchema],
      laser: String,
      lentes: String,
      otros: String,
    },
    diagnostic: [],
    daysPostOperatory: Number,
    observaciones: { observacion: String, medicamentos: [], recetas: [] },
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    record: recordSchema,
    historyClinic: String,
    file: { type: Schema.Types.ObjectId, ref: "fs.file" },
    dateUpload: Date,
    name: String,
    responsableConsultation: { type: Schema.Types.ObjectId, ref: "Person" },
    responsablePreliminar: String,
    optometriaOft: String,
    objPreliminary: {
      control: { type: controlSchema, required: true, default: {} },
      data: {},
    },
    objOphthalmology: {
      control: { type: controlSchema, required: true, default: {} },
      data: {},
    },
    objOptometrist: {
      control: { type: controlSchema, required: true, default: {} },
      data: {},
    },
    next_appointment: String,
    observationsOphthalmology: String,
    sucursalId: { type: Schema.Types.ObjectId, ref: "branchOffice" },
    receta: String,
    prescription: { type: Schema.Types.ObjectId, ref: "Prescription" },
    prescription_of: { type: Schema.Types.ObjectId, ref: "Prescription" },
    refer_to_ofta: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let imagingSchema = new Schema(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    file: { type: Schema.Types.ObjectId, ref: "fs.file" },
    name: String,
    dateImagin: String,
    responsableConsultation: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let psyProcessSchema = new Schema(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    sessionNumber: String,
    stateProcess: String,
    dateStart: Date,
    dateEnd: Date,
    createdAt: { type: Date, default: Date.now },
    problemSummary: String,
    diagnosticImpression: String,
    diagnostic: [String],
    descriptions: [
      {
        description: String,
        date: String,
      },
    ],
    active: { type: Boolean, default: true },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file" },
    responsableConsultation: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let psyInterviewChildrenSchema = new Schema(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file" },
    responsableConsultation: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
    dateInit: String,
    timeConsultation: String,
    responsableName: String,
    responsableDui: String,
    reasonConsultation: String,
    symptomsPresent: String,
    appearanceProblem: String,
    informationDad: String,
    informationMom: String,
    abandonmentParents: String,
    recordFamilyExist: String,
    recordPsychiatricFamilyExist: String,
    recordFamilyAbuseExist: String,
    childsRoutine: String,
    sleepCycle: String,
    fixGaze: String,
    useGlasses: String,
    visualProblem: String,
    visualProblemDescription: String,
    makeFriendsEasily: String,
    whyNotMakeFriendsEasily: String,
    fightWithOtherChildren: String,
    relationshipWithChildrenOfOtherSex: String,
    whatHeLikesToDoInHisFreeTime: String,
    whatDoIsAlone: String,
    whatNotLikeDo: String,
    favoriteGames: String,
    whatSportsHeLikes: String,
    whatTVShowsHeWatches: String,
    wahtMakesHimHappy: String,
    wahtMakesHimSad: String,
    wahtMakesHimAngry: String,
    wahtMakesHimAfraid: String,
    pregnancyMother: String,
    pregnancyMotherNumber: String,
    howWasPregnancy: String,
    pregnancyMotherProblem: String,
    pregnancyMotherAbuse: String,
    pregnancyMotherPsiProblem: String,
    childBirth: String,
    cordComplication: String,
    responsablePhone: String,
  },
  { versionKey: false }
);

let psyInterviewAdultsSchema = new Schema(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file" },
    responsableConsultation: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
    dateInit: String,
    timeConsultation: String,
    reasonConsultation: String,
    firstTimeBad: String,
    causesOfProblem: String,
    symptomsCharacteristics: String,
    currentSymptoms: String,
    symptomPhenomenon: String,
    civilState: String,
    haveChildren: String,
    whatLikeRelation: String,
    nameSon: String,
    ageSon: String,
    liveWithYou: String,
    relationParents: String,
    hasBrother: String,
    relevantAspects: String,
    significantPerson: String,
    workActually: String,
    workDescription: String,
    dependents: String,
    notWorkDescription: String,
    howMaintainedEconomy: String,
    psychiatricTreatment: String,
    psychiatricTreatmentDescription: String,
    psychiatricConsultingPrevius: String,
    medicalPsiTreatment: String,
    whatsMedication: String,
    drinkFrequency: String,
    questionDrink: String,
    drinkAlcohol: String,
    frequencyAbsences: String,
    reduceDrink: String,
    drinkProblem: String,
    drinkProblemPsychological: String,
    abuseExist: String,
    fightsExist: String,
    ridiculeParents: String,
    physicalAbuseExist: String,
    otherAbuseExist: String,
    suicideAttempt: String,
    suicideAttemptDescription: String,
    whatDidAfterSuicideAttempts: String,
  },
  { versionKey: false }
);

let constancyShema = new Schema(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person" },
    description: String,
    date: Date,
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file" },
    responsableconstancy: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let branchOfficeSchema = new Schema(
  {
    Name: String,
    ParentUnitId: Number,
    UnitId: Number,
    Description: String,
    UnitType: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let referenceSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let perdiatricSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    diagnosisPre: String,
    stateDiagnosis: String,
    clinicObservation: String,
    recordNP: String,
    recordP: String,
    vaccination: String,
    blood_pressure: String,
    heart_rate: String,
    respiratory_rate: String,
    oxygen_saturation: String,
    temp: String,
    weight: String,
    size: String,
    physicalExam: String,
    ht: String,
    hb: String,
    platelets: String,
    tp: String,
    tpt: String,
    inr: String,
    glucose: String,
    vih: String,
    ego: String,
    hba1c: String,
    radiography: String,
    electrocardiogram: String,
    comments: String,
    surgical_risk: String,
    functional_capacity: String,
    clinical_predictors: String,
    clasification_asa: String,
    plan: String,
    diagnosis: String,
    date: Date,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let nutritionistSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    diagnosisRefer: String,
    colitis: String,
    gastritis: String,
    constipation: String,
    diarrhea: String,
    diabetes: String,
    hta: String,
    otherRecords: String,
    previousSurgery: String,
    currentMedication: String,
    currentMedicationFrom: String,
    glycemia: String,
    hemoglobin: String,
    triglycerides: String,
    cholesterol: String,
    creatinine: String,
    uricAcid: String,
    albumin: String,
    hematocrit: String,
    glycosylatedh: String,
    hdl: String,
    sodium: String,
    ld: String,
    calcium: String,
    magnesium: String,
    lifestyle: [
      {
        activity: String,
        horary: {
          from: String,
          to: String,
        },
        foodConsumed: String,
      },
    ],
    consumptionFrequency: [
      {
        consumption: String,
        quatityAndFrecuency: String,
      },
    ],
    unpleasantFoods: String,
    allergicFoods: String,
    intolerableFoods: String,
    weight: String,
    idealWeight: String,
    goalWeight: String,
    size: String,
    imc: String,
    nutritionalStatus: String,
    WaistCircumference: String,
    cho: String,
    chon: String,
    cooh: String,
    prescribedDiet: String,
    comments: String,
    date: Date,
    clinicHistory: String,
    bodyFat: String,
    bodyWater: String,
    muscleMass: String,
    physicalAssessment: String,
    dciBmr: String,
    metabolicAge: String,
    boneMass: String,
    viseralFat: String,
    diagnosesImg1: String,
    diagnosesImg2: String,
    diagnosesImg3: String,
    diagnosesImg4: String,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let anesthesiologytSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    pdf: { type: Schema.Types.ObjectId, ref: "fs.file", default: null },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    operationDate: String,
    operationTime: String,
    operationDateFormat: Date,
    preoperativeDiagnosis: String,
    MedicalHistory: String,
    typeAnesthesia: String,
    anesthesiaTechnique: String,
    asaClassification: String,
    VitalSigns: {
      ta: [],
      fc: [],
      fr: [],
      temp: [],
      pso2: [],
      pco2: [],
    },
    medicines: [
      {
        description: String,
        doses: String,
      },
    ],
    solutions: [
      {
        description: String,
        doses: String,
      },
    ],
    date: Date,
    control: { type: controlSchema, required: true, default: {} },
  },
  { versionKey: false }
);

let consumedSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    description: String,
  },
  { versionKey: false }
);

let activitySchema = new Schema(
  {
    active: { type: Boolean, default: true },
    description: String,
  },
  { versionKey: false }
);

let lensSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    description: String,
  },
  { versionKey: false, collection: "type_lenses" }
);

let prescriptionSchema = new Schema(
  {
    prescription: [
      {
        medicine: String,
        active_ingredient: String,
        doses: String,
        recomendation: String,
      },
    ],
    place: String,
    patient: { type: Schema.Types.ObjectId, ref: "Person" },
    responsible: { type: Schema.Types.ObjectId, ref: "Person" },
    control: { type: controlSchema, required: true, default: {} },
  },
  {
    versionKey: false,
  }
);

let medicinesSchema = new Schema(
  {
    description: String,
    generic: { type: String, default: null },
    recomendation: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
  }
);

module.exports = {
  Person: mongoose.model("Person", personSchema),
  User: mongoose.model("User", userSchema),
  Record: mongoose.model("Record", recordSchema),
  ICD10Diagnosis: mongoose.model("ICD10Diagnosis", icd10diagnosisSchema),
  ICD10DiagnosisFudem: mongoose.model(
    "ICD10DiagnosisFudem",
    icd10diagnosisFudemSchema
  ),
  Consultation: mongoose.model("Consultation", consultationSchema),
  File: mongoose.model("fs.file", fileSchema),
  Chunks: mongoose.model("fs.chunks", chunkSchema),
  Imaging: mongoose.model("Imaging", imagingSchema),
  Constancy: mongoose.model("Constancy", constancyShema),
  branchOffice: mongoose.model("branchOffice", branchOfficeSchema),
  nurseSheet: mongoose.model("nurseSheet", nurseSheet),
  Reference: mongoose.model("Reference", referenceSchema),
  SurgerySheet: mongoose.model("SurgerySheet", surgerySchema),
  InternEvaluation: mongoose.model("InternEvaluation", internEvaluationSchema),
  PediatricEvaluation: mongoose.model("PediatricEvaluation", perdiatricSchema),
  NutritionalControl: mongoose.model("NutritionalControl", nutritionistSchema),
  ReportAnesthesiology: mongoose.model(
    "ReportAnesthesiology",
    anesthesiologytSchema
  ),
  consumedMaster: mongoose.model("consumedMaster", consumedSchema),
  activityMaster: mongoose.model("activityMaster", activitySchema),
  psyProcess: mongoose.model("psyProcess", psyProcessSchema),
  MasterDiagnosis: mongoose.model("MasterDiagnosis", masterDiagnosisSchema),
  PsyInterviewChildren: mongoose.model(
    "PsyInterviewChildren",
    psyInterviewChildrenSchema
  ),
  PsyInterviewAdults: mongoose.model(
    "PsyInterviewAdults",
    psyInterviewAdultsSchema
  ),
  Lens: mongoose.model("lenses_type", lensSchema),
  Prescription: mongoose.model("Prescription", prescriptionSchema),
  Medicines: mongoose.model("Medicines", medicinesSchema),
};
