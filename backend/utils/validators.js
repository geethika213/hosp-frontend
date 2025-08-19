const { body, param, query } = require('express-validator');

// Common validation rules
const validators = {
  // User validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  name: (field) => body(field)
    .trim()
    .isLength({ min: 1 })
    .withMessage(`${field} is required`),
  
  phone: body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  mongoId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`),
  
  // Appointment validation
  appointmentDate: body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  appointmentTime: (field) => body(`appointmentTime.${field}`)
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
    .withMessage(`Please provide a valid ${field} time`),
  
  appointmentType: body('type')
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup', 'specialist-referral'])
    .withMessage('Invalid appointment type'),
  
  appointmentMode: body('mode')
    .optional()
    .isIn(['in-person', 'telemedicine', 'phone'])
    .withMessage('Invalid appointment mode'),
  
  priority: body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  // Query validation
  pageQuery: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  limitQuery: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  // Role validation
  role: body('role')
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Invalid role'),
  
  // Doctor specific validation
  specialization: body('specialization')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Specialization is required for doctors'),
  
  licenseNumber: body('licenseNumber')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('License number is required for doctors'),
  
  // Rating validation
  rating: body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
};

// Validation rule sets for common operations
const validationRules = {
  register: [
    validators.email,
    validators.password,
    validators.name('firstName'),
    validators.name('lastName'),
    validators.role,
    validators.phone
  ],
  
  login: [
    validators.email,
    body('password').exists().withMessage('Password is required')
  ],
  
  createAppointment: [
    validators.mongoId('doctor'),
    validators.appointmentDate,
    validators.appointmentTime('start'),
    validators.appointmentTime('end'),
    validators.appointmentType,
    validators.appointmentMode,
    validators.priority,
    body('chiefComplaint').trim().isLength({ min: 1 }).withMessage('Chief complaint is required')
  ],
  
  updateProfile: [
    validators.name('firstName').optional(),
    validators.name('lastName').optional(),
    validators.phone
  ],
  
  rateAppointment: [
    validators.rating,
    body('feedback').optional().trim()
  ],
  
  pagination: [
    validators.pageQuery,
    validators.limitQuery
  ]
};

module.exports = { validators, validationRules };
