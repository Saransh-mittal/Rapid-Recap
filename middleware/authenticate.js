// middleware/authenticate.js
const jwt = require('jsonwebtoken')

// Helper to check if request is from a bot/crawler
const isCrawler = userAgent => {
  const crawlerPattern =
    /(bot|lighthouse|spider|pinterest|crawler|archiver|flipboard|mediapartners|facebookexternalhit|quora|whatsapp|outbrain|yahoo! slurp|embedly|developers.google.com\/+\/web\/snippet|vkshare|w3c_validator|tumblr|skypeuripreview|nuzzel|qwantify|bitrix link preview|XING-contenttabreceiver|Chrome-Lighthouse|mail\.ru|Google-InspectionTool)/gi

  return userAgent && crawlerPattern.test(userAgent)
}

const Authenticate = async (req, res, next) => {
  // Skip authentication for bots/crawlers
  if (req.headers['user-agent'] && isCrawler(req.headers['user-agent'])) {
    return next()
  }

  try {
    const token = req.cookies.jwtoken
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token is not valid' })
      }
      req.user = decoded
      next()
    })
  } catch (error) {
    console.error('Authentication failed:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const adminMiddleware = (req, res, next) => {
  // Skip admin check for bots/crawlers
  if (req.headers['user-agent'] && isCrawler(req.headers['user-agent'])) {
    return next()
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}

module.exports = { Authenticate, adminMiddleware }
