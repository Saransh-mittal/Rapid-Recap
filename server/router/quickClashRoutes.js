// routes/quickClashRoutes.js
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
const {
  createNewChallenge,
  handleAcceptChallenge,
  handleRejectChallenge,
  getChallenge,
  getMyChallenges,
  startChallengeSession,
  startReadingPhase,
  completeReadingPhase,
  submitQuizAnswers,
} = require('../controllers/quickClashController')

const router = express.Router()

// All routes need authentication
router.use(Authenticate)

// Challenge management routes
router.post('/challenge/create', createNewChallenge)
router.post('/challenge/:challengeId/accept', handleAcceptChallenge)
router.post('/challenge/:challengeId/reject', handleRejectChallenge)
router.get('/challenge/:challengeId', getChallenge)
router.get('/challenges', getMyChallenges)

// Challenge session routes
router.post('/session/:challengeId', startChallengeSession)
router.post('/session/:sessionId/reading/start', startReadingPhase)
router.post('/session/:sessionId/reading/complete', completeReadingPhase)
router.post('/session/:sessionId/quiz/submit', submitQuizAnswers)

module.exports = router
