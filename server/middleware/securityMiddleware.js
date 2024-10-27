const helmet = require('helmet')
const crypto = require('crypto')

const securityMiddleware = app => {
  // Generate nonce middleware - must come before CSP middleware
  app.use((req, res, next) => {
    try {
      res.locals.nonce = crypto.randomBytes(16).toString('base64')
      next()
    } catch (error) {
      console.error('Error generating nonce:', error)
      res.locals.nonce = crypto
        .createHash('sha256')
        .update(Date.now().toString())
        .digest('base64')
      next()
    }
  })

  const isDev = process.env.NODE_ENV === 'development'

  // Base CSP directives shared between environments
  const baseDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      (req, res) => `'nonce-${res.locals.nonce}'`,
      'https://cdnjs.cloudflare.com',
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    connectSrc: ["'self'"],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    manifestSrc: ["'self'"],
    mediaSrc: ["'self'"],
  }

  // Development-specific CSP additions
  if (isDev) {
    baseDirectives.scriptSrc.push("'unsafe-eval'") // Required for Vite/React development
    baseDirectives.connectSrc.push(
      'ws://localhost:*',
      'wss://localhost:*',
      'http://localhost:*',
      'https://localhost:*',
    )
  } else {
    // Production-specific additions
    baseDirectives.upgradeInsecureRequests = []
    baseDirectives.connectSrc.push('wss:', 'https:')
  }

  // Apply Helmet with configured CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: baseDirectives,
      },
      crossOriginEmbedderPolicy: false, // Disabled to allow loading of external resources
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  )

  // Set additional security headers
  app.use((req, res, next) => {
    // Cache control
    res.set('Cache-Control', 'no-store, max-age=0')

    // Additional security headers
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('X-Frame-Options', 'DENY')
    res.set('X-XSS-Protection', '1; mode=block')

    if (!isDev) {
      res.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      )
    }

    next()
  })

  // Development-specific CORS configuration
  if (isDev) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      )
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.header('Access-Control-Allow-Credentials', 'true')
      next()
    })
  }
}

module.exports = securityMiddleware
