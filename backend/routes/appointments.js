const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize, appointmentParticipant, doctorOnly, patientOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', protect, [
  body('doctor').isMongoId(),
  body('appointmentDate').isISO8601(),
  body('appointmentTime.start').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  body('appointmentTime.end').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  body('type').isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup', 'specialist-referral']),
  body('chiefComplaint').trim().isLength({ min: 1 })
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
      doctor,
      appointmentDate,
      appointmentTime,
      type,
      mode = 'in-person',
      priority = 'medium',
      symptoms = [],
      chiefComplaint,
      additionalNotes,
      preferredLocation
    } = req.body;

    // Verify doctor exists and is active
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor' || !doctorUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      });
    }

    // Check if slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      $or: [
        {
          'appointmentTime.start': { $lte: appointmentTime.start },
          'appointmentTime.end': { $gt: appointmentTime.start }
        },
        {
          'appointmentTime.start': { $lt: appointmentTime.end },
          'appointmentTime.end': { $gte: appointmentTime.end }
        }
      ],
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      type,
      mode,
      priority,
      symptoms,
      chiefComplaint,
      additionalNotes,
      preferredLocation,
      consultationFee: doctorUser.consultationFee || 0
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization currentHospital currentCity');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating appointment'
    });
  }
});

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, [
  query('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled']),
  query('date').optional().isISO8601(),
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

    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // Admin can see all appointments (no additional filter)

    // Add filters
    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone dateOfBirth')
      .populate('doctor', 'firstName lastName specialization currentHospital currentCity rating')
      .sort({ appointmentDate: 1, 'appointmentTime.start': 1 })
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
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, appointmentParticipant, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone dateOfBirth address emergencyContact')
      .populate('doctor', 'firstName lastName specialization currentHospital currentCity rating experience');

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment'
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', protect, appointmentParticipant, async (req, res) => {
  try {
    const appointment = req.appointment;
    const allowedUpdates = ['status', 'additionalNotes', 'vitalSigns', 'diagnosis', 'treatmentPlan', 'prescriptions', 'followUpRequired', 'followUpDate', 'followUpInstructions', 'doctorNotes'];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Only doctors can update medical information
    const medicalFields = ['vitalSigns', 'diagnosis', 'treatmentPlan', 'prescriptions', 'doctorNotes'];
    const hasMedicalUpdates = Object.keys(updates).some(key => medicalFields.includes(key));
    
    if (hasMedicalUpdates && req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update medical information'
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone')
     .populate('doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment'
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, appointmentParticipant, [
  body('reason').optional().trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const appointment = req.appointment;
    
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled (less than 24 hours notice or invalid status)'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason;
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment'
    });
  }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
router.put('/:id/reschedule', protect, appointmentParticipant, [
  body('newDate').isISO8601(),
  body('newTime.start').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  body('newTime.end').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
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

    const appointment = req.appointment;
    
    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be rescheduled (less than 12 hours notice or invalid status)'
      });
    }

    const { newDate, newTime } = req.body;

    // Check if new slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: new Date(newDate),
      $or: [
        {
          'appointmentTime.start': { $lte: newTime.start },
          'appointmentTime.end': { $gt: newTime.start }
        },
        {
          'appointmentTime.start': { $lt: newTime.end },
          'appointmentTime.end': { $gte: newTime.end }
        }
      ],
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
      _id: { $ne: appointment._id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'New time slot is not available'
      });
    }

    // Store original date for reference
    appointment.rescheduledFrom = appointment.appointmentDate;
    appointment.rescheduledBy = req.user._id;
    
    // Update to new date and time
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.status = 'scheduled'; // Reset status

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment'
    });
  }
});

// @desc    Add patient rating
// @route   PUT /api/appointments/:id/rate
// @access  Private (Patient only)
router.put('/:id/rate', protect, patientOnly, appointmentParticipant, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim()
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

    const appointment = req.appointment;
    
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed appointments'
      });
    }

    if (appointment.patientRating.rating) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already rated'
      });
    }

    const { rating, feedback } = req.body;

    // Update appointment rating
    appointment.patientRating = {
      rating,
      feedback,
      ratedAt: new Date()
    };

    await appointment.save();

    // Update doctor's overall rating
    const doctor = await User.findById(appointment.doctor);
    const newReview = {
      patient: req.user._id,
      rating,
      comment: feedback,
      date: new Date()
    };

    doctor.reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0);
    doctor.rating.average = totalRating / doctor.reviews.length;
    doctor.rating.count = doctor.reviews.length;

    await doctor.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      appointment
    });
  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting rating'
    });
  }
});

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/slots/:doctorId
// @access  Public
router.get('/slots/:doctorId', [
  query('date').isISO8601()
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

    const { doctorId } = req.params;
    const { date } = req.query;

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const availableSlots = await Appointment.findAvailableSlots(doctorId, date);

    res.json({
      success: true,
      availableSlots,
      doctor: doctor.getDoctorProfile()
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available slots'
    });
  }
});

module.exports = router;
