const helmet = require('helmet')
const crypto = require('crypto')

const securityMiddleware = app => {
  // Different CSP configurations for development and production
  const developmentCSP = {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdnjs.cloudflare.com',
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  }

  const productionCSP = {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com',
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  }

  // Apply helmet with environment-specific CSP
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? productionCSP : developmentCSP,
      crossOriginEmbedderPolicy: false,
    }),
  )

  // Generate nonce for each request
  app.use((req, res, next) => {
    try {
      const nonce = crypto.randomBytes(16).toString('base64')
      res.locals.nonce = nonce
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

  // Development-specific middleware
  if (process.env.NODE_ENV !== 'production') {
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
