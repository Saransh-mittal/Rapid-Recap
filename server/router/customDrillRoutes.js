const express = require('express')
const router = express.Router()
const { flexAuth } = require('../middleware/flexAuth')
const {
  customDrillRateLimit,
  customDrillGenerationGuard,
} = require('../middleware/customDrillRateLimit')
const {
  startCustomDrillController,
  getCustomDrillLimitsController,
  purchaseCustomDrillsController,
  getCustomDrillHistoryController,
} = require('../controllers/customDrillController')

// All routes require authentication
router.use(flexAuth)

// General rate limit on all custom-drill endpoints (30 req/min per user)
router.use(customDrillRateLimit)

router.get('/limits', getCustomDrillLimitsController)
router.post('/purchase', purchaseCustomDrillsController)
router.get('/history', getCustomDrillHistoryController)

// /start gets extra protection: generation rate limit + concurrent guard
router.post('/start', customDrillGenerationGuard, startCustomDrillController)

module.exports = router
