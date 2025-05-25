// router/quickClashAnalysisRoutes.js
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
const {
  getTeamBattleAnalysis,
  getUserBattleAnalysis,
  submitInsightFeedback,
  answerFollowUpQuestion,
} = require('../controllers/quickClashAnalysisController')
const { makeRetryable } = require('../utils/retryUtils')

const router = express.Router()

// All routes need authentication
router.use(Authenticate)

// Battle analysis routes with retry mechanism for critical operations
router.get(
  '/battle/:battleId',
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
  makeRetryable(getUserBattleAnalysis, {
    maxRetries: 2,
    operationName: 'GetUserBattleHistory',
  }),
)

// Progressive Q&A routes
router.post(
  '/answer-question',
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

// Insight feedback route
router.post('/insight-feedback', submitInsightFeedback)

// Health check route for monitoring
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quick Clash Analysis service is healthy',
    timestamp: new Date().toISOString(),
    version: '3.1.0',
  })
})

module.exports = router
