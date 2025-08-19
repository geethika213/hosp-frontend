const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'appointment_confirmed',
      'appointment_reminder',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_message',
      'video_call_request',
      'video_call_started',
      'payment_received',
      'prescription_ready',
      'lab_results_available',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    videoCallId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoCall' },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  readAt: Date,
  deliveryMethod: [{
    type: { type: String, enum: ['push', 'email', 'sms', 'in_app'] },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] },
    sentAt: Date,
    deliveredAt: Date,
    error: String
  }],
  scheduledFor: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

module.exports = mongoose.model('Notification', notificationSchema);
