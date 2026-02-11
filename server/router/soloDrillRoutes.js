const express = require('express')
const router = express.Router()
const { flexAuth } = require('../middleware/flexAuth')
const {
  getDrillLimitsController,
  purchaseDrillsController,
  startDrillController,
  getSessionController,
  getSessionQuizController,
  startForgeController,
  submitForgeAnswerController,
  advanceForgeController,
  submitQuizController,
  getStatsController,
  getCategoriesController,
  usePowerupController,
  getDrillHistoryController,
} = require('../controllers/soloDrillController')

// All routes require authentication
router.use(flexAuth)

// Limit & purchase routes
router.get('/limits', getDrillLimitsController)
router.post('/purchase', purchaseDrillsController)

// Session routes
router.post('/start', startDrillController)
router.get('/categories', getCategoriesController)
router.get('/stats', getStatsController)
router.get('/history', getDrillHistoryController)
router.get('/session/:sessionId', getSessionController)
router.get('/session/:sessionId/quiz', getSessionQuizController)
router.post('/session/:sessionId/forge/start', startForgeController)
router.post('/session/:sessionId/forge/answer', submitForgeAnswerController)
router.post('/session/:sessionId/forge/next', advanceForgeController)
router.post('/session/:sessionId/powerup/use', usePowerupController)
router.post('/session/:sessionId/quiz/submit', submitQuizController)

module.exports = router
