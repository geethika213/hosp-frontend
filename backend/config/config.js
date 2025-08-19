module.exports = {
  development: {
    port: process.env.PORT || 5000,
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-assistant'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
  },
  production: {
    port: process.env.PORT || 5000,
    mongodb: {
      uri: process.env.MONGODB_URI
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    cors: {
      origin: process.env.FRONTEND_URL
    }
  }
};
