// router/gameHubRoutes.js - UPDATED: Add abandoned game routes

const express = require('express')
const router = express.Router()
const {
  getGameData,
  createGameSession,
  startGameSession,
  submitGameAttempt,
  getGameSummary,
  getGameReport,
  checkGameCompletion,
  regenerateSingleGame,
  // NEW: Import abandoned game controllers
  submitAbandonedGameAttempt,
  getAbandonedAttempts,
  getGameSessionStatus,
} = require('../controllers/gameHub')
const { Authenticate } = require('../middleware/authenticate')

// Get game data for an article (language auto-detected from user preference)
router.route('/data/:articleId').get(Authenticate, getGameData)

// Create a new game session
router.route('/session/create').post(Authenticate, createGameSession)

// Start a game session
router.route('/session/start/:sessionId').post(Authenticate, startGameSession)

// NEW: Get game session status with abandonment check
router
  .route('/session/status/:sessionId')
  .get(Authenticate, getGameSessionStatus)

// Submit game attempt
router.route('/attempt').post(Authenticate, submitGameAttempt)

// NEW: Submit abandoned game attempt
router.route('/abandon').post(Authenticate, submitAbandonedGameAttempt)

// NEW: Get abandoned attempts for an article
router.route('/abandoned/:articleId').get(Authenticate, getAbandonedAttempts)

// Get game summary/report
router.route('/summary/:sessionId').get(Authenticate, getGameSummary)

// Get game report for an article (latest attempt)
router.route('/report/:articleId').get(Authenticate, getGameReport)

// Check if user has completed any game for an article
router
  .route('/completion/:articleId/:userId')
  .get(Authenticate, checkGameCompletion)

// regenerate game data for an article
router
  .route('/regenerate/:articleId/:gameType')
  .post(Authenticate, regenerateSingleGame)

module.exports = router
