const jwt = require('jsonwebtoken')

/**
 * Authentication middleware that verifies the access token
 */
const CheckLoggedInOrNot = async (req, res, next) => {
  try {
    const token = req.cookies.access_token

    if (!token) {
      req.user = null
      return next()
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        req.user = null
        return next()
      }

      req.user = decoded
      next()
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
    console.error('Authentication failed:', error)
    req.user = null
  }
}

module.exports = { CheckLoggedInOrNot }
