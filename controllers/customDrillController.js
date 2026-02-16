const asyncHandler = require('express-async-handler')
const { processCustomDrill } = require('../services/quickClashServices/customDrillService')
const soloDrillService = require('../services/quickClashServices/soloDrillService')

/**
 * POST /api/custom-drill/start
 * Body: { text?: string, imageBase64?: string, loadout: array }
 * Must provide exactly one of text or imageBase64.
 */
const MAX_TEXT_CHARS = 2500
const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // ~2MB base64

const startCustomDrillController = asyncHandler(async (req, res) => {
  const { text, imageBase64, loadout } = req.body

  const hasText = text && typeof text === 'string' && text.trim().length > 0
  const hasImage = imageBase64 && typeof imageBase64 === 'string' && imageBase64.length > 0

  if (!hasText && !hasImage) {
    res.status(400)
    throw new Error('Provide either text or a screenshot')
  }
  if (hasText && hasImage) {
    res.status(400)
    throw new Error('Provide either text or a screenshot, not both')
  }

  let trimmedText = null

  if (hasText) {
    trimmedText = text.trim()
    if (trimmedText.length < 50) {
      res.status(400)
      throw new Error('Text must be at least 50 characters')
    }
    if (trimmedText.length > MAX_TEXT_CHARS) {
      res.status(400)
      throw new Error(`Text is too long (max ${MAX_TEXT_CHARS} characters)`)
    }
  }

  if (hasImage) {
    // Basic size check (base64 string length ≈ 1.37x file size)
    if (imageBase64.length > MAX_IMAGE_BYTES * 1.4) {
      res.status(400)
      throw new Error('Image is too large (max 2MB)')
    }
  }

  // 1. Generate article via LLM
  let customArticle
  try {
    customArticle = await processCustomDrill({
      text: trimmedText,
      imageBase64: hasImage ? imageBase64 : undefined,
    })
  } catch (err) {
    // User-facing errors from the service (content quality, rate limits, AI busy)
    res.status(400)
    throw new Error(err.message || 'Failed to generate drill. Please try again.')
  }

  // 2. Start session (saves article to DB, creates session)
  const sessionResult = await soloDrillService.startCustomDrillSession({
    userId: req.user._id,
    customArticle,
    loadout,
    text: trimmedText || '[Screenshot upload]',
  })

  res.json(sessionResult)
})

/**
 * GET /api/custom-drill/limits
 */
const getCustomDrillLimitsController = asyncHandler(async (req, res) => {
  const result = await soloDrillService.getCustomDrillLimits({
    userId: req.user._id,
  })
  res.json(result)
})

/**
 * POST /api/custom-drill/purchase
 */
const purchaseCustomDrillsController = asyncHandler(async (req, res) => {
  const result = await soloDrillService.purchaseCustomDrills({
    userId: req.user._id,
  })
  res.json(result)
})

/**
 * GET /api/custom-drill/history
 */
const getCustomDrillHistoryController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await soloDrillService.getCustomDrillHistory({
    userId: req.user._id,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  })
  res.json(result)
})

module.exports = {
  startCustomDrillController,
  getCustomDrillLimitsController,
  purchaseCustomDrillsController,
  getCustomDrillHistoryController,
}
