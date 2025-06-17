// controllers/personalizationController.js
// Add this to quickClashAnalysisController.js

const asyncHandler = require('express-async-handler')
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const QuickClashFeedbackAnalyticsService = require('../services/quickClashServices/quickClashFeedbackAnalyticsService')

// Cache for personalization data to reduce DB calls
const personalizationCache = new Map()
const CACHE_DURATION = 300000 // 5 minutes

/**
 * @desc    Get user personalization insights with caching
 * @route   GET /api/quickClash/analysis/personalization
 * @access  Private
 */
const getUserPersonalization = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { includeRecommendations = true, includeHistory = false } = req.query

  // Check cache first
  const cacheKey = `${userId}_${includeRecommendations}_${includeHistory}`
  if (personalizationCache.has(cacheKey)) {
    const cachedData = personalizationCache.get(cacheKey)
    if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        ...cachedData.data,
        cached: true,
        cacheAge: Math.round((Date.now() - cachedData.timestamp) / 1000),
      })
    } else {
      personalizationCache.delete(cacheKey)
    }
  }

  try {
    // Get basic user feedback stats
    const feedbackStats = await QuickClashInsightFeedback.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: '$explicitFeedback.rating' },
          deviceBreakdown: {
            $push: '$contextData.deviceType',
          },
          feedbackTypes: {
            $push: '$explicitFeedback.type',
          },
          insightTypes: {
            $push: '$insightData.type',
          },
          lastFeedback: { $max: '$createdAt' },
          firstFeedback: { $min: '$createdAt' },
        },
      },
    ])

    const stats = feedbackStats[0] || {
      totalFeedback: 0,
      avgRating: 0,
      deviceBreakdown: [],
      feedbackTypes: [],
      insightTypes: [],
      lastFeedback: null,
      firstFeedback: null,
    }

    // Process device usage
    const deviceStats = stats.deviceBreakdown.reduce((acc, device) => {
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Process feedback type preferences
    const feedbackTypeStats = stats.feedbackTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Process insight type preferences
    const insightTypeStats = stats.insightTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Get recommendations if requested
    let recommendations = null
    if (includeRecommendations && stats.totalFeedback >= 3) {
      try {
        const analyticsResult =
          await QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights(
            {
              userId,
              lookbackDays: 30,
            },
          )
        recommendations = analyticsResult.recommendations
      } catch (error) {
        console.warn(
          'Failed to get personalization recommendations:',
          error.message,
        )
      }
    }

    // Get feedback history if requested
    let recentFeedback = []
    if (includeHistory) {
      recentFeedback = await QuickClashInsightFeedback.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          'insightData.title insightData.type explicitFeedback.rating explicitFeedback.type createdAt contextData.deviceType',
        )
        .lean()
    }

    // Calculate user engagement level
    const engagementLevel = calculateEngagementLevel(stats)

    // Determine user preferences
    const preferences = {
      preferredDevice:
        Object.entries(deviceStats).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'unknown',
      preferredFeedbackType:
        Object.entries(feedbackTypeStats).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'helpful',
      preferredInsightTypes: Object.entries(insightTypeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type),
      averageRating: Math.round(stats.avgRating * 10) / 10,
      feedbackFrequency: calculateFeedbackFrequency(
        stats.firstFeedback,
        stats.lastFeedback,
        stats.totalFeedback,
      ),
    }

    // Build response data
    const responseData = {
      userId,
      hasPersonalizationData: stats.totalFeedback > 0,
      engagementLevel,
      preferences,
      statistics: {
        totalFeedback: stats.totalFeedback,
        averageRating: stats.avgRating,
        deviceUsage: deviceStats,
        feedbackTypes: feedbackTypeStats,
        insightTypes: insightTypeStats,
        feedbackSpan: stats.firstFeedback
          ? {
              first: stats.firstFeedback,
              last: stats.lastFeedback,
              daysSince: Math.round(
                (Date.now() - new Date(stats.lastFeedback).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            }
          : null,
      },
      recommendations:
        recommendations || generateBasicRecommendations(preferences, stats),
      recentActivity: includeHistory ? recentFeedback : [],
      insights: {
        isMobilePrimary: (deviceStats.mobile || 0) > (deviceStats.desktop || 0),
        isActiveUser: stats.totalFeedback >= 5 && engagementLevel === 'high',
        prefersShorterContent: preferences.preferredFeedbackType === 'helpful',
        needsMoreEngagement:
          engagementLevel === 'low' && stats.totalFeedback < 3,
      },
    }

    // Cache the result
    personalizationCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    })

    res.status(200).json({
      success: true,
      ...responseData,
      generatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error getting user personalization:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personalization data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * Calculate user engagement level based on feedback patterns
 */
const calculateEngagementLevel = stats => {
  if (stats.totalFeedback === 0) return 'none'

  let score = 0

  // Feedback quantity (max 40 points)
  if (stats.totalFeedback >= 10) score += 40
  else if (stats.totalFeedback >= 5) score += 25
  else if (stats.totalFeedback >= 2) score += 15
  else score += 5

  // Feedback quality (max 30 points)
  if (stats.avgRating >= 4) score += 30
  else if (stats.avgRating >= 3) score += 20
  else if (stats.avgRating >= 2) score += 10
  else score += 5

  // Recency (max 30 points)
  if (stats.lastFeedback) {
    const daysSince =
      (Date.now() - new Date(stats.lastFeedback).getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysSince <= 3) score += 30
    else if (daysSince <= 7) score += 20
    else if (daysSince <= 14) score += 10
    else score += 5
  }

  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  if (score >= 20) return 'low'
  return 'minimal'
}

/**
 * Calculate feedback frequency
 */
const calculateFeedbackFrequency = (
  firstFeedback,
  lastFeedback,
  totalFeedback,
) => {
  if (!firstFeedback || !lastFeedback || totalFeedback <= 1)
    return 'insufficient_data'

  const daysBetween =
    (new Date(lastFeedback).getTime() - new Date(firstFeedback).getTime()) /
    (1000 * 60 * 60 * 24)
  const feedbackPerDay = totalFeedback / Math.max(1, daysBetween)

  if (feedbackPerDay >= 1) return 'daily'
  if (feedbackPerDay >= 0.5) return 'frequent'
  if (feedbackPerDay >= 0.2) return 'regular'
  if (feedbackPerDay >= 0.1) return 'occasional'
  return 'rare'
}

/**
 * Generate basic recommendations when advanced recommendations aren't available
 */
const generateBasicRecommendations = (preferences, stats) => {
  const recommendations = []

  if (stats.totalFeedback === 0) {
    recommendations.push(
      'Start providing feedback to help us personalize your experience',
    )
  } else if (stats.totalFeedback < 3) {
    recommendations.push(
      'Provide more feedback to unlock personalized insights',
    )
  }

  if (preferences.preferredDevice === 'mobile') {
    recommendations.push(
      'Optimized mobile experience based on your usage pattern',
    )
  }

  if (stats.avgRating >= 4) {
    recommendations.push('You find our insights very helpful - thank you!')
  } else if (stats.avgRating <= 2) {
    recommendations.push(
      "We're working to improve insights based on your feedback",
    )
  }

  return recommendations.length > 0
    ? recommendations
    : ['Continue providing feedback to improve AI insights']
}

// Clean up cache periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of personalizationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      personalizationCache.delete(key)
    }
  }
}, CACHE_DURATION)

module.exports = {
  getUserPersonalization,
  calculateEngagementLevel,
}
