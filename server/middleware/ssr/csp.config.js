// server/middleware/ssr/csp.config.js
const crypto = require('crypto')

function generateCSPDirectives(nonce, isDev) {
  return {
    'default-src': ["'self'", 'https:', 'http:'],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-eval'",
      "'unsafe-inline'",
      'https://cdnjs.cloudflare.com',
      isDev && 'http://localhost:*',
      isDev && 'ws://localhost:*',
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https://*', 'blob:'],
    'connect-src': [
      "'self'",
      isDev && 'ws://localhost:*',
      isDev && 'wss://localhost:*',
      'ws:',
      'wss:',
    ].filter(Boolean),
    'worker-src': ["'self'", 'blob:'],
    'frame-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  }
}

function setupCSPMiddleware(app) {
  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64')
    res.locals.nonce = nonce

    const isDev = process.env.NODE_ENV === 'development'
    const cspDirectives = generateCSPDirectives(nonce, isDev)

    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')

    res.setHeader('Content-Security-Policy', cspString)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    if (!isDev) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      )
    }

    next()
  })
}

module.exports = { setupCSPMiddleware }
