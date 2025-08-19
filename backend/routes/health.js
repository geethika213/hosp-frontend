const express = require('express');
const healthCheck = require('../utils/healthCheck');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Basic health check
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    const healthReport = await healthCheck.performFullHealthCheck();
    
    const statusCode = healthReport.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthReport.status === 'healthy',
      ...healthReport
    });
  } catch (error) {
    logger.logError(error, { endpoint: 'health-check' });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// @desc    Detailed system status (Admin only)
// @route   GET /api/health/detailed
// @access  Private (Admin)
router.get('/detailed', protect, authorize('admin'), async (req, res) => {
  try {
    const healthReport = await healthCheck.performFullHealthCheck();
    
    // Additional admin-only metrics
    const User = require('../models/User');
    const Appointment = require('../models/Appointment');
    
    const adminMetrics = {
      userGrowth: await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 30 }
      ]),
      appointmentTrends: await Appointment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$appointmentDate' },
              month: { $month: '$appointmentDate' },
              day: { $dayOfMonth: '$appointmentDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 30 }
      ])
    };

    res.json({
      success: true,
      ...healthReport,
      adminMetrics
    });
  } catch (error) {
    logger.logError(error, { endpoint: 'detailed-health-check' });
    res.status(500).json({
      success: false,
      message: 'Error fetching detailed health status'
    });
  }
});

// @desc    Database status
// @route   GET /api/health/database
// @access  Private (Admin)
router.get('/database', protect, authorize('admin'), async (req, res) => {
  try {
    const dbStatus = await healthCheck.checkDatabase();
    
    res.json({
      success: dbStatus.status === 'healthy',
      database: dbStatus
    });
  } catch (error) {
    logger.logError(error, { endpoint: 'database-health-check' });
    res.status(500).json({
      success: false,
      message: 'Error checking database status'
    });
  }
});

module.exports = router;
