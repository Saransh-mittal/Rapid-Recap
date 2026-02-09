const jwt = require('jsonwebtoken')

/**
 * Authentication middleware that verifies the access token
 */
const Authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.access_token

    // Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Fallback to x-auth-token header (legacy/alternative)
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token']
    }

    if (!token) {
      return res.status(401).json({
        message: 'Access token required',
        tokenExpired: true,
      })
    }

    const authTimerLabel = `Auth-JWT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    console.time(authTimerLabel)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      console.timeEnd(authTimerLabel)
      if (err) {
        return res.status(401).json({
          message: 'Access token is invalid or expired',
          tokenExpired: true,
        })
      }

      req.user = decoded
      next()
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
    console.error('Authentication failed:', error)
  }
}

/**
 * Admin authorization middleware
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}

module.exports = { Authenticate, adminMiddleware }
