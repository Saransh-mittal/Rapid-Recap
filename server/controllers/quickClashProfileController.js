// controllers/quickClashProfileController.js
const asyncHandler = require('express-async-handler')
const {
  getQuickClashProfile,
  getQuickClashAchievements,
  getQuickClashRecentMatches,
  getQuickClashStatistics,
} = require('../services/quickClashServices/quickClashProfileService')
const {
  getBattleStats,
  getExtendedRQMAnalysis,
} = require('../services/quickClashServices/quickClashBattleStatsService')
const {
  getCachedGlobalRQMStats,
} = require('../services/quickClashServices/globalRQMStatsService')

/**
 * @desc    Get Quick Clash profile data for current user
 * @route   GET /api/quickClash/profile
 * @access  Private
 */
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const profile = await getQuickClashProfile({ userId })

    res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error fetching current user Quick Clash profile:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Quick Clash profile',
    })
  }
})

/**
 * @desc    Get Quick Clash profile data for specific user
 * @route   GET /api/quickClash/profile/:userId
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const profile = await getQuickClashProfile({ userId })

    res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error fetching user Quick Clash profile:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Quick Clash profile',
    })
  }
})

/**
 * @desc    Get Quick Clash achievements for user
 * @route   GET /api/quickClash/profile/:userId/achievements
 * @access  Private
 */
const getUserAchievements = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const achievements = await getQuickClashAchievements({ userId })

    res.status(200).json({
      success: true,
      achievements,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash achievements:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch achievements',
    })
  }
})

/**
 * @desc    Get Quick Clash recent matches for user
 * @route   GET /api/quickClash/profile/:userId/matches
 * @access  Private
 */
const getUserRecentMatches = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { limit = 10 } = req.query

  try {
    const matches = await getQuickClashRecentMatches({
      userId,
      limit: parseInt(limit),
    })

    res.status(200).json({
      success: true,
      matches,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash recent matches:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch recent matches',
    })
  }
})

/**
 * @desc    Get Quick Clash detailed statistics for user
 * @route   GET /api/quickClash/profile/:userId/statistics
 * @access  Private
 */
const getUserStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const statistics = await getQuickClashStatistics({ userId })

    res.status(200).json({
      success: true,
      statistics,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash statistics:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    })
  }
})

/**
 * @desc    Get battle statistics for landing page with global RQM comparisons
 * @route   GET /api/quickClash/battle-stats
 * @access  Private
 */
const getBattleStatsForLanding = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const battleStats = await getBattleStats({ userId })

    res.status(200).json({
      success: true,
      data: battleStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching battle stats:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch battle statistics',
      // Send default values on error
      data: {
        battlesWon: 0,
        winRate: 0,
        teamBattlesWon: 0,
        averageRQM: 0,
        weeklyTeamWins: 0,
        currentWinStreak: 0,
        userTrophies: 1000,
        globalComparison: {
          userRQM: 0,
          globalAverage: 0,
          highestRQM: 0,
          userPercentile: 0,
          totalPlayers: 0,
          lastUpdated: new Date(),
          performance: {
            vsGlobal: 0,
            vsHighest: 0,
          },
          percentileMessage: 'Keep playing to establish your ranking!',
        },
      },
    })
  }
})

/**
 * @desc    Get extended RQM analysis with detailed comparisons
 * @route   GET /api/quickClash/rqm-analysis
 * @access  Private
 */
const getDetailedRQMAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const analysis = await getExtendedRQMAnalysis({ userId })

    res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching RQM analysis:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch RQM analysis',
      data: null,
    })
  }
})

/**
 * @desc    Get global RQM statistics (public endpoint for leaderboards, etc.)
 * @route   GET /api/quickClash/global-stats
 * @access  Private
 */
const getGlobalRQMStats = asyncHandler(async (req, res) => {
  try {
    const globalStats = await getCachedGlobalRQMStats()

    // Format response for public consumption (remove sensitive data)
    const publicStats = {
      globalAverage: Math.round(globalStats.rqmStats?.globalAverage || 0),
      highestRQM: Math.round(globalStats.rqmStats?.highestRQM || 0),
      medianRQM: Math.round(globalStats.rqmStats?.medianRQM || 0),
      totalPlayers: globalStats.rqmStats?.totalPlayersWithRQM || 0,
      percentileRanges: {
        elite: globalStats.rqmStats?.percentiles?.p95 || 0,
        advanced: globalStats.rqmStats?.percentiles?.p75 || 0,
        intermediate: globalStats.rqmStats?.percentiles?.p50 || 0,
        beginner: globalStats.rqmStats?.percentiles?.p25 || 0,
      },
      trophyStats: {
        averageTrophies: Math.round(
          globalStats.trophyStats?.averageTrophies || 1000,
        ),
        highestTrophies: globalStats.trophyStats?.highestTrophies || 1000,
        totalPlayers: globalStats.trophyStats?.totalPlayers || 0,
      },
      lastUpdated: globalStats.lastUpdated,
      dataFreshness: {
        minutesOld: Math.round(
          (Date.now() - new Date(globalStats.lastUpdated).getTime()) /
            (1000 * 60),
        ),
        status:
          Math.round(
            (Date.now() - new Date(globalStats.lastUpdated).getTime()) /
              (1000 * 60),
          ) < 60
            ? 'fresh'
            : 'stale',
      },
    }

    res.status(200).json({
      success: true,
      data: publicStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching global RQM stats:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch global statistics',
      data: {
        globalAverage: 0,
        highestRQM: 0,
        medianRQM: 0,
        totalPlayers: 0,
        percentileRanges: {
          elite: 0,
          advanced: 0,
          intermediate: 0,
          beginner: 0,
        },
        trophyStats: {
          averageTrophies: 1000,
          highestTrophies: 1000,
          totalPlayers: 0,
        },
        lastUpdated: new Date(),
        dataFreshness: { minutesOld: 0, status: 'unavailable' },
      },
    })
  }
})

module.exports = {
  getCurrentUserProfile,
  getUserProfile,
  getUserAchievements,
  getUserRecentMatches,
  getUserStatistics,
  getBattleStatsForLanding,
  getDetailedRQMAnalysis,
  getGlobalRQMStats,
}
