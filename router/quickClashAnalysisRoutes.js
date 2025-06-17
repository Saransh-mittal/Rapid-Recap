// router/quickClashAnalysisRoutes.js (Enhanced with authorization)
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
// Note: QuickClash authorization is already applied in the parent router (quickClashRoutes.js)
const {
  getTeamBattleAnalysis,
  getUserBattleAnalysis,
  submitInsightFeedback,
  answerFollowUpQuestion,
  trackEngagement,
  getFeedbackAnalytics,
  triggerFeedbackAnalysis,
} = require('../controllers/quickClashAnalysisController')
const { makeRetryable } = require('../utils/retryUtils')
const {
  trackUserAction,
  trackEngagement: trackEngagementMiddleware,
} = require('../middleware/feedbackTrackingMiddleware')
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const {
  trackEngagementOptimized,
} = require('../controllers/optimizedEngagementController')
const {
  getUserPersonalization,
} = require('../controllers/personalizationController')

const router = express.Router()

// Authentication and QuickClash authorization are already applied in the parent router
// All routes here are automatically protected

// Battle analysis routes with retry mechanism and feedback tracking
router.get(
  '/battle/:battleId',
  trackUserAction('analysis_view'), // Track that user is viewing analysis
  makeRetryable(getTeamBattleAnalysis, {
    maxRetries: 2,
    operationName: 'GetBattleAnalysis',
    onRetry: (error, attempt) => {
      console.log(
        `Retrying battle analysis fetch, attempt ${attempt}: ${error.message}`,
      )
    },
  }),
)

router.get(
  '/history',
  trackUserAction('history_view'),
  makeRetryable(getUserBattleAnalysis, {
    maxRetries: 2,
    operationName: 'GetUserBattleHistory',
  }),
)

// Progressive Q&A routes with feedback tracking
router.post(
  '/answer-question',
  trackUserAction('question_answer'),
  makeRetryable(answerFollowUpQuestion, {
    maxRetries: 3,
    operationName: 'AnswerFollowUpQuestion',
    onRetry: (error, attempt) => {
      console.log(
        `Retrying question answer generation, attempt ${attempt}: ${error.message}`,
      )
    },
    onAllRetriesFailed: async (error, params) => {
      console.error('Failed to generate answer after all retries:', error)
      // Could implement fallback logic here, like storing failed attempts for manual review
    },
  }),
)

// Enhanced feedback routes
router.post(
  '/insight-feedback',
  trackUserAction('submit_feedback'),
  submitInsightFeedback,
)

router.post(
  '/track-engagement',
  trackUserAction('batch_engagement'),
  makeRetryable(trackEngagementOptimized, {
    maxRetries: 2,
    operationName: 'TrackEngagementBatch',
  }),
)

// Update the existing personalization route
router.get(
  '/personalization',
  trackUserAction('personalization_view'),
  makeRetryable(getUserPersonalization, {
    maxRetries: 1,
    operationName: 'GetPersonalization',
  }),
)

// Admin analytics endpoints (would need admin middleware in production)
router.get(
  '/feedback-analytics',
  // TODO: Add admin middleware here
  // requireAdmin,
  getFeedbackAnalytics,
)

router.post(
  '/analyze-feedback',
  // TODO: Add admin middleware here
  // requireAdmin,
  triggerFeedbackAnalysis,
)

// Health check route for monitoring
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quick Clash Analysis service is healthy',
    timestamp: new Date().toISOString(),
    version: '3.2.0',
    features: {
      feedbackTracking: true,
      aiPersonalization: true,
      automaticAnalysis: true,
      engagementTracking: true,
      authorizationProtected: true, // NEW: Indicates this is now protected
    },
  })
})

// Enhanced: Check if feedback already exists for specific insight
router.get('/check-feedback', async (req, res) => {
  try {
    const { analysisId, insightTitle } = req.query
    const userId = req.user._id

    if (!analysisId || !insightTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
        details: 'Both analysisId and insightTitle are required',
      })
    }

    // Enhanced feedback check with better title matching
    // This handles cases where titles might have timestamps or slight variations
    const existingFeedback = await QuickClashInsightFeedback.findOne({
      battleAnalysis: analysisId,
      user: userId,
      $or: [
        { 'insightData.title': insightTitle },
        {
          'insightData.title': {
            $regex: insightTitle.split('-')[0],
            $options: 'i',
          },
        },
        // Handle cases where frontend sends base title but backend has timestamped version
        {
          'insightData.title': {
            $regex: `^${insightTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            $options: 'i',
          },
        },
      ],
      'explicitFeedback.type': { $ne: 'not_provided' },
    })

    // Enhanced response with mobile context
    const userAgent = req.headers['user-agent'] || ''
    const isMobile =
      userAgent.includes('Mobile') ||
      userAgent.includes('Android') ||
      userAgent.includes('iPhone')

    res.status(200).json({
      success: true,
      exists: !!existingFeedback,
      feedback: existingFeedback
        ? {
            id: existingFeedback._id,
            type: existingFeedback.explicitFeedback.type,
            rating: existingFeedback.explicitFeedback.rating,
            comment: existingFeedback.explicitFeedback.comment || '',
            createdAt: existingFeedback.createdAt,
            updatedAt: existingFeedback.updatedAt,
            deviceType: existingFeedback.contextData?.deviceType || 'unknown',
            isMobileFeedback:
              existingFeedback.contextData?.deviceType === 'mobile',
            hasDetailedFeedback: !!(
              existingFeedback.explicitFeedback.comment ||
              Object.keys(
                existingFeedback.explicitFeedback.specificAspects || {},
              ).length > 0
            ),
            mobileExperienceRating:
              existingFeedback.explicitFeedback.specificAspects
                ?.mobile_experience || null,
          }
        : null,
      // Add context for frontend widget
      context: {
        currentDevice: isMobile ? 'mobile' : 'desktop',
        canProvideFeedback: !existingFeedback,
        recommendedFeedbackType: isMobile ? 'mobile_priority' : 'standard',
      },
      message: existingFeedback
        ? `Feedback already exists (${existingFeedback.explicitFeedback.type}${
            existingFeedback.contextData?.deviceType === 'mobile'
              ? ' - mobile'
              : ''
          })`
        : 'No feedback found - ready to collect',
    })
  } catch (error) {
    console.error('Error checking feedback:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check feedback status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Feedback summary for user
router.get('/feedback-summary', async (req, res) => {
  try {
    const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')

    const summary = await QuickClashInsightFeedback.aggregate([
      {
        $match: { user: req.user._id },
      },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: '$explicitFeedback.rating' },
          feedbackTypes: {
            $push: '$explicitFeedback.type',
          },
          lastFeedback: { $max: '$createdAt' },
        },
      },
    ])

    res.status(200).json({
      success: true,
      summary: summary[0] || {
        totalFeedback: 0,
        avgRating: 0,
        feedbackTypes: [],
        lastFeedback: null,
      },
    })
  } catch (error) {
    console.error('Error getting feedback summary:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback summary',
    })
  }
})

module.exports = router
