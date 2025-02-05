const jwt = require('jsonwebtoken')

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    // Use promises instead of callback to handle JWT verification
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          if (err) reject(err)
          else resolve(decoded)
        })
      })

      req.user = decoded
      next()
    } catch (jwtError) {
      return res.status(401).json({ message: 'Token is not valid' })
    }
  } catch (error) {
    console.error('Authentication failed:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}

module.exports = { Authenticate, adminMiddleware }
