// router/analyticsRoutes.js
// Routes for Quick Clash Validation Analytics Dashboard
// NEW architecture with admin-only access control

const express = require('express')
const router = express.Router()

const {
  getAnalyticsOverview,
  getFootfallMetrics,
  getBounceRates,
  getRetentionMetrics,
  getEngagementMetrics,
  getStreakMetrics,
  getViralCoefficient,
  getViralTrend,
  getConversionMetrics,
  getValidationVerdict,
  getAccessList,
  grantAccess,
  revokeAccess,
} = require('../controllers/quickClashValidationAnalyticsController')

const { Authenticate } = require('../middleware/authenticate')
const analyticsService = require('../services/quickClashServices/quickClashValidationAnalyticsService')

/**
 * Analytics Admin Middleware
 * Checks if user has analytics dashboard access
 */
const analyticsAdminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id

    const hasAccess = await analyticsService.hasAnalyticsAccess(userId)

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Analytics dashboard access required.',
      })
    }

    next()
  } catch (error) {
    console.error('[AnalyticsMiddleware] Error checking access:', error)
    return res.status(500).json({
      success: false,
      message: 'Error checking analytics access',
    })
  }
}

// Apply authentication and analytics access check to all routes
router.use(Authenticate, analyticsAdminMiddleware)

// ============================================================================
// OVERVIEW
// ============================================================================

// GET /api/admin/analytics/overview - Get all KPIs for dashboard header
router.get('/overview', getAnalyticsOverview)

// ============================================================================
// FOOTFALL & TRAFFIC
// ============================================================================

// GET /api/admin/analytics/footfall - Get footfall, DAU, new vs returning, traffic sources
router.get('/footfall', getFootfallMetrics)

// ============================================================================
// BOUNCE RATES
// ============================================================================

// GET /api/admin/analytics/bounce - Get all bounce rate metrics
router.get('/bounce', getBounceRates)

// ============================================================================
// RETENTION
// ============================================================================

// GET /api/admin/analytics/retention - Get D1, D7, and retention curve
router.get('/retention', getRetentionMetrics)

// ============================================================================
// ENGAGEMENT
// ============================================================================

// GET /api/admin/analytics/engagement - Get BPU and multi-battle rates
router.get('/engagement', getEngagementMetrics)

// ============================================================================
// STREAKS
// ============================================================================

// GET /api/admin/analytics/streaks - Get streak distribution
router.get('/streaks', getStreakMetrics)

// ============================================================================
// VIRAL K-COEFFICIENT
// ============================================================================

// GET /api/admin/analytics/viral - Get K-coefficient with breakdown
router.get('/viral', getViralCoefficient)

// GET /api/admin/analytics/viral/trend - Get K-coefficient trend over time
router.get('/viral/trend', getViralTrend)

// ============================================================================
// CONVERSION
// ============================================================================

// GET /api/admin/analytics/conversion - Get session to account conversion
router.get('/conversion', getConversionMetrics)

// ============================================================================
// VERDICT
// ============================================================================

// GET /api/admin/analytics/verdict - Get validation verdict with all criteria
router.get('/verdict', getValidationVerdict)

// ============================================================================
// ACCESS MANAGEMENT
// ============================================================================

// GET /api/admin/analytics/access - Get list of users with analytics access
router.get('/access', getAccessList)

// POST /api/admin/analytics/access/grant - Grant analytics access
router.post('/access/grant', grantAccess)

// DELETE /api/admin/analytics/access/:userId - Revoke analytics access
router.delete('/access/:userId', revokeAccess)

module.exports = router
