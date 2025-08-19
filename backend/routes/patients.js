const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, patientOnly, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient only)
router.get('/profile', protect, patientOnly, async (req, res) => {
  try {
    const patient = await User.findById(req.user._id)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires');

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient profile'
    });
  }
});

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
router.put('/profile', protect, patientOnly, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/),
  body('dateOfBirth').optional().isISO8601(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.phone').optional().matches(/^\+?[\d\s\-\(\)]+$/),
  body('emergencyContact.relationship').optional().trim()
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

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 
      'address', 'emergencyContact'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const patient = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -passwordResetToken -passwordResetExpires');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Get patient's medical history
// @route   GET /api/patients/medical-history
// @access  Private (Patient only)
router.get('/medical-history', protect, patientOnly, async (req, res) => {
  try {
    const patient = await User.findById(req.user._id)
      .select('medicalHistory allergies medications');

    res.json({
      success: true,
      medicalHistory: patient.medicalHistory || [],
      allergies: patient.allergies || [],
      medications: patient.medications || []
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical history'
    });
  }
});

// @desc    Update patient's medical history
// @route   PUT /api/patients/medical-history
// @access  Private (Patient only)
router.put('/medical-history', protect, patientOnly, [
  body('medicalHistory').optional().isArray(),
  body('allergies').optional().isArray(),
  body('medications').optional().isArray()
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

    const { medicalHistory, allergies, medications } = req.body;
    const updates = {};

    if (medicalHistory !== undefined) updates.medicalHistory = medicalHistory;
    if (allergies !== undefined) updates.allergies = allergies;
    if (medications !== undefined) updates.medications = medications;

    const patient = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('medicalHistory allergies medications');

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      medications: patient.medications
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medical history'
    });
  }
});

