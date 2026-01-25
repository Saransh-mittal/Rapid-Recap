// middleware/flexAuth.js
// Flexible authentication middleware that accepts either JWT token OR session ID
const jwt = require('jsonwebtoken')
const playSessionService = require('../services/playSessionService')

/**
 * flexAuth - Flexible authentication middleware
 *
 * Accepts authentication via:
 * 1. JWT access token (cookie: access_token) - for authenticated users
 * 2. Session ID header (X-Session-Id) - for session players
 *
 * Sets req.player with unified player data for use in route handlers
 */
const flexAuth = async (req, res, next) => {
  try {
    // Try JWT token first (authenticated users)
    const token = req.cookies.access_token

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        req.player = {
          _id: decoded._id,
          type: 'user',
          isAuthenticated: true,
          isSession: false,
          name: decoded.name,
          inGameName: decoded.inGameName,
        }
        return next()
      } catch (jwtError) {
        // JWT invalid/expired, try sessionId fallback
        console.log('[flexAuth] JWT verification failed, trying sessionId')
      }
    }

    // Try sessionId (session players)
    const sessionId = req.headers['x-session-id']

    if (sessionId) {
      const session = await playSessionService.getSession({ sessionId })

      if (session) {
        req.sessionPlayer = session
        req.player = {
          _id: session._id,
          sessionId: session.sessionId,
          type: 'session',
          isAuthenticated: false,
          isSession: true,
          name: session.inGameName,
          inGameName: session.inGameName,
          trophies: session.trophies,
        }
        return next()
      }
    }

    // No valid authentication found
    return res.status(401).json({
      message: 'Authentication required',
      tokenExpired: !token,
      hint: 'Provide JWT access token or X-Session-Id header',
    })
  } catch (error) {
    console.error('[flexAuth] Authentication error:', error)
    res.status(500).json({ message: 'Authentication error' })
  }
}

/**
 * optionalFlexAuth - Like flexAuth but doesn't require authentication
 * Useful for routes that work with or without authentication
 */
const optionalFlexAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        req.player = {
          _id: decoded._id,
          type: 'user',
          isAuthenticated: true,
          isSession: false,
          name: decoded.name,
          inGameName: decoded.inGameName,
        }
      } catch (jwtError) {
        // Ignore - optional auth
      }
    }

    if (!req.player) {
      const sessionId = req.headers['x-session-id']
      if (sessionId) {
        const session = await playSessionService.getSession({ sessionId })
        if (session) {
          req.sessionPlayer = session
          req.player = {
            _id: session._id,
            sessionId: session.sessionId,
            type: 'session',
            isAuthenticated: false,
            isSession: true,
            name: session.inGameName,
            inGameName: session.inGameName,
            trophies: session.trophies,
          }
        }
      }
    }

    // Continue even without auth
    next()
  } catch (error) {
    console.error('[optionalFlexAuth] Error:', error)
    next() // Continue anyway for optional auth
  }
}

module.exports = { flexAuth, optionalFlexAuth }
