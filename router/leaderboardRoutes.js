const express = require('express')
const {
  getLeaderboard,
  getAvailableMonths,
} = require('../controllers/monthlyLeaderboardController')
const router = express.Router()

router.get('/monthly', getLeaderboard)
router.get('/available-months', getAvailableMonths)
module.exports = router
