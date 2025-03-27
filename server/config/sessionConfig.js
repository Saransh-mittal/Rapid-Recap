const session = require('express-session')

/**
 * Configures the session middleware for Express
 * @returns {Function} Configured session middleware
 */
const configureSession = () => {
  return session({
    secret:
      process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
}

module.exports = configureSession
