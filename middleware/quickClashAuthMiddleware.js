// middleware/quickClashAuthMiddleware.js
/**
 * Ultra-fast middleware to check if user is authorized to access QuickClash features
 * Uses user IDs from JWT token for maximum performance (no DB queries)
 * Authorization list is managed via environment variables for security
 * Returns 403 with coming soon message for unauthorized users
 */
const checkQuickClashAuthorization = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        isComingSoon: true,
        comingSoonData: {
          title: 'QuickClash - Coming Soon!',
          message: 'Get ready for the most exciting competitive experience!',
          features: [
            'Real-time battles',
            'Team competitions',
            'Daily challenges',
            'Leaderboards',
          ],
        },
      })
    }

    const userId = req.user._id
    const userRole = req.user.role

    // Get authorized user IDs from environment variable
    const authorizedUserIdsString =
      process.env.QUICKCLASH_AUTHORIZED_USER_IDS || ''
    const authorizedUserIds = authorizedUserIdsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0)

    // Fast authorization check using user ID (no database query needed!)
    const isAuthorizedById = authorizedUserIds.includes(userId)

    // Optional: Also allow admin users (can be controlled via env variable)
    const allowAdmins = process.env.QUICKCLASH_ALLOW_ADMINS === 'true'
    const isAdmin = userRole === 'admin' && allowAdmins

    if (!isAuthorizedById && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'QuickClash access is currently limited to authorized users',
        isComingSoon: true,
        comingSoonData: {
          title: 'QuickClash - Coming Soon!',
          message: "We're preparing something amazing for you!",
          description:
            'QuickClash is currently in exclusive early access. Stay tuned for the public launch of this exciting feature!',
          features: [
            '⚡ Lightning-fast battles',
            '🎯 Skill-based matchmaking',
            '🏆 Tournament modes',
            '📊 Advanced analytics',
            '🎁 Daily rewards',
            '👥 Team challenges',
          ],
          userInfo: {
            userId: userId,
            isEarlyAccess: false,
            isAdmin: isAdmin,
          },
        },
      })
    }

    // User is authorized, proceed to next middleware
    next()
  } catch (error) {
    console.error('Error in QuickClash authorization middleware:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization check',
      isComingSoon: true,
      comingSoonData: {
        title: 'QuickClash - Coming Soon!',
        message: "Something went wrong, but we're working on it!",
        features: ['Amazing battles await!'],
      },
    })
  }
}

/**
 * Helper function to check if QuickClash is enabled at all
 * Useful for completely disabling the feature
 */
const isQuickClashEnabled = () => {
  return process.env.QUICKCLASH_ENABLED === 'true'
}

/**
 * Optional: Helper function to get current authorized user count
 * Useful for monitoring/admin purposes
 */
const getAuthorizedUserCount = () => {
  const authorizedUserIdsString =
    process.env.QUICKCLASH_AUTHORIZED_USER_IDS || ''
  const authorizedUserIds = authorizedUserIdsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)

  return authorizedUserIds.length
}

/**
 * Express async handler wrapper for the middleware
 */
const asyncHandler = require('express-async-handler')

module.exports = {
  checkQuickClashAuthorization: asyncHandler(checkQuickClashAuthorization),
  isQuickClashEnabled,
  getAuthorizedUserCount,
}
