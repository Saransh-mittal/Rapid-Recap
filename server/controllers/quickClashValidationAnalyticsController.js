// controllers/quickClashValidationAnalyticsController.js
// Controller for Quick Clash Validation Analytics Dashboard
// NEW architecture - does not extend existing analytics

const asyncHandler = require('express-async-handler')
const analyticsService = require('../services/quickClashServices/quickClashValidationAnalyticsService')

/**
 * Get analytics overview with all KPIs
 * @route GET /api/admin/analytics/overview
 * @access Admin only
 */
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const overview = await analyticsService.getAnalyticsOverview({ startDate, endDate })

  res.json({
    success: true,
    data: overview,
  })
})

/**
 * Get footfall and traffic metrics
 * @route GET /api/admin/analytics/footfall
 * @access Admin only
 */
const getFootfallMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const [footfall, dau, newVsReturning, trafficBySource] = await Promise.all([
    analyticsService.getTotalFootfall({ startDate, endDate }),
    analyticsService.getDailyActiveUsers({ startDate, endDate }),
    analyticsService.getNewVsReturning({ startDate, endDate }),
    analyticsService.getTrafficBySource({ startDate, endDate }),
  ])

  res.json({
    success: true,
    data: {
      footfall,
      dau,
      newVsReturning,
      trafficBySource,
    },
  })
})

/**
 * Get bounce rate metrics
 * @route GET /api/admin/analytics/bounce
 * @access Admin only
 */
const getBounceRates = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const bounceRates = await analyticsService.getBounceRates({ startDate, endDate })

  res.json({
    success: true,
    data: bounceRates,
  })
})

/**
 * Get retention metrics (D1, D7, curve)
 * @route GET /api/admin/analytics/retention
 * @access Admin only
 */
const getRetentionMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const [d1, d7, curve] = await Promise.all([
    analyticsService.getD1Retention({ startDate, endDate }),
    analyticsService.getD7Retention({ startDate, endDate }),
    analyticsService.getRetentionCurve({ startDate, endDate }),
  ])

  res.json({
    success: true,
    data: {
      d1,
      d7,
      curve,
    },
  })
})

/**
 * Get engagement metrics (BPU, multi-battle rates)
 * @route GET /api/admin/analytics/engagement
 * @access Admin only
 */
const getEngagementMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const [bpu, multiBattle] = await Promise.all([
    analyticsService.getBattlesPerUser({ startDate, endDate }),
    analyticsService.getMultiBattleRate({ startDate, endDate }),
  ])

  res.json({
    success: true,
    data: {
      bpu,
      multiBattle,
    },
  })
})

/**
 * Get streak distribution and analytics
 * @route GET /api/admin/analytics/streaks
 * @access Admin only
 */
const getStreakMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const streakData = await analyticsService.getStreakDistribution({ startDate, endDate })

  res.json({
    success: true,
    data: streakData,
  })
})

/**
 * Get viral K-coefficient with breakdown
 * @route GET /api/admin/analytics/viral
 * @access Admin only
 */
const getViralCoefficient = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const viralData = await analyticsService.getViralCoefficient({ startDate, endDate })

  res.json({
    success: true,
    data: viralData,
  })
})

/**
 * Get viral K-coefficient trend over time
 * @route GET /api/admin/analytics/viral/trend
 * @access Admin only
 */
const getViralTrend = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query

  const trendData = await analyticsService.getViralTrend(parseInt(days))

  res.json({
    success: true,
    data: trendData,
  })
})

/**
 * Get session to account conversion metrics
 * @route GET /api/admin/analytics/conversion
 * @access Admin only
 */
const getConversionMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const conversionData = await analyticsService.getSessionToAccountConversion({ startDate, endDate })

  res.json({
    success: true,
    data: conversionData,
  })
})

/**
 * Get validation verdict with all criteria
 * @route GET /api/admin/analytics/verdict
 * @access Admin only
 */
const getValidationVerdict = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const verdict = await analyticsService.getValidationVerdict({ startDate, endDate })

  res.json({
    success: true,
    data: verdict,
  })
})

/**
 * Get list of users with analytics access
 * @route GET /api/admin/analytics/access
 * @access Admin only
 */
const getAccessList = asyncHandler(async (req, res) => {
  const accessList = await analyticsService.getAnalyticsAccessList()

  res.json({
    success: true,
    data: accessList,
  })
})

/**
 * Grant analytics access to a user
 * @route POST /api/admin/analytics/access/grant
 * @access Admin only
 */
const grantAccess = asyncHandler(async (req, res) => {
  const { userId, accessLevel = 'viewer', notes = '' } = req.body
  const grantedBy = req.user._id

  if (!userId) {
    res.status(400)
    throw new Error('User ID is required')
  }

  const access = await analyticsService.grantAnalyticsAccess({
    userId,
    grantedBy,
    accessLevel,
    notes,
  })

  res.json({
    success: true,
    message: 'Analytics access granted',
    data: access,
  })
})

/**
 * Revoke analytics access from a user
 * @route DELETE /api/admin/analytics/access/:userId
 * @access Admin only
 */
const revokeAccess = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!userId) {
    res.status(400)
    throw new Error('User ID is required')
  }

  const success = await analyticsService.revokeAnalyticsAccess(userId)

  if (!success) {
    res.status(404)
    throw new Error('Access record not found')
  }

  res.json({
    success: true,
    message: 'Analytics access revoked',
  })
})

/**
 * Get Solo Drill analytics metrics
 * @route GET /api/admin/analytics/solo-drill
 * @access Admin only
 */
const getSoloDrillAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  const { startDate, endDate } = analyticsService.getDateRange(parseInt(days))

  const soloDrill = await analyticsService.getSoloDrillMetrics({ startDate, endDate })

  res.json({
    success: true,
    data: soloDrill,
  })
})

module.exports = {
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
  getSoloDrillAnalytics,
  getAccessList,
  grantAccess,
  revokeAccess,
}
