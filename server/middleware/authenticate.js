const jwt = require('jsonwebtoken')

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token is not valid' })
      }
      req.user = decoded
      next()
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
    console.error('Authentication failed:', error)
  }
}

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}

module.exports = { Authenticate, adminMiddleware }
