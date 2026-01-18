// router/playRoutes.js
// Spark Engine - Routes for PlaySession (viral invite system)
const express = require('express')
const router = express.Router()
const { flexAuth } = require('../middleware/flexAuth')
const {
  createSession,
  createTeam,
  getSession,
  restoreSession,
  joinTeam,
  joinMatchmaking,
  getTeamInfo,
  getBattle,
  selectCategory,
  deselectCategory,
  beginChallenge,
  submitQuiz,
  convertToUser,
  convertWithGoogle,
  generateInviteUrl,
  // New session-aware challenge/session endpoints
  getChallenge,
  startQCSession,
  startReading,
  completeReading,
  // Team battles for session players
  getTeamBattles,
  // Session player info
  getSessionInfo,
  getMyTeam,
  // Matchmaking status
  getMatchmakingStatus,
  fixBattleHistory,
  // Team member management
  removeTeamMember,
  // Streak info
  getStreak,
  getActiveBattle,
} = require('../controllers/playSessionController')

// Import forge controllers from quickClashController
const {
  startForgeSession,
  submitForgeSectionAnswer,
  moveToNextForgeSection,
  getForgeSessionSummary,
  getForgeReviewController,
  // Quiz controllers
  getSessionQuiz,
  submitQuizAnswers,
} = require('../controllers/quickClashController')
const {usePowerupController} = require('../controllers/quickClashPowerupController')

// Public routes (no auth required)
router.post('/session', createSession)
router.get('/session/:sessionId', getSession)
router.post('/session/restore', restoreSession)
router.post('/team/create', createTeam)
router.post('/join/:teamCode', joinTeam)
router.post('/matchmaking/join', joinMatchmaking)
router.get('/matchmaking/status', flexAuth, getMatchmakingStatus)
router.get('/team/:teamCode/info', getTeamInfo)
router.post('/convert', convertToUser)
router.post('/convert/google', convertWithGoogle)
router.post('/invite', generateInviteUrl)
router.post('/fix-history', flexAuth, fixBattleHistory)

// Get active battle (authenticated) - for restoration
router.get('/battle/active', flexAuth, getActiveBattle)

// Battle routes (require flexAuth - works with JWT or sessionId)
router.get('/battle/:battleId', flexAuth, getBattle)
router.post('/battle/:battleId/select-category', flexAuth, selectCategory)
router.post('/battle/:battleId/deselect-category', flexAuth, deselectCategory)
router.post('/battle/:battleId/begin-challenge', flexAuth, beginChallenge)
router.post('/battle/:battleId/quiz/submit', flexAuth, submitQuiz)

// Team battles list for session players (require flexAuth)
router.get('/team-battles', flexAuth, getTeamBattles)

// Session player info endpoint (require flexAuth)
router.get('/me', flexAuth, getSessionInfo)

// Session player streak info (require flexAuth)
router.get('/streak', flexAuth, getStreak)

// Session player's current team (view-only mode)
router.get('/my-team', flexAuth, getMyTeam)

// Team member management (leader only)
router.post('/team/:teamId/remove', removeTeamMember)

// Quick Clash session routes for session players (require flexAuth)
router.get('/challenge/:challengeId', flexAuth, getChallenge)
router.post('/session/start', flexAuth, startQCSession)
router.post('/session/:sessionId/reading/start', flexAuth, startReading)
router.post('/session/:sessionId/reading/complete', flexAuth, completeReading)

// Forge mode routes for session players (require flexAuth)
router.post('/session/:sessionId/forge/start', flexAuth, startForgeSession)
router.post('/session/:sessionId/forge/answer', flexAuth, submitForgeSectionAnswer)
router.post('/session/:sessionId/forge/next', flexAuth, moveToNextForgeSection)
router.get('/session/:sessionId/forge/summary', flexAuth, getForgeSessionSummary)
router.get('/session/:sessionId/forge/review', flexAuth, getForgeReviewController)

// Quiz routes for session players (require flexAuth)
router.get('/session/:sessionId/quiz', flexAuth, getSessionQuiz)
router.post('/session/:sessionId/quiz/submit', flexAuth, submitQuizAnswers)

// Powerup routes for session players (require flexAuth)
router.post('/session/:sessionId/powerup/use', flexAuth, usePowerupController)

module.exports = router

