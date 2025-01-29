const { isUnderMaintenance } = require('../services/maintenanceService')

// List of endpoints that should be available during maintenance
const ALLOWED_ENDPOINTS = ['/api/user/maintenance-status', '/api/admin']

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // Skip middleware for allowed endpoints
    if (ALLOWED_ENDPOINTS.some(endpoint => req.path.startsWith(endpoint))) {
      return next()
    }

    // Check if user has admin role
    const isAdmin = req.user?.role === 'admin'
    if (isAdmin) {
      return next()
    }

    const { isUnderMaintenance: maintenance, maintenance: details } =
      await isUnderMaintenance()

    if (maintenance) {
      return res.status(503).json({
        status: 'error',
        message: 'System is under maintenance',
        maintenance: {
          reason: details.reason,
          endTime: details.endTime,
          startTime: details.startTime,
        },
      })
    }

    next()
  } catch (error) {
    console.error('Error in maintenance middleware:', error)
    // In case of error, allow the request to proceed
    next()
  }
}

module.exports = maintenanceMiddleware
