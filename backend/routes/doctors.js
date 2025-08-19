const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, doctorOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Public
router.get('/', [
  query('city').optional().trim(),
  query('specialization').optional().trim(),
  query('hospital').optional().trim(),
  query('isOnline').optional().isBoolean(),
  query('maxDistance').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['rating', 'experience', 'consultationFee', 'name'])
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
      city,
      specialization,
      hospital,
      isOnline,
      maxDistance,
      page = 1,
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    // Build query
    let query = {
      role: 'doctor',
      isActive: true
    };

    if (city) {
      query.currentCity = new RegExp(city, 'i');
    }

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (hospital) {
      query.currentHospital = new RegExp(hospital, 'i');
    }

    if (isOnline !== undefined) {
      query.isOnline = isOnline === 'true';
    }

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'rating':
        sortObj = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'experience':
        sortObj = { experience: -1 };
        break;
      case 'consultationFee':
        sortObj = { consultationFee: 1 };
        break;
      case 'name':
        sortObj = { firstName: 1, lastName: 1 };
        break;
      default:
        sortObj = { 'rating.average': -1 };
    }

    const skip = (page - 1) * limit;

    const doctors = await User.find(query)
      .select('firstName lastName specialization experience currentHospital currentCity isOnline consultationFee rating avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get additional stats for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const doctorObj = doctor.toObject();
        
        // Get appointment stats
        const appointmentStats = await Appointment.aggregate([
          {
            $match: {
              doctor: doctor._id,
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              totalAppointments: { $sum: 1 },
              averageRating: { $avg: '$patientRating.rating' }
            }
          }
        ]);

        doctorObj.stats = {
          totalAppointments: appointmentStats[0]?.totalAppointments || 0,
          patientRating: appointmentStats[0]?.averageRating || 0
        };

        return doctorObj;
      })
    );

    res.json({
      success: true,
      doctors: doctorsWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      filters: {
        city,
        specialization,
        hospital,
        isOnline,
        sortBy
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctors'
    });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true
    }).select('-password -verificationToken -passwordResetToken -passwordResetExpires');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          averageRating: { $avg: '$patientRating.rating' }
        }
      }
    ]);

    // Get recent reviews
    const recentReviews = doctor.reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const doctorProfile = {
      ...doctor.toObject(),
      stats: {
        totalAppointments: appointmentStats[0]?.totalAppointments || 0,
        patientRating: appointmentStats[0]?.averageRating || 0
      },
      recentReviews
    };

    res.json({
      success: true,
      doctor: doctorProfile
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor'
    });
  }
});

// @desc    Search doctors by location and symptoms
// @route   POST /api/doctors/search
// @access  Public
router.post('/search', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const {
      symptoms = [],
      preferredLocation,
      urgency = 'medium',
      maxDistance = 25,
      preferredHospital
    } = req.body;

    const { page = 1, limit = 10 } = req.query;

    // Map symptoms to specializations (simplified mapping)
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

    // Remove duplicates
    suggestedSpecialties = [...new Set(suggestedSpecialties)];

    // Build query
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

    // Prioritize suggested specialties
    if (suggestedSpecialties.length > 0) {
      query.specialization = {
        $in: suggestedSpecialties.map(spec => new RegExp(spec, 'i'))
      };
    }

    // For urgent cases, prioritize online doctors
    if (urgency === 'high') {
      query.isOnline = true;
    }

    const skip = (page - 1) * limit;

    let doctors = await User.find(query)
      .select('firstName lastName specialization experience currentHospital currentCity isOnline consultationFee rating avatar')
      .sort({ 
        isOnline: -1, // Online doctors first
        'rating.average': -1, 
        experience: -1 
      })
      .skip(skip)
      .limit(parseInt(limit));

    // If no doctors found with specific specialties, broaden search
    if (doctors.length === 0 && suggestedSpecialties.length > 0) {
      delete query.specialization;
      doctors = await User.find(query)
        .select('firstName lastName specialization experience currentHospital currentCity isOnline consultationFee rating avatar')
        .sort({ 
          isOnline: -1,
          'rating.average': -1, 
          experience: -1 
        })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await User.countDocuments(query);

    // Add match score based on symptoms and availability
    const doctorsWithScore = doctors.map(doctor => {
      let matchScore = 0;
      
      // Base score from rating
      matchScore += doctor.rating.average * 20;
      
      // Bonus for experience
      matchScore += Math.min(doctor.experience * 2, 20);
      
      // Bonus for being online (especially for urgent cases)
      if (doctor.isOnline) {
        matchScore += urgency === 'high' ? 30 : 15;
      }
      
      // Bonus for specialty match
      if (suggestedSpecialties.some(spec => 
        doctor.specialization.toLowerCase().includes(spec.toLowerCase())
      )) {
        matchScore += 25;
      }

      return {
        ...doctor.toObject(),
        matchScore: Math.round(matchScore),
        recommendationReason: getRecommendationReason(doctor, suggestedSpecialties, urgency)
      };
    });

    // Sort by match score
    doctorsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      doctors: doctorsWithScore,
      searchCriteria: {
        symptoms,
        preferredLocation,
        urgency,
        suggestedSpecialties
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching doctors'
    });
  }
});

