const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize, doctorOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Private (Doctor only)
router.post('/', protect, doctorOnly, [
  body('patient').isMongoId(),
  body('recordType').isIn(['consultation', 'lab_result', 'prescription', 'imaging', 'vaccination', 'surgery', 'emergency']),
  body('title').trim().isLength({ min: 1 }),
  body('appointment').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const recordData = {
      ...req.body,
      doctor: req.user._id
    };

    // Verify patient exists
    const patient = await User.findById(req.body.patient);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    // Verify appointment exists if provided
    if (req.body.appointment) {
      const appointment = await Appointment.findById(req.body.appointment);
      if (!appointment) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
      }
    }

    const medicalRecord = new MedicalRecord(recordData);
    await medicalRecord.save();

    await medicalRecord.populate('patient', 'firstName lastName email');
    await medicalRecord.populate('doctor', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating medical record'
    });
  }
});

// @desc    Get medical records
// @route   GET /api/medical-records
// @access  Private
router.get('/', protect, [
  query('patient').optional().isMongoId(),
  query('recordType').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { patient, recordType, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    // Role-based filtering
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      if (patient) {
        filter.patient = patient;
        // Verify doctor has access to this patient
        const hasAccess = await Appointment.findOne({
          patient: patient,
          doctor: req.user._id
        });
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to this patient\'s records'
          });
        }
      } else {
        filter.doctor = req.user._id;
      }
    }
    // Admin can see all records

    if (recordType) filter.recordType = recordType;

    const medicalRecords = await MedicalRecord.find(filter)
      .populate('patient', 'firstName lastName email dateOfBirth')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'appointmentDate appointmentTime status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MedicalRecord.countDocuments(filter);

    res.json({
      success: true,
      data: medicalRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical records'
    });
  }
});

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email dateOfBirth phone')
      .populate('doctor', 'firstName lastName specialization currentHospital')
      .populate('appointment', 'appointmentDate appointmentTime status type')
      .populate('lastModifiedBy', 'firstName lastName role');

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    const hasAccess = medicalRecord.patient._id.toString() === req.user._id.toString() ||
                     medicalRecord.doctor._id.toString() === req.user._id.toString() ||
                     req.user.role === 'admin' ||
                     medicalRecord.sharedWith.some(share => share.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this medical record'
      });
    }

    res.json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical record'
    });
  }
});

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor only)
router.put('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Only the doctor who created the record or admin can update
    if (medicalRecord.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the creating doctor can update this record.'
      });
    }

    // Track changes for audit
    const originalData = medicalRecord.toObject();
    
    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'vitalSigns', 'diagnosis', 'symptoms', 
      'treatmentPlan', 'prescriptions', 'labResults', 'imagingResults', 
      'followUp', 'notes', 'tags'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add revision to history
    medicalRecord.addRevision(req.user._id, updates, req.body.revisionReason || 'Record updated');

    Object.assign(medicalRecord, updates);
    await medicalRecord.save();

    await medicalRecord.populate('patient', 'firstName lastName email');
    await medicalRecord.populate('doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: medicalRecord
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medical record'
    });
  }
});

// @desc    Get patient medical summary
// @route   GET /api/medical-records/patient/:patientId/summary
// @access  Private (Doctor/Admin or own patient)
router.get('/patient/:patientId/summary', protect, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access permissions
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patients can only view their own records.'
      });
    }

    if (req.user.role === 'doctor') {
      // Verify doctor has treated this patient
      const hasAccess = await Appointment.findOne({
        patient: patientId,
        doctor: req.user._id
      });
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You have not treated this patient.'
        });
      }
    }

    const summary = await MedicalRecord.getPatientSummary(patientId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get patient summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient summary'
    });
  }
});

// @desc    Share medical record
// @route   POST /api/medical-records/:id/share
// @access  Private (Patient or Doctor)
router.post('/:id/share', protect, [
  body('shareWith').isMongoId(),
  body('permissions').isArray().custom((permissions) => {
    const validPermissions = ['read', 'write', 'comment'];
    return permissions.every(p => validPermissions.includes(p));
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check permissions to share
    const canShare = medicalRecord.patient.toString() === req.user._id.toString() ||
                    medicalRecord.doctor.toString() === req.user._id.toString() ||
                    req.user.role === 'admin';

    if (!canShare) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot share this record.'
      });
    }

    const { shareWith, permissions } = req.body;

    // Verify user to share with exists
    const targetUser = await User.findById(shareWith);
    if (!targetUser) {
      return res.status(400).json({
        success: false,
        message: 'User to share with not found'
      });
    }

    // Check if already shared
    const existingShare = medicalRecord.sharedWith.find(
      share => share.user.toString() === shareWith
    );

    if (existingShare) {
      existingShare.permissions = permissions;
      existingShare.sharedAt = new Date();
    } else {
      medicalRecord.sharedWith.push({
        user: shareWith,
        permissions,
        sharedAt: new Date()
      });
    }

    await medicalRecord.save();

    res.json({
      success: true,
      message: 'Medical record shared successfully',
      data: {
        sharedWith: targetUser.firstName + ' ' + targetUser.lastName,
        permissions
      }
    });
  } catch (error) {
    console.error('Share medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sharing medical record'
    });
  }
});

module.exports = router;
