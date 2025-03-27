const Tokens = require('csrf')
const tokens = new Tokens()

/**
 * Generates a CSRF token and attaches it to the request/response objects
 */
const generateCsrfToken = (req, res, next) => {
  // Create a token secret if one doesn't exist
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync()
  }

  // Generate token from the secret
  const csrfToken = tokens.create(req.session.csrfSecret)

  // Make token available for templates
  res.locals.csrfToken = csrfToken

  // Also make available as a method on req
  req.csrfToken = () => csrfToken

  next()
}

/**
 * Validates CSRF token for state-changing requests
 */
const validateCsrfToken = (req, res, next) => {
  // Skip validation for read-only methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Get token from request header
  const token = req.headers['x-csrf-token']

  // Validate the token
  if (!token || !tokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).json({
      error: 'CSRF validation failed. Please refresh the page and try again.',
    })
  }

  next()
}

module.exports = { generateCsrfToken, validateCsrfToken }