// @desc    Get doctor's availability
// @route   GET /api/doctors/:id/availability
// @access  Public
router.get('/:id/availability', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const availability = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const availableSlots = await Appointment.findAvailableSlots(req.params.id, currentDate);
      
      availability.push({
        date: dateStr,
        availableSlots,
        totalSlots: availableSlots.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      doctor: doctor.getDoctorProfile(),
      availability
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching availability'
    });
  }
});

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard/stats
// @access  Private (Doctor only)
router.get('/dashboard/stats', protect, doctorOnly, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('patient', 'firstName lastName phone');

    // Get this month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          doctor: doctorId,
          appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent patients
    const recentPatients = await Appointment.find({
      doctor: doctorId,
      status: 'completed'
    })
    .populate('patient', 'firstName lastName')
    .sort({ updatedAt: -1 })
    .limit(5);

    // Calculate performance metrics
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    });

    const averageRating = await Appointment.aggregate([
      {
        $match: {
          doctor: doctorId,
          'patientRating.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$patientRating.rating' }
        }
      }
    ]);

    const stats = {
      todayAppointments: {
        total: todayAppointments.length,
        confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
        completed: todayAppointments.filter(apt => apt.status === 'completed').length,
        pending: todayAppointments.filter(apt => apt.status === 'scheduled').length,
        appointments: todayAppointments
      },
      monthlyStats: {
        total: monthlyStats.reduce((sum, stat) => sum + stat.count, 0),
        breakdown: monthlyStats
      },
      performance: {
        totalPatients: totalAppointments,
        averageRating: averageRating[0]?.avgRating || 0,
        isOnline: req.user.isOnline
      },
      recentPatients: recentPatients.map(apt => ({
        id: apt._id,
        patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
        date: apt.appointmentDate,
        type: apt.type,
        rating: apt.patientRating?.rating
      }))
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
});

// Helper function to generate recommendation reason
function getRecommendationReason(doctor, suggestedSpecialties, urgency) {
  const reasons = [];
  
  if (doctor.rating.average >= 4.5) {
    reasons.push('Highly rated');
  }
  
  if (doctor.experience >= 10) {
    reasons.push('Experienced');
  }
  
  if (doctor.isOnline && urgency === 'high') {
    reasons.push('Available for immediate consultation');
  } else if (doctor.isOnline) {
    reasons.push('Online now');
  }
  
  if (suggestedSpecialties.some(spec => 
    doctor.specialization.toLowerCase().includes(spec.toLowerCase())
  )) {
    reasons.push('Specialty match');
  }
  
  return reasons.join(' • ') || 'Available doctor';
}

module.exports = router;
