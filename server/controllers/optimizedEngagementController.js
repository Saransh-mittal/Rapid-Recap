// controllers/optimizedEngagementController.js
// Add this to quickClashAnalysisController.js or create separate file

const asyncHandler = require('express-async-handler')
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const QuickClashTeamBattleAnalysis = require('../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')

// Enhanced cache for preventing duplicate processing
const processingCache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

/**
 * @desc    Track engagement data with batching and optimization
 * @route   POST /api/quickClash/analysis/track-engagement
 * @access  Private
 */
const trackEngagementOptimized = asyncHandler(async (req, res) => {
  const { engagementData } = req.body
  const userId = req.user._id

  // Validate required data
  if (!engagementData || !engagementData.analysisId) {
    return res.status(400).json({
      success: false,
      message: 'Missing engagement data or analysis ID',
    })
  }

  const { analysisId, sessionData, interactions, timestamp } = engagementData

  // Skip processing if session too short (less than 10 seconds)
  if (sessionData.totalTime < 10000) {
    return res.status(200).json({
      success: true,
      message: 'Session too short to track',
      skipped: true,
    })
  }

  // Create cache key for deduplication
  const cacheKey = `${userId}_${analysisId}_${Math.floor(timestamp / 60000)}` // Group by minute

  // Check if already processing this data
  if (processingCache.has(cacheKey)) {
    return res.status(200).json({
      success: true,
      message: 'Engagement data already being processed',
      cached: true,
    })
  }

  // Add to processing cache
  processingCache.set(cacheKey, true)
  setTimeout(() => processingCache.delete(cacheKey), CACHE_DURATION)

  try {
    // Verify analysis exists
    const analysis = await QuickClashTeamBattleAnalysis.findById(analysisId)
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      })
    }

    // Generate safe title for engagement tracking
    const engagementTitle = `Engagement-Batch-${userId
      .toString()
      .slice(-8)}-${Date.now()}`

    // Process significant interactions only
    const significantInteractions = interactions.filter(interaction => {
      switch (interaction.type) {
        case 'scroll_milestone':
          return interaction.data.depth >= 50 // Only track 50%+ scroll
        case 'section_expanded':
        case 'question_viewed':
        case 'feedback_submitted':
          return true
        case 'reading_time':
          return interaction.data.timeSpent > 5000 // Only track 5+ seconds reading
        default:
          return false
      }
    })

    // Calculate engagement score (0-100)
    const engagementScore = calculateEngagementScore(
      sessionData,
      significantInteractions,
    )

    // Only store if engagement is meaningful (score > 20)
    if (engagementScore < 20) {
      return res.status(200).json({
        success: true,
        message: 'Low engagement, not stored',
        score: engagementScore,
        skipped: true,
      })
    }

    // Create or update engagement feedback
    const engagementFeedback = await QuickClashInsightFeedback.findOneAndUpdate(
      {
        battleAnalysis: analysisId,
        user: userId,
        'insightData.type': 'engagement_batch',
      },
      {
        $set: {
          'implicitFeedback.timeSpent.totalViewTime': sessionData.totalTime,
          'implicitFeedback.interactions.scrollDepth': sessionData.scrollDepth,
          'implicitFeedback.interactions.expanded':
            sessionData.expandedSections.length > 0,
          'implicitFeedback.interactions.clickedFollowUp':
            sessionData.questionsViewed.size > 0,
          'contextData.deviceType': sessionData.deviceType,
          'contextData.sessionLength': sessionData.totalTime,
          'contextData.interactionCount': significantInteractions.length,
          'contextData.engagementScore': engagementScore,
          'contextData.feedbackProvided': sessionData.feedbackGiven,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          battleAnalysis: analysisId,
          user: userId,
          battle: analysis.battle,
          'insightData.title': engagementTitle,
          'insightData.description': 'Batched engagement tracking data',
          'insightData.type': 'engagement_batch',
          'insightData.category': 'general',
          'insightData.generationContext': {
            userExperienceLevel:
              req.user.level >= 10 ? 'intermediate' : 'beginner',
            battleCount: 0,
            promptVersion: 'engagement_batch_v1',
            temperature: 0,
          },
          'explicitFeedback.type': 'not_provided',
          'explicitFeedback.rating': Math.min(
            5,
            Math.max(1, Math.round(engagementScore / 20)),
          ),
          'explicitFeedback.comment': 'Implicit engagement tracking',
          'processingStatus.analyzed': false,
          'processingStatus.includedInMetrics': true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )

    // Log interaction summary for analytics
    const interactionSummary = significantInteractions.reduce(
      (summary, interaction) => {
        summary[interaction.type] = (summary[interaction.type] || 0) + 1
        return summary
      },
      {},
    )

    console.log(`Engagement tracked for user ${userId}:`, {
      totalTime: Math.round(sessionData.totalTime / 1000) + 's',
      scrollDepth: sessionData.scrollDepth + '%',
      interactions: interactionSummary,
      score: engagementScore,
      feedbackGiven: sessionData.feedbackGiven,
    })

    res.status(200).json({
      success: true,
      message: 'Engagement data processed successfully',
      summary: {
        engagementScore,
        significantInteractions: significantInteractions.length,
        totalTime: Math.round(sessionData.totalTime / 1000),
        scrollDepth: sessionData.scrollDepth,
        feedbackProvided: sessionData.feedbackGiven,
      },
    })
  } catch (error) {
    console.error('Error tracking engagement:', error)

    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Engagement data already exists',
        duplicate: true,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to track engagement data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * Calculate engagement score based on user behavior
 * @param {Object} sessionData - Session data
 * @param {Array} interactions - User interactions
 * @returns {Number} Engagement score (0-100)
 */
const calculateEngagementScore = (sessionData, interactions) => {
  let score = 0

  // Time-based scoring (max 30 points)
  const timeMinutes = sessionData.totalTime / 60000
  if (timeMinutes >= 1) score += Math.min(30, timeMinutes * 5)

  // Scroll depth scoring (max 25 points)
  score += Math.min(25, sessionData.scrollDepth * 0.25)

  // Interaction scoring (max 25 points)
  const interactionPoints = {
    section_expanded: 3,
    question_viewed: 4,
    feedback_submitted: 10,
    reading_time: 2,
    scroll_milestone: 1,
  }

  const interactionScore = interactions.reduce((total, interaction) => {
    return total + (interactionPoints[interaction.type] || 0)
  }, 0)
  score += Math.min(25, interactionScore)

  // Bonus points for meaningful engagement (max 20 points)
  if (sessionData.feedbackGiven) score += 15
  if (sessionData.expandedSections.length >= 3) score += 5
  if (sessionData.questionsViewed.size >= 2) score += 5

  return Math.min(100, Math.round(score))
}

module.exports = {
  trackEngagementOptimized,
  calculateEngagementScore,
}
