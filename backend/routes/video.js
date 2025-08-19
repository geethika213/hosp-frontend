const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Appointment = require('../models/Appointment');
const VideoCall = require('../models/VideoCall');
const User = require('../models/User');
const { protect, appointmentParticipant } = require('../middleware/auth');

const router = express.Router();

// @desc    Create video call room
// @route   POST /api/video/room
// @access  Private
router.post('/room', protect, [
  body('appointmentId').isMongoId()
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

    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is participant
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      });
    }

    // Check if appointment is for telemedicine
    if (appointment.mode !== 'telemedicine') {
      return res.status(400).json({
        success: false,
        message: 'Video call is only available for telemedicine appointments'
      });
    }

    // Check if video call already exists
    let videoCall = await VideoCall.findOne({ appointment: appointmentId });
    
    if (!videoCall) {
      // Generate room details
      const roomId = uuidv4();
      
      // Create new video call record
      videoCall = new VideoCall({
        appointment: appointmentId,
        roomId,
        participants: [
          { user: appointment.patient._id, role: 'patient' },
          { user: appointment.doctor._id, role: 'doctor' }
        ],
        status: 'scheduled'
      });

      await videoCall.save();

      // Update appointment with video call details
      appointment.videoCallDetails = {
        roomId,
        joinUrl: `${process.env.FRONTEND_URL}/video/${roomId}`
      };

      // Update status to in-progress when video call is created
      if (appointment.status === 'confirmed') {
        appointment.status = 'in-progress';
      }

      await appointment.save();
    }

    res.json({
      success: true,
      message: 'Video call room ready',
      data: {
        roomId: videoCall.roomId,
        joinUrl: `${process.env.FRONTEND_URL}/video/${videoCall.roomId}`,
        status: videoCall.status,
        appointment: {
          id: appointment._id,
          patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          doctor: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          date: appointment.appointmentDate,
          time: appointment.appointmentTime
        }
      }
    });
  } catch (error) {
    console.error('Create video room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating video call room'
    });
  }
});

// @desc    Join video call room
// @route   GET /api/video/room/:roomId
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoCall = await VideoCall.findOne({ roomId })
      .populate({
        path: 'appointment',
        populate: {
          path: 'patient doctor',
          select: 'firstName lastName specialization'
        }
      });

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    // Check if user is participant
    const isParticipant = videoCall.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this video call'
      });
    }

    // Add participant to call if not already joined
    await videoCall.addParticipant(req.user._id, req.user.role);

    // Start call if this is the first participant joining
    if (videoCall.status === 'scheduled') {
      videoCall.status = 'waiting';
      await videoCall.save();
    }

    res.json({
      success: true,
      message: 'Successfully joined video call',
      data: {
        roomId: videoCall.roomId,
        status: videoCall.status,
        participants: videoCall.participants,
        appointment: videoCall.appointment
      }
    });
  } catch (error) {
    console.error('Join video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining video call'
    });
  }
});

// @desc    Start video call
// @route   PUT /api/video/room/:roomId/start
// @access  Private
router.put('/room/:roomId/start', protect, async (req, res) => {
  try {
    const videoCall = await VideoCall.findOne({ roomId: req.params.roomId });

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Video call not found'
      });
    }

    // Check if user is participant
    const isParticipant = videoCall.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this video call'
      });
    }

    await videoCall.startCall();

    res.json({
      success: true,
      message: 'Video call started',
      data: {
        status: videoCall.status,
        startTime: videoCall.startTime
      }
    });
  } catch (error) {
    console.error('Start video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting video call'
    });
  }
});

// @desc    End video call
// @route   GET /api/video/room/:roomId
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const appointment = await Appointment.findOne({
      'videoCallDetails.roomId': roomId
    })
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    // Check if user is participant
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this video call'
      });
    }

    res.json({
      success: true,
      videoCall: {
        roomId,
        appointment: {
          id: appointment._id,
          patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          doctor: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          date: appointment.appointmentDate,
          time: appointment.appointmentTime,
          status: appointment.status
        },
        userRole: req.user.role,
        isPatient,
        isDoctor
      }
    });
  } catch (error) {
    console.error('Join video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining video call'
    });
  }
});

// @desc    End video call
// @route   PUT /api/video/room/:roomId/end
// @access  Private
router.put('/room/:roomId/end', protect, [
  body('duration').optional().isInt({ min: 1 }),
  body('recordingUrl').optional().isURL()
], async (req, res) => {
  try {
    const { roomId } = req.params;
    const { duration, recordingUrl } = req.body;

    const appointment = await Appointment.findOne({
      'videoCallDetails.roomId': roomId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    // Check if user is participant
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this video call'
      });
    }

    // Update video call details
    if (duration) {
      appointment.videoCallDetails.duration = duration;
    }
    if (recordingUrl) {
      appointment.videoCallDetails.recordingUrl = recordingUrl;
    }

    // Update appointment status to completed if ended by doctor
    if (req.user.role === 'doctor' && appointment.status === 'in-progress') {
      appointment.status = 'completed';
    }

    await appointment.save();

    // Emit video call ended event
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('video-call-ended', {
        roomId,
        endedBy: req.user.role,
        duration
      });
    }

    res.json({
      success: true,
      message: 'Video call ended successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        duration
      }
    });
  } catch (error) {
    console.error('End video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending video call'
    });
  }
});

// @desc    Get video call history
// @route   GET /api/video/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    let query = {
      mode: 'telemedicine',
      'videoCallDetails.roomId': { $exists: true }
    };

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const skip = (page - 1) * limit;

    const videoHistory = await Appointment.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    const history = videoHistory.map(apt => ({
      id: apt._id,
      patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
      doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
      specialization: apt.doctor.specialization,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      duration: apt.videoCallDetails?.duration,
      status: apt.status,
      recordingUrl: apt.videoCallDetails?.recordingUrl
    }));

    res.json({
      success: true,
      videoHistory: history,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get video history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video history'
    });
  }
});

module.exports = router;
