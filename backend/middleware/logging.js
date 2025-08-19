const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the request
  logger.info('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    body: req.method === 'POST' || req.method === 'PUT' ? 
      JSON.stringify(req.body).substring(0, 1000) : undefined
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - start;
    
    logger.logAPIRequest(req, res, responseTime);
    
    // Log errors
    if (res.statusCode >= 400) {
      logger.warn('API Error Response', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userId: req.user?._id,
        response: JSON.stringify(data).substring(0, 500)
      });
    }
    
    return originalJson.call(this, data);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id,
    body: req.body
  });
  
  next(err);
};

// Security event logger
const securityLogger = (event) => {
  return (req, res, next) => {
    logger.logSecurityEvent(event, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      url: req.originalUrl
    });
    next();
  };
};

module.exports = {
  requestLogger,
  errorLogger,
  securityLogger
};
