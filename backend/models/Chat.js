const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'ai-assistant'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderType: {
      type: String,
      enum: ['user', 'ai-assistant'],
      default: 'user'
    },
    content: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system', 'ai-response'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  aiContext: {
    symptoms: [String],
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    recommendedSpecialty: String,
    suggestedQuestions: [String],
    bookingProgress: {
      type: String,
      enum: ['initial', 'symptoms-collected', 'preferences-set', 'doctors-recommended', 'appointment-booked'],
      default: 'initial'
    }
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ appointment: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
