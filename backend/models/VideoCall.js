const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },
    joinedAt: Date,
    leftAt: Date,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'waiting', 'active', 'ended', 'failed'],
    default: 'scheduled'
  },
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  },
  recordingUrl: String,
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  callQuality: {
    overall: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    audioQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    videoQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    networkStability: {
      type: String,
      enum: ['stable', 'unstable', 'poor']
    }
  },
  technicalIssues: [{
    issue: String,
    timestamp: Date,
    resolved: Boolean,
    resolution: String
  }],
  chatMessages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  feedback: {
    patient: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      technicalRating: { type: Number, min: 1, max: 5 },
      submittedAt: Date
    },
    doctor: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      technicalRating: { type: Number, min: 1, max: 5 },
      submittedAt: Date
    }
  },
  metadata: {
    platform: String, // web, mobile, desktop
    browser: String,
    deviceType: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    }
  }
}, {
  timestamps: true
});

// Indexes
videoCallSchema.index({ appointment: 1 });
videoCallSchema.index({ roomId: 1 });
videoCallSchema.index({ status: 1, startTime: 1 });
videoCallSchema.index({ 'participants.user': 1 });

// Virtual for call duration in human readable format
videoCallSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return '0 minutes';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Method to start call
videoCallSchema.methods.startCall = function() {
  this.status = 'active';
  this.startTime = new Date();
  return this.save();
};

// Method to end call
videoCallSchema.methods.endCall = function() {
  this.status = 'ended';
  this.endTime = new Date();
  
  if (this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  return this.save();
};

// Method to add participant
videoCallSchema.methods.addParticipant = function(userId, role) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (existingParticipant) {
    existingParticipant.joinedAt = new Date();
    existingParticipant.leftAt = undefined;
  } else {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to remove participant
videoCallSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (participant) {
    participant.leftAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('VideoCall', videoCallSchema);
