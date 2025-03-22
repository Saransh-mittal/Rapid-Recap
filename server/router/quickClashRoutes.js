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
  getSessionQuiz,
  getCompletedChallenges,
  getSessionQuizReport,
  getSessionIdFromChallenge,
  generateAnalysis,
  getChallengeAnalysis,
  getUserClashStats,
  getAnalysisStatus,
  getQuickClashLeaderboard,
} = require('../controllers/quickClashController')
const {
  joinMatchmakingRoom,
  leaveMatchmakingRoom,
  getMatchmakingUsers,
  getMatchmakingStatus,
  acceptMatchmakingChallenge,
} = require('../controllers/quickClashMatchmakingController')

const router = express.Router()
const dailyTaskRoutes = require('./quickClashDailyTaskRoutes')

// All routes need authentication
router.use(Authenticate)

// Mount daily task routes
router.use('/dailyTasks', dailyTaskRoutes)

// Challenge management routes
router.post('/challenge/create', createNewChallenge)
router.get('/challenges', getMyChallenges)
router.get('/challenges/completed', getCompletedChallenges) // Add this new endpoint
router.get('/challenge/:challengeId', getChallenge)
router.post('/challenge/:challengeId/accept', handleAcceptChallenge)
router.post('/challenge/:challengeId/reject', handleRejectChallenge)
router.get('/challenge/:challengeId/sessions', getSessionIdFromChallenge)

// Challenge session routes
router.post('/session/:challengeId', startChallengeSession)
router.get('/session/:sessionId/quiz', getSessionQuiz) // Add this new endpoint
router.post('/session/:sessionId/reading/start', startReadingPhase)
router.post('/session/:sessionId/reading/complete', completeReadingPhase)
router.post('/session/:sessionId/quiz/submit', submitQuizAnswers)
router.get('/session/:sessionId/report', getSessionQuizReport)

// Challenge analysis routes
router.post('/analysis/:challengeId/generate', generateAnalysis)
router.get('/analysis/:challengeId', getChallengeAnalysis)
router.get('/analysis/:challengeId/status', getAnalysisStatus)

router.get('/stats', getUserClashStats)

// Matchmaking routes
router.post('/matchmaking/join', joinMatchmakingRoom)
router.post('/matchmaking/leave', leaveMatchmakingRoom)
router.get('/matchmaking/users', getMatchmakingUsers)
router.get('/matchmaking/status', getMatchmakingStatus)
router.post('/matchmaking/accept', acceptMatchmakingChallenge)

// Leaderboard routes
router.get('/leaderboard', getQuickClashLeaderboard)

module.exports = router
