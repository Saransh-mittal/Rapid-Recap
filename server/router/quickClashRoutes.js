// routes/quickClashRoutes.js
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
// const {
//   checkQuickClashAuthorization,
// } = require('../middleware/quickClashAuthMiddleware')
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
  markChallengeRevenge,
  getUserTrophiesController,
  getUserTrophyHistoryController,
  calculatePotentialTrophyExchangeController,
  getUserCombinedTrophyHistoryController,
  getWinProbabilityExplanation,
  startForgeSession,
  submitForgeSectionAnswer,
  moveToNextForgeSection,
  getForgeSessionSummary,
  getForgeReviewController,
  placeBetController,
} = require('../controllers/quickClashController')
const {
  joinMatchmakingRoom,
  leaveMatchmakingRoom,
  getMatchmakingStatus,
} = require('../controllers/quickClashMatchmakingController')
const {
  joinGlobalMatchmakingQueue,
  leaveGlobalMatchmakingQueue,
  getGlobalMatchmakingStatusController,
  processGlobalMatchmakingController,
  getGlobalMatchmakingStatusDetailed,
  canLeaveMatchmakingController,
} = require('../controllers/quickClashGlobalMatchmakingController')
const teamRoutes = require('./quickClashTeamRoutes')
const analysisRoutes = require('./quickClashAnalysisRoutes')
const {
  usePowerupController
} = require('../controllers/quickClashPowerupController')

const router = express.Router()
const dailyTaskRoutes = require('./quickClashDailyTaskRoutes')
const {
  getCurrentUserProfile,
  getUserProfile,
  getUserAchievements,
  getUserRecentMatches,
  getUserStatistics,
  getBattleStatsForLanding,
  getDetailedRQMAnalysis,
  getGlobalRQMStats,
} = require('../controllers/quickClashProfileController')

// All routes need authentication first
router.use(Authenticate)

// IMPORTANT: Apply QuickClash authorization to ALL routes
// This middleware will return a 403 with coming soon data for unauthorized users
// router.use(checkQuickClashAuthorization)

// Mount daily task routes
router.use('/dailyTasks', dailyTaskRoutes)

// Mount team routes
router.use('/', teamRoutes)

// Mount analysis routes
router.use('/analysis', analysisRoutes)

// Challenge management routes
router.post('/challenge/create', createNewChallenge)
router.get('/challenges', getMyChallenges)
router.get('/challenges/completed', getCompletedChallenges)
router.get('/challenge/:challengeId', getChallenge)
router.post('/challenge/:challengeId/accept', handleAcceptChallenge)
router.post('/challenge/:challengeId/reject', handleRejectChallenge)
// Win probability for solo challenges
router.get(
  '/challenge/:challengeId/win-probability',
  getWinProbabilityExplanation,
)
router.get('/challenge/:challengeId/sessions', getSessionIdFromChallenge)
router.post('/challenge/:challengeId/markRevenge', markChallengeRevenge)
router.post('/challenge/:challengeId/bet', placeBetController)

// Challenge session routes
router.post('/session/:challengeId', startChallengeSession)
router.get('/session/:sessionId/quiz', getSessionQuiz)
router.post('/session/:sessionId/reading/start', startReadingPhase)
router.post('/session/:sessionId/reading/complete', completeReadingPhase)
router.post('/session/:sessionId/quiz/submit', submitQuizAnswers)
router.get('/session/:sessionId/report', getSessionQuizReport)
router.post('/session/:sessionId/powerup/use', usePowerupController)

// Challenge analysis routes
router.post('/analysis/:challengeId/generate', generateAnalysis)
router.get('/analysis/:challengeId', getChallengeAnalysis)
router.get('/analysis/:challengeId/status', getAnalysisStatus)

router.get('/stats', getUserClashStats)

// Simplified 1v1 matchmaking routes
router.post('/matchmaking/join', joinMatchmakingRoom)
router.post('/matchmaking/leave', leaveMatchmakingRoom)
router.get('/matchmaking/status', getMatchmakingStatus)

// Global 4v4 matchmaking routes (new)
router.post('/global-matchmaking/join', joinGlobalMatchmakingQueue)
router.post('/global-matchmaking/leave', leaveGlobalMatchmakingQueue)
router.get('/global-matchmaking/status', getGlobalMatchmakingStatusController)
router.post('/global-matchmaking/process', processGlobalMatchmakingController)
router.get(
  '/global-matchmaking-status-detailed',
  getGlobalMatchmakingStatusDetailed,
)
router.get('/can-leave-matchmaking', canLeaveMatchmakingController)

// Leaderboard routes
router.get('/leaderboard', getQuickClashLeaderboard)

// Trophy routes
router.get('/trophies', getUserTrophiesController)
router.get('/trophies/history', getUserTrophyHistoryController)
router.get(
  '/trophies/exchange/:opponentId',
  calculatePotentialTrophyExchangeController,
)
// Add this route with other trophy routes
router.get('/trophies/history/combined', getUserCombinedTrophyHistoryController)

// Profile routes
router.get('/profile', getCurrentUserProfile)
router.get('/profile/:userId', getUserProfile)
router.get('/profile/:userId/achievements', getUserAchievements)
router.get('/profile/:userId/matches', getUserRecentMatches)
router.get('/profile/:userId/statistics', getUserStatistics)
router.get('/battle-stats', getBattleStatsForLanding)

// NEW: Detailed RQM analysis route
router.get('/rqm-analysis', getDetailedRQMAnalysis)

// NEW: Global RQM statistics route (public data)
router.get('/global-stats', getGlobalRQMStats)

// Start forge mode for a session
router.post('/session/:sessionId/forge/start', startForgeSession)

// Submit answer for current forge section
router.post('/session/:sessionId/forge/answer', submitForgeSectionAnswer)

// Advance to next forge section (after reading)
router.post('/session/:sessionId/forge/next', moveToNextForgeSection)

// Get forge session summary
router.get('/session/:sessionId/forge/summary', getForgeSessionSummary)

// Get forge review (full article after completion)
router.get('/session/:sessionId/forge/review', getForgeReviewController)

module.exports = router
