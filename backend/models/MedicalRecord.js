const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordType: {
    type: String,
    enum: ['consultation', 'lab_result', 'prescription', 'imaging', 'vaccination', 'surgery', 'emergency'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Clinical data
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' }
    },
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' }
    },
    temperature: {
      value: Number,
      unit: { type: String, enum: ['C', 'F'], default: 'F' }
    },
    weight: {
      value: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'lbs' }
    },
    height: {
      value: Number,
      unit: { type: String, enum: ['cm', 'ft'], default: 'ft' }
    },
    oxygenSaturation: {
      value: Number,
      unit: { type: String, default: '%' }
    },
    respiratoryRate: {
      value: Number,
      unit: { type: String, default: 'breaths/min' }
    }
  },
  
  // Diagnosis and treatment
  diagnosis: {
    primary: String,
    secondary: [String],
    icdCodes: [String]
  },
  symptoms: [String],
  treatmentPlan: String,
  
  // Prescriptions
  prescriptions: [{
    medication: {
      name: String,
      genericName: String,
      strength: String,
      form: { type: String, enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'inhaler'] }
    },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    refills: Number,
    prescribedDate: { type: Date, default: Date.now },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  
  // Lab results
  labResults: [{
    testName: String,
    testCode: String,
    result: String,
    normalRange: String,
    unit: String,
    status: { type: String, enum: ['normal', 'abnormal', 'critical'], default: 'normal' },
    orderedDate: Date,
    resultDate: Date,
    labName: String
  }],
  
  // Imaging results
  imagingResults: [{
    type: { type: String, enum: ['x-ray', 'ct', 'mri', 'ultrasound', 'mammogram', 'ecg'] },
    bodyPart: String,
    findings: String,
    impression: String,
    imageUrl: String,
    reportUrl: String,
    orderedDate: Date,
    performedDate: Date,
    radiologist: String
  }],
  
  // Follow-up care
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    instructions: String,
    department: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
  },
  
  // Attachments and documents
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],
  
  // Access control
  visibility: {
    type: String,
    enum: ['private', 'shared_with_doctors', 'public'],
    default: 'shared_with_doctors'
  },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedAt: Date,
    permissions: [{ type: String, enum: ['read', 'write', 'comment'] }]
  }],
  
  // Audit trail
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revisionHistory: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: Date,
    changes: mongoose.Schema.Types.Mixed,
    reason: String
  }],
  
  // Status and flags
  isActive: {
    type: Boolean,
    default: true
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });
medicalRecordSchema.index({ appointment: 1 });
medicalRecordSchema.index({ recordType: 1, patient: 1 });
medicalRecordSchema.index({ 'diagnosis.primary': 1 });
medicalRecordSchema.index({ tags: 1 });

// Virtual for record age
medicalRecordSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to add revision to history
medicalRecordSchema.methods.addRevision = function(modifiedBy, changes, reason) {
  this.revisionHistory.push({
    modifiedBy,
    modifiedAt: new Date(),
    changes,
    reason
  });
  this.lastModifiedBy = modifiedBy;
};

// Static method to get patient's medical summary
medicalRecordSchema.statics.getPatientSummary = async function(patientId) {
  const records = await this.find({ patient: patientId, isActive: true })
    .sort({ createdAt: -1 })
    .populate('doctor', 'firstName lastName specialization')
    .limit(50);
    
  const summary = {
    totalRecords: records.length,
    recentDiagnoses: [],
    activePrescriptions: [],
    criticalRecords: [],
    lastVisit: null
  };
  
  records.forEach(record => {
    if (record.diagnosis.primary) {
      summary.recentDiagnoses.push(record.diagnosis.primary);
    }
    
    record.prescriptions.forEach(prescription => {
      if (prescription.isActive) {
        summary.activePrescriptions.push(prescription);
      }
    });
    
    if (record.isCritical) {
      summary.criticalRecords.push(record);
    }
    
    if (!summary.lastVisit && record.appointment) {
      summary.lastVisit = record.createdAt;
    }
  });
  
  return summary;
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