// @desc    Get patient's appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient only)
router.get('/appointments', protect, patientOnly, [
  query('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']),
  query('upcoming').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { status, upcoming, page = 1, limit = 10 } = req.query;
    
    let query = { patient: req.user._id };
    
    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.appointmentDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName specialization currentHospital currentCity rating')
      .sort({ appointmentDate: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @desc    Get patient dashboard stats
// @route   GET /api/patients/dashboard/stats
// @access  Private (Patient only)
router.get('/dashboard/stats', protect, patientOnly, async (req, res) => {
  try {
    const patientId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('doctor', 'firstName lastName specialization currentHospital')
    .sort({ appointmentDate: 1 })
    .limit(5);

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      patient: patientId,
      status: 'completed'
    })
    .populate('doctor', 'firstName lastName specialization')
    .sort({ appointmentDate: -1 })
    .limit(5);

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      {
        $match: { patient: patientId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get health summary
    const patient = await User.findById(patientId)
      .select('medicalHistory allergies medications');

    const stats = {
      upcomingAppointments: upcomingAppointments.map(apt => ({
        id: apt._id,
        doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
        specialization: apt.doctor.specialization,
        hospital: apt.doctor.currentHospital,
        date: apt.appointmentDate,
        time: apt.appointmentTime.start,
        type: apt.type,
        mode: apt.mode
      })),
      recentAppointments: recentAppointments.map(apt => ({
        id: apt._id,
        doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
        specialization: apt.doctor.specialization,
        date: apt.appointmentDate,
        type: apt.type,
        rating: apt.patientRating?.rating
      })),
      appointmentStats: {
        total: appointmentStats.reduce((sum, stat) => sum + stat.count, 0),
        breakdown: appointmentStats
      },
      healthSummary: {
        medicalConditions: patient.medicalHistory?.length || 0,
        allergies: patient.allergies?.length || 0,
        currentMedications: patient.medications?.length || 0
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get patient dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
});

// @desc    Search and book appointment
// @route   POST /api/patients/search-doctors
// @access  Private (Patient only)
router.post('/search-doctors', protect, patientOnly, [
  body('symptoms').optional().isArray(),
  body('preferredLocation').optional().trim(),
  body('urgency').optional().isIn(['low', 'medium', 'high']),
  body('maxDistance').optional().isInt({ min: 1 }),
  body('preferredHospital').optional().trim()
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

    const {
      symptoms = [],
      preferredLocation,
      urgency = 'medium',
      maxDistance = 25,
      preferredHospital
    } = req.body;

    // Use the same logic as the doctors search endpoint
    const symptomSpecialtyMap = {
      'chest pain': ['cardiology', 'internal medicine'],
      'headache': ['neurology', 'internal medicine'],
      'fever': ['internal medicine', 'family medicine'],
      'cough': ['pulmonology', 'internal medicine'],
      'abdominal pain': ['gastroenterology', 'internal medicine'],
      'joint pain': ['rheumatology', 'orthopedics'],
      'skin rash': ['dermatology'],
      'anxiety': ['psychiatry', 'psychology'],
      'depression': ['psychiatry', 'psychology']
    };

    let suggestedSpecialties = [];
    symptoms.forEach(symptom => {
      const specialties = symptomSpecialtyMap[symptom.toLowerCase()];
      if (specialties) {
        suggestedSpecialties = [...suggestedSpecialties, ...specialties];
      }
    });

    suggestedSpecialties = [...new Set(suggestedSpecialties)];

    let query = {
      role: 'doctor',
      isActive: true
    };

    if (preferredLocation) {
      query.currentCity = new RegExp(preferredLocation, 'i');
    }

    if (preferredHospital && preferredHospital !== 'any') {
      query.currentHospital = new RegExp(preferredHospital, 'i');
    }

    if (suggestedSpecialties.length > 0) {
      query.specialization = {
        $in: suggestedSpecialties.map(spec => new RegExp(spec, 'i'))
      };
    }

    if (urgency === 'high') {
      query.isOnline = true;
    }

    const doctors = await User.find(query)
      .select('firstName lastName specialization experience currentHospital currentCity isOnline consultationFee rating avatar')
      .sort({ 
        isOnline: -1,
        'rating.average': -1, 
        experience: -1 
      })
      .limit(20);

    // Add match scores
    const doctorsWithScore = doctors.map(doctor => {
      let matchScore = 0;
      
      matchScore += doctor.rating.average * 20;
      matchScore += Math.min(doctor.experience * 2, 20);
      
      if (doctor.isOnline) {
        matchScore += urgency === 'high' ? 30 : 15;
      }
      
      if (suggestedSpecialties.some(spec => 
        doctor.specialization.toLowerCase().includes(spec.toLowerCase())
      )) {
        matchScore += 25;
      }

      return {
        ...doctor.toObject(),
        matchScore: Math.round(matchScore)
      };
    });

    doctorsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      doctors: doctorsWithScore,
      searchCriteria: {
        symptoms,
        preferredLocation,
        urgency,
        suggestedSpecialties
      }
    });
  } catch (error) {
    console.error('Search doctors for patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching doctors'
    });
  }
});

// @desc    Get patient's favorite doctors
// @route   GET /api/patients/favorites
// @access  Private (Patient only)
router.get('/favorites', protect, patientOnly, async (req, res) => {
  try {
    // Get doctors the patient has had appointments with, sorted by frequency and rating
    const favoriteStats = await Appointment.aggregate([
      {
        $match: {
          patient: req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 },
          averageRating: { $avg: '$patientRating.rating' },
          lastAppointment: { $max: '$appointmentDate' }
        }
      },
      {
        $sort: {
          appointmentCount: -1,
          averageRating: -1,
          lastAppointment: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    const doctorIds = favoriteStats.map(stat => stat._id);
    
    const doctors = await User.find({
      _id: { $in: doctorIds },
      role: 'doctor',
      isActive: true
    }).select('firstName lastName specialization currentHospital currentCity isOnline rating avatar');

    const favoriteDoctors = favoriteStats.map(stat => {
      const doctor = doctors.find(doc => doc._id.toString() === stat._id.toString());
      return {
        ...doctor.toObject(),
        patientHistory: {
          appointmentCount: stat.appointmentCount,
          averageRating: stat.averageRating,
          lastAppointment: stat.lastAppointment
        }
      };
    });

    res.json({
      success: true,
      favoriteDoctors
    });
  } catch (error) {
    console.error('Get favorite doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching favorite doctors'
    });
  }
});

module.exports = router;
