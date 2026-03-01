const asyncHandler = require('express-async-handler')
const soloDrillService = require('../services/quickClashServices/soloDrillService')

const getDrillLimitsController = asyncHandler(async (req, res) => {
  const result = await soloDrillService.getDrillLimits({
    userId: req.user._id
  })
  res.json(result)
})

const purchaseDrillsController = asyncHandler(async (req, res) => {
  const result = await soloDrillService.purchaseDrills({
    userId: req.user._id
  })
  res.json(result)
})

const startDrillController = asyncHandler(async (req, res) => {
  const { category, loadout } = req.body
  const session = await soloDrillService.startDrillSession({
    userId: req.user._id,
    category,
    loadout
  })
  res.json(session)
})

const getSessionController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const session = await soloDrillService.getDrillSession({
    sessionId,
    userId: req.user._id.toString()
  })
  res.json(session)
})

const getSessionQuizController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  try {
    const result = await soloDrillService.getSessionQuizQuestions({
      sessionId,
      userId: req.user._id,
    })
    res.json(result)
  } catch (error) {
    if (error.code === 'SOLO_DRILL_BACKEND_SYNC_FAILED') {
      return res.status(500).json({
        success: false,
        error: error.code,
        message: error.message,
        canRetry: !!error.canRetry,
        details: error.details || null,
      })
    }

    throw error
  }
})

// Forge
const startForgeController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const result = await soloDrillService.startForge({
    sessionId,
    userId: req.user._id
  })
  res.json(result)
})

const submitForgeAnswerController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  // Frontend sends 'userAnswer', not 'answerIndex'
  // We also accept 'answerIndex' for backward compatibility or direct API usage
  const { sectionNumber, userAnswer, answerIndex, timeSpent, powerups, telemetry } = req.body

  const finalAnswerIndex = userAnswer !== undefined ? userAnswer : answerIndex

  const result = await soloDrillService.submitForgeAnswer({
    sessionId,
    userId: req.user._id,
    sectionNumber,
    answerIndex: finalAnswerIndex,
    timeSpent,
    powerups,
    telemetry,
  })
  res.json(result)
})

const advanceForgeController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const result = await soloDrillService.advanceForge({
    sessionId,
    userId: req.user._id
  })
  res.json(result)
})

// Quiz
const submitQuizController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { responses } = req.body
  const result = await soloDrillService.submitQuizAnswers({
    sessionId,
    userId: req.user._id,
    responses
  })
  res.json(result)
})

// Stats & Metadata
const getStatsController = asyncHandler(async (req, res) => {
  const result = await soloDrillService.getUserDrillStats({
    userId: req.user._id
  })
  res.json(result)
})

const getCategoriesController = asyncHandler(async (req, res) => {
  const categories = await soloDrillService.getCategories()
  res.json(categories)
})

const getDrillHistoryController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const result = await soloDrillService.getDrillHistory({
    userId: req.user._id,
    page,
    limit,
  })
  res.json(result)
})

const usePowerupController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { powerupId, questionId } = req.body
  const result = await soloDrillService.usePowerup({
    sessionId,
    userId: req.user._id,
    powerupId,
    questionId,
  })
  res.json(result)
})

module.exports = {
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
}
