const asyncHandler = require('express-async-handler')
const {
  getMonthlyLeaderboard,
  getUserMonthlyStats,
  getUserHistoricalStats,
  getAvailableLeaderboardMonths,
} = require('../services/monthlyStatsService')
const moment = require('moment-timezone')

// API endpoint to get available months
const getAvailableMonths = asyncHandler(async (req, res) => {
  const availableMonths = await getAvailableLeaderboardMonths()

  res.json({
    status: 'success',
    data: availableMonths,
  })
})

// Modified leaderboard endpoint
const getLeaderboard = asyncHandler(async (req, res) => {
  const { month, year, includeModalStats } = req.query

  const leaderboardData = await getMonthlyLeaderboard({
    month: parseInt(month),
    year: parseInt(year),
    includeModalStats: includeModalStats === 'true',
  })

  res.json({
    status: 'success',
    data: leaderboardData,
  })
})

// Get user's monthly performance
const getUserMonthlyPerformance = asyncHandler(async (req, res) => {
  const { month, year } = req.query
  const userId = req.user._id

  const stats = await getUserMonthlyStats({
    userId,
    month: parseInt(month) || moment().month() + 1,
    year: parseInt(year) || moment().year(),
  })

  if (!stats) {
    return res.status(404).json({
      status: 'error',
      message: 'No stats found for the specified month',
    })
  }

  res.json({
    status: 'success',
    stats,
  })
})

// Get user's historical performance
const getUserHistoricalPerformance = asyncHandler(async (req, res) => {
  const { limit } = req.query
  const userId = req.user._id

  const stats = await getUserHistoricalStats({
    userId,
    limit: parseInt(limit) || 12,
  })

  res.json({
    status: 'success',
    stats,
  })
})

module.exports = {
  getLeaderboard,
  getUserMonthlyPerformance,
  getUserHistoricalPerformance,
  getAvailableMonths,
}
