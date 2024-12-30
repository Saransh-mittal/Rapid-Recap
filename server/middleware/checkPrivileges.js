const { Authenticate } = require('./authenticate')
const privilegeCache = require('../services/privilegeCache')

/**
 * Middleware to check for privileged access and authenticate if needed
 */
const checkPrivileges = async (req, res, next) => {
  const { category } = req.query
  const authHeader = req.headers.authorization

  if (!authHeader) {
    // No auth header, proceed with normal flow
    return next()
  }

  try {
    // Authenticate the request
    await Authenticate(req, res, async () => {
      if (!req.user) return next()

      // Check privileges from cache/DB

      const privileges = await privilegeCache.getPrivileges({
        userId: req.user._id,
        category,
      })

      // Attach privileges to request for controller use
      req.privileges = privileges
      next()
    })
  } catch (error) {
    // If authentication fails, proceed with normal flow
    next()
  }
}

module.exports = checkPrivileges
