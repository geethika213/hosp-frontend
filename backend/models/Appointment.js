const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: {
      type: String,
      required: [true, 'End time is required']
    }
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup', 'specialist-referral'],
    required: [true, 'Appointment type is required']
  },
  mode: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone'],
    default: 'in-person'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  symptoms: [String],
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required']
  },
  additionalNotes: String,
  
  // Location preferences
  preferredLocation: {
    city: String,
    state: String,
    hospital: String,
    maxDistance: Number // in miles
  },
  
  // Booking details
  bookedBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'ai-assistant'],
    default: 'patient'
  },
  bookingSource: {
    type: String,
    enum: ['web', 'mobile', 'phone', 'walk-in'],
    default: 'web'
  },
  
  // Medical details
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number
  },
  
  // Consultation details
  diagnosis: String,
  treatmentPlan: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpInstructions: String,
  
  // Payment
  consultationFee: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Video consultation
  videoCallDetails: {
    roomId: String,
    joinUrl: String,
    recordingUrl: String,
    duration: Number // in minutes
  },
  
  // Ratings and feedback
  patientRating: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date
  },
  doctorNotes: String,
  
  // Cancellation details
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  // Rescheduling
  originalAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rescheduledFrom: Date,
  rescheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Reminders
  remindersSent: [{
    type: { type: String, enum: ['email', 'sms', 'push'] },
    sentAt: Date,
    status: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ 'preferredLocation.city': 1, appointmentDate: 1 });

// Virtual for appointment duration
appointmentSchema.virtual('duration').get(function() {
  if (!this.appointmentTime.start || !this.appointmentTime.end) return null;
  
  const start = new Date(`2000-01-01 ${this.appointmentTime.start}`);
  const end = new Date(`2000-01-01 ${this.appointmentTime.end}`);
  return Math.round((end - start) / (1000 * 60)); // duration in minutes
});

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [time, period] = this.appointmentTime.start.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  
  date.setHours(hour24, parseInt(minutes), 0, 0);
  return date;
});

// Pre-save middleware to validate appointment time
appointmentSchema.pre('save', function(next) {
  // Ensure appointment is not in the past (except for completed appointments)
  if (this.isNew && this.status !== 'completed') {
    const appointmentDateTime = this.fullDateTime;
    if (appointmentDateTime < new Date()) {
      return next(new Error('Cannot schedule appointment in the past'));
    }
  }
  
  // Validate that end time is after start time
  const start = new Date(`2000-01-01 ${this.appointmentTime.start}`);
  const end = new Date(`2000-01-01 ${this.appointmentTime.end}`);
  if (end <= start) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

// Static method to find available slots for a doctor
appointmentSchema.statics.findAvailableSlots = async function(doctorId, date, duration = 30) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const bookedAppointments = await this.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
  }).sort({ 'appointmentTime.start': 1 });
  
  // Generate available slots (this is a simplified version)
  const workingHours = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];
  
  const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime.start);
  const availableSlots = workingHours.filter(time => !bookedTimes.includes(time));
  
  return availableSlots;
};

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = this.fullDateTime;
  const timeDiff = appointmentTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= 24 && ['scheduled', 'confirmed'].includes(this.status);
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentTime = this.fullDateTime;
  const timeDiff = appointmentTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= 12 && ['scheduled', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Appointment', appointmentSchema);
