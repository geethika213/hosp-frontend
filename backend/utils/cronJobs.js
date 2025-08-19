const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const NotificationService = require('./notificationService');
const logger = require('./logger');

class CronJobService {
  constructor(io) {
    this.notificationService = new NotificationService(io);
    this.setupJobs();
  }

  setupJobs() {
    // Send appointment reminders daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Running appointment reminder job');
      try {
        await this.notificationService.scheduleAppointmentReminders();
      } catch (error) {
        logger.logError(error, { job: 'appointment-reminders' });
      }
    });

    // Clean up expired notifications every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running notification cleanup job');
      try {
        await this.notificationService.cleanupExpiredNotifications();
      } catch (error) {
        logger.logError(error, { job: 'notification-cleanup' });
      }
    });

    // Update appointment statuses every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      try {
        await this.updateAppointmentStatuses();
      } catch (error) {
        logger.logError(error, { job: 'appointment-status-update' });
      }
    });

    // Generate daily reports at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily report generation');
      try {
        await this.generateDailyReports();
      } catch (error) {
        logger.logError(error, { job: 'daily-reports' });
      }
    });

    logger.info('Cron jobs initialized successfully');
  }

  async updateAppointmentStatuses() {
    const now = new Date();
    
    // Mark appointments as no-show if they're 30 minutes past start time
    const noShowCutoff = new Date(now.getTime() - 30 * 60 * 1000);
    
    const noShowAppointments = await Appointment.find({
      status: 'confirmed',
      appointmentDate: { $lt: noShowCutoff }
    });

    for (const appointment of noShowAppointments) {
      appointment.status = 'no-show';
      await appointment.save();
      
      logger.logBusinessEvent('appointment-no-show', {
        appointmentId: appointment._id,
        patientId: appointment.patient,
        doctorId: appointment.doctor
      });
    }

    // Auto-complete video calls that ended but weren't marked complete
    const completedVideoCalls = await Appointment.find({
      status: 'in-progress',
      mode: 'telemedicine',
      'videoCallDetails.duration': { $exists: true, $gt: 0 }
    });

    for (const appointment of completedVideoCalls) {
      appointment.status = 'completed';
      await appointment.save();
    }

    if (noShowAppointments.length > 0 || completedVideoCalls.length > 0) {
      logger.info('Updated appointment statuses', {
        noShows: noShowAppointments.length,
        completedVideoCalls: completedVideoCalls.length
      });
    }
  }

  async generateDailyReports() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count today's appointments by status
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count new user registrations
    const newUsers = await User.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Count video calls
    const videoCalls = await VideoCall.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const report = {
      date: today.toISOString().split('T')[0],
      appointments: appointmentStats,
      newUsers,
      videoCalls,
      generatedAt: new Date()
    };

    logger.logBusinessEvent('daily-report-generated', report);
  }
}

module.exports = CronJobService;
