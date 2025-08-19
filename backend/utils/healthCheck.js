const mongoose = require('mongoose');
const logger = require('./logger');

class HealthCheckService {
  async checkDatabase() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      if (state === 1) {
        // Test database with a simple query
        await mongoose.connection.db.admin().ping();
        return { status: 'healthy', state: states[state] };
      }

      return { status: 'unhealthy', state: states[state] };
    } catch (error) {
      logger.logError(error, { component: 'database-health-check' });
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkExternalServices() {
    const services = {};

    // Check OpenAI API
    try {
      if (process.env.OPENAI_API_KEY) {
        services.openai = { status: 'configured' };
      } else {
        services.openai = { status: 'not_configured' };
      }
    } catch (error) {
      services.openai = { status: 'error', error: error.message };
    }

    // Check Email service
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        services.email = { status: 'configured' };
      } else {
        services.email = { status: 'not_configured' };
      }
    } catch (error) {
      services.email = { status: 'error', error: error.message };
    }

    // Check Cloudinary
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        services.cloudinary = { status: 'configured' };
      } else {
        services.cloudinary = { status: 'not_configured' };
      }
    } catch (error) {
      services.cloudinary = { status: 'error', error: error.message };
    }

    return services;
  }

  async getSystemMetrics() {
    const User = require('../models/User');
    const Appointment = require('../models/Appointment');
    const VideoCall = require('../models/VideoCall');
    const Notification = require('../models/Notification');

    try {
      const [
        totalUsers,
        totalDoctors,
        totalPatients,
        onlineDoctors,
        todayAppointments,
        activeVideoCalls,
        unreadNotifications
      ] = await Promise.all([
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'doctor', isActive: true }),
        User.countDocuments({ role: 'patient', isActive: true }),
        User.countDocuments({ role: 'doctor', isOnline: true }),
        Appointment.countDocuments({
          appointmentDate: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        }),
        VideoCall.countDocuments({ status: 'active' }),
        Notification.countDocuments({ status: 'unread' })
      ]);

      return {
        users: {
          total: totalUsers,
          doctors: totalDoctors,
          patients: totalPatients,
          onlineDoctors
        },
        appointments: {
          today: todayAppointments
        },
        videoCalls: {
          active: activeVideoCalls
        },
        notifications: {
          unread: unreadNotifications
        }
      };
    } catch (error) {
      logger.logError(error, { component: 'system-metrics' });
      throw error;
    }
  }

  async performFullHealthCheck() {
    const startTime = Date.now();
    
    try {
      const [database, externalServices, metrics] = await Promise.all([
        this.checkDatabase(),
        this.checkExternalServices(),
        this.getSystemMetrics()
      ]);

      const responseTime = Date.now() - startTime;
      const overallStatus = database.status === 'healthy' ? 'healthy' : 'unhealthy';

      const healthReport = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        database,
        externalServices,
        metrics
      };

      if (overallStatus === 'unhealthy') {
        logger.logError(new Error('System health check failed'), { healthReport });
      }

      return healthReport;
    } catch (error) {
      logger.logError(error, { component: 'health-check' });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = new HealthCheckService();
