const crypto = require('crypto')

function generateNonce() {
  return crypto.randomBytes(16).toString('base64')
}

function generateCSPDirectives(nonce, isDev) {
  if (isDev) {
    return {
      'default-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'ws://localhost:*',
        'http://localhost:*',
      ],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        `'nonce-${nonce}'`,
        'http://localhost:*',
        'ws://localhost:*',
      ],
      'connect-src': [
        "'self'",
        'ws://localhost:*',
        'wss://localhost:*',
        'http://localhost:*',
      ],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https://*'],
      'media-src': ["'self'", 'data:', 'blob:'],
      'worker-src': ["'self'", 'blob:'],
      'frame-src': ["'self'"],
      'child-src': ["'self'", 'blob:'],
    }
  }

  // Production CSP
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`],
    'style-src': ["'self'", "'unsafe-inline'"],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'blob:'],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'frame-src': ["'self'"],
  }
}

function setupCSPMiddleware(app) {
  app.use((req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development'
    const nonce = generateNonce()
    res.locals.nonce = nonce

    if (isDev) {
      // In development, use a more permissive CSP
      const cspDirectives = generateCSPDirectives(nonce, true)
      const cspString = Object.entries(cspDirectives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')

      res.setHeader('Content-Security-Policy', cspString)
    } else {
      // In production, use strict CSP
      const cspDirectives = generateCSPDirectives(nonce, false)
      const cspString = Object.entries(cspDirectives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')

      res.setHeader('Content-Security-Policy', cspString)
    }

    // Set other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    next()
  })
}

module.exports = { setupCSPMiddleware }
