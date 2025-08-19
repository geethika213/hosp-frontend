const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user_${data.recipient}`).emit('new_notification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          createdAt: notification.createdAt,
          data: notification.data
        });
      }

      // Send email notification if configured
      if (data.deliveryMethod && data.deliveryMethod.includes('email')) {
        await this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      const User = require('../models/User');
      const recipient = await User.findById(notification.recipient);
      
      if (!recipient) return;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: `${notification.title} - HealthAI`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">${notification.title}</h2>
            <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
            <p>${notification.message}</p>
            
            ${notification.data?.actionUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${notification.data.actionUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
              </div>
            ` : ''}
            
            <p>Best regards,<br>HealthAI Team</p>
          </div>
        `
      };

      await emailService.transporter.sendMail(mailOptions);
      
      // Update delivery status
      notification.deliveryMethod.forEach(method => {
        if (method.type === 'email') {
          method.status = 'sent';
          method.sentAt = new Date();
        }
      });
      await notification.save();

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async sendAppointmentConfirmation(appointment, patient, doctor) {
    await this.createNotification({
      recipient: patient._id,
      sender: doctor._id,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been confirmed for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime.start}.`,
      data: {
        appointmentId: appointment._id,
        actionUrl: `/dashboard/appointments/${appointment._id}`
      },
      priority: 'medium',
      deliveryMethod: [{ type: 'email' }, { type: 'in_app' }]
    });

    // Notify doctor too
    await this.createNotification({
      recipient: doctor._id,
      sender: patient._id,
      type: 'appointment_confirmed',
      title: 'New Appointment Booked',
      message: `${patient.firstName} ${patient.lastName} has booked an appointment with you for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime.start}.`,
      data: {
        appointmentId: appointment._id,
        actionUrl: `/doctor/appointments/${appointment._id}`
      },
      priority: 'medium',
      deliveryMethod: [{ type: 'email' }, { type: 'in_app' }]
    });
  }

  async sendAppointmentReminder(appointment, patient, doctor) {
    await this.createNotification({
      recipient: patient._id,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with Dr. ${doctor.firstName} ${doctor.lastName} tomorrow at ${appointment.appointmentTime.start}.`,
      data: {
        appointmentId: appointment._id,
        actionUrl: `/dashboard/appointments/${appointment._id}`
      },
      priority: 'high',
      deliveryMethod: [{ type: 'email' }, { type: 'in_app' }]
    });
  }

  async sendAppointmentCancellation(appointment, patient, doctor, reason) {
    await this.createNotification({
      recipient: patient._id,
      sender: doctor._id,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      data: {
        appointmentId: appointment._id,
        actionUrl: '/dashboard/appointments'
      },
      priority: 'high',
      deliveryMethod: [{ type: 'email' }, { type: 'in_app' }]
    });
  }

  async sendVideoCallRequest(appointment, patient, doctor) {
    await this.createNotification({
      recipient: doctor._id,
      sender: patient._id,
      type: 'video_call_request',
      title: 'Video Call Request',
      message: `${patient.firstName} ${patient.lastName} is requesting to start a video consultation.`,
      data: {
        appointmentId: appointment._id,
        actionUrl: `/doctor/video-call/${appointment._id}`
      },
      priority: 'urgent',
      deliveryMethod: [{ type: 'in_app' }],
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
  }

  async sendSystemAnnouncement(recipients, title, message, priority = 'medium') {
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      type: 'system_announcement',
      title,
      message,
      priority,
      deliveryMethod: [{ type: 'in_app' }, { type: 'email' }]
    }));

    await Notification.insertMany(notifications);

    // Send real-time notifications
    if (this.io) {
      recipients.forEach(recipientId => {
        this.io.to(`user_${recipientId}`).emit('system_announcement', {
          title,
          message,
          priority
        });
      });
    }
  }

  async scheduleAppointmentReminders() {
    try {
      const Appointment = require('../models/Appointment');
      const User = require('../models/User');
      
      // Find appointments for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        appointmentDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
        status: { $in: ['scheduled', 'confirmed'] }
      }).populate('patient doctor');

      for (const appointment of appointments) {
        // Check if reminder already sent
        const existingReminder = await Notification.findOne({
          recipient: appointment.patient._id,
          type: 'appointment_reminder',
          'data.appointmentId': appointment._id
        });

        if (!existingReminder) {
          await this.sendAppointmentReminder(appointment, appointment.patient, appointment.doctor);
        }
      }

      console.log(`Processed ${appointments.length} appointment reminders`);
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

module.exports = NotificationService;
