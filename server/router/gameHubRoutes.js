// router/gameHubRoutes.js
const express = require('express')
const router = express.Router()
const {
  getGameData,
  createGameSession,
  startGameSession,
  submitGameAttempt,
  getGameSummary,
  importGameData,
  exportGameData,
  checkGameCompletion,
} = require('../controllers/gameHub')
const { Authenticate } = require('../middleware/authenticate')

// Get game data for an article
router.route('/data/:articleId/:language').get(Authenticate, getGameData)

// Create a new game session
router.route('/session/create').post(Authenticate, createGameSession)

// Start a game session
router.route('/session/start/:sessionId').post(Authenticate, startGameSession)

// Submit game attempt
router.route('/attempt').post(Authenticate, submitGameAttempt)

// Get game summary/report
router.route('/summary/:sessionId').get(Authenticate, getGameSummary)

// Import custom game data
router.route('/import').post(Authenticate, importGameData)

// Export game data
router.route('/export/:articleId').get(Authenticate, exportGameData)

// Check if user has completed any game for an article
router
  .route('/completion/:articleId/:userId')
  .get(Authenticate, checkGameCompletion)

module.exports = router
