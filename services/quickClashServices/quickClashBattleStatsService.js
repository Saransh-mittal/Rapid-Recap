// services/quickClashServices/quickClashBattleStatsService.js - Enhanced with Global RQM
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  calculateUserRQM,
  getCachedGlobalRQMStats,
  calculateUserPercentile,
} = require('./globalRQMStatsService')
const moment = require('moment')

/**
 * Get battle statistics for landing page display with global RQM comparisons
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Battle statistics with global comparisons
 */
const getBattleStats = async ({ userId }) => {
  try {
    // Convert userId to ObjectId if it's a string
    const userObjectId =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    // Get user basic info
    const user = await User.findById(userObjectId)
      .select('quickClashTrophies quickClashStats createdAt')
      .lean()

    if (!user) {
      return {
        battlesWon: 0,
        winRate: 0,
        teamBattlesWon: 0,
        averageRQM: 0,
        weeklyTeamWins: 0,
        currentWinStreak: 0,
        userTrophies: 1000,
        // Global comparison defaults
        globalComparison: {
          userRQM: 0,
          globalAverage: 0,
          highestRQM: 0,
          userPercentile: 0,
          lastUpdated: new Date(),
        },
      }
    }

    // Get 1v1 battle statistics
    const oneVsOneStats = await QuickClashTrophyHistory.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        },
      },
    ])

    const oneVsOneData = oneVsOneStats[0] || { totalMatches: 0, wins: 0 }
    const oneVsOneWinRate =
      oneVsOneData.totalMatches > 0
        ? Math.round((oneVsOneData.wins / oneVsOneData.totalMatches) * 100)
        : 0

    // Get team battle statistics
    const teamBattleStats = await QuickClashTeamTrophyHistory.aggregate([
      { $match: { user: userObjectId, userParticipated: true } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        },
      },
    ])

    const teamBattleData = teamBattleStats[0] || { totalMatches: 0, wins: 0 }

    // Get weekly team wins (last 7 days)
    const weekAgo = moment().subtract(7, 'days').toDate()
    const weeklyTeamWins = await QuickClashTeamTrophyHistory.countDocuments({
      user: userObjectId,
      userParticipated: true,
      result: 'win',
      createdAt: { $gte: weekAgo },
    })

    // Calculate user's individual RQM and get global comparisons
    const [userRQM, globalStats] = await Promise.all([
      calculateUserRQM(userObjectId),
      getCachedGlobalRQMStats(),
    ])

    // Calculate user percentile
    const userPercentile = globalStats.rqmStats?.percentiles
      ? calculateUserPercentile(userRQM, globalStats.rqmStats.percentiles)
      : 0

    // Calculate overall statistics
    const totalBattlesWon = oneVsOneData.wins + teamBattleData.wins
    const totalMatches = oneVsOneData.totalMatches + teamBattleData.totalMatches
    const overallWinRate =
      totalMatches > 0 ? Math.round((totalBattlesWon / totalMatches) * 100) : 0

    return {
      battlesWon: totalBattlesWon,
      winRate: overallWinRate,
      teamBattlesWon: teamBattleData.wins,
      averageRQM: userRQM,
      weeklyTeamWins: weeklyTeamWins,
      currentWinStreak: user.quickClashStats?.currentWinStreak || 0,
      userTrophies: user.quickClashTrophies || 1000,

      // NEW: Global RQM Comparison Data
      globalComparison: {
        userRQM: userRQM,
        globalAverage: Math.round(globalStats.rqmStats?.globalAverage || 0),
        highestRQM: Math.round(globalStats.rqmStats?.highestAverage || 0),
        userPercentile: userPercentile,
        totalPlayers: globalStats.rqmStats?.totalPlayersWithRQM || 0,
        lastUpdated: globalStats.lastUpdated || new Date(),
        // Additional insights
        performance: {
          vsGlobal:
            userRQM > 0
              ? Math.round(
                  ((userRQM - (globalStats.rqmStats?.globalAverage || 0)) /
                    (globalStats.rqmStats?.globalAverage || 1)) *
                    100,
                )
              : 0,
          vsHighest:
            userRQM > 0
              ? Math.round(
                  (userRQM / (globalStats.rqmStats?.highestAverage || 1)) * 100,
                )
              : 0,
        },
        percentileMessage: getPercentileMessage(userPercentile),
      },
    }
  } catch (error) {
    console.error('Error getting battle stats:', error)
    // Return default values on error
    return {
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
    }
  }
}

/**
 * Get descriptive message for user's percentile ranking
 * @param {number} percentile - User's percentile (0-100)
 * @returns {string} Descriptive message
 */
const getPercentileMessage = percentile => {
  if (percentile === 0) return 'Keep playing to establish your ranking!'
  if (percentile >= 99) return "You're in the top 1% of all players!"
  if (percentile >= 95) return "You're in the top 5% - Elite level!"
  if (percentile >= 90) return "You're in the top 10% - Excellent!"
  if (percentile >= 75) return "You're in the top 25% - Very good!"
  if (percentile >= 50) return "You're above average - Nice work!"
  if (percentile >= 25) return "You're improving - Keep it up!"
  return 'Great potential - Keep practicing!'
}

/**
 * Get extended RQM analysis for detailed comparison
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Detailed RQM analysis
 */
const getExtendedRQMAnalysis = async ({ userId }) => {
  try {
    const userObjectId =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    const [userRQM, globalStats, recentChallenges] = await Promise.all([
      calculateUserRQM(userObjectId),
      getCachedGlobalRQMStats(),
      QuickClashChallenge.find({
        $or: [
          { challenger: userObjectId, challengerAttempted: true },
          { opponent: userObjectId, opponentAttempted: true },
        ],
        status: 'completed',
        createdAt: { $gte: moment().subtract(30, 'days').toDate() },
      })
        .limit(20)
        .sort({ createdAt: -1 })
        .lean(),
    ])

    // Calculate recent performance trend
    const recentScores = recentChallenges.map(challenge => {
      const isChallenger =
        challenge.challenger.toString() === userObjectId.toString()
      return isChallenger ? challenge.challengerScore : challenge.opponentScore
    })

    const recentAverage =
      recentScores.length > 0
        ? Math.round(
            recentScores.reduce((a, b) => a + b, 0) / recentScores.length,
          )
        : 0

    const trend =
      recentAverage > userRQM
        ? 'improving'
        : recentAverage < userRQM
        ? 'declining'
        : 'stable'

    return {
      userRQM,
      globalAverage: globalStats.rqmStats?.globalAverage || 0,
      highestRQM: globalStats.rqmStats?.highestAverage || 0,
      userPercentile: calculateUserPercentile(
        userRQM,
        globalStats.rqmStats?.percentiles || {},
      ),
      recentPerformance: {
        recentAverage,
        trend,
        gamesAnalyzed: recentScores.length,
        improvement: recentAverage - userRQM,
      },
      globalContext: {
        totalPlayers: globalStats.rqmStats?.totalPlayersWithRQM || 0,
        percentiles: globalStats.rqmStats?.percentiles || {},
        lastUpdated: globalStats.lastUpdated,
      },
    }
  } catch (error) {
    console.error('Error getting extended RQM analysis:', error)
    throw error
  }
}

module.exports = {
  getBattleStats,
  getExtendedRQMAnalysis,
}
