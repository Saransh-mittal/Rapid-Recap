const jwt = require('jsonwebtoken')

/**
 * Authentication middleware that verifies the access token
 */
const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.access_token

    if (!token) {
      return res.status(401).json({
        message: 'Access token required',
        tokenExpired: true,
      })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
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
