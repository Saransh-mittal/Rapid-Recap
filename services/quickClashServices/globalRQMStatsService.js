// services/quickClashServices/globalRQMStatsService.js
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const GlobalQuickClashStats = require('../../model/quickClashSchemas/globalQuickClashStatsSchema')
const cache = require('memory-cache')

/**
 * Calculate user's individual RQM from completed challenges
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 * @returns {Promise<number>} Average RQM score
 */
const calculateUserRQM = async userId => {
  try {
    const userObjectId =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    const rqmStats = await QuickClashChallenge.aggregate([
      {
        $match: {
          $or: [
            { challenger: userObjectId, challengerAttempted: true },
            { opponent: userObjectId, opponentAttempted: true },
          ],
          status: 'completed',
        },
      },
      {
        $addFields: {
          userScore: {
            $cond: [
              { $eq: ['$challenger', userObjectId] },
              '$challengerScore',
              '$opponentScore',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalScore: { $sum: '$userScore' },
          totalChallenges: { $sum: 1 },
        },
      },
    ])

    return rqmStats[0] && rqmStats[0].totalChallenges > 0
      ? Math.round(rqmStats[0].totalScore / rqmStats[0].totalChallenges)
      : 0
  } catch (error) {
    console.error('Error calculating user RQM:', error)
    return 0
  }
}

/**
 * Calculate global RQM statistics using batched processing
 * @returns {Promise<Object>} Global RQM statistics
 */
const calculateGlobalRQMStats = async () => {
  const startTime = Date.now()
  console.log('Starting global RQM calculation...')

  try {
    // Get all users who have QuickClash activity (more efficient than all users)
    const activeUsers = await User.find({
      $or: [
        { quickClashTrophies: { $exists: true, $ne: null } },
        { 'quickClashStats.currentWinStreak': { $exists: true } },
      ],
    })
      .select('_id quickClashTrophies')
      .lean()

    console.log(`Found ${activeUsers.length} active QuickClash users`)

    // If no active users, return default stats
    if (activeUsers.length === 0) {
      return {
        rqmStats: {
          globalAverage: 0,
          highestAverage: 0,
          medianRQM: 0,
          totalPlayersWithRQM: 0,
          percentiles: {
            p10: 0,
            p25: 0,
            p50: 0,
            p75: 0,
            p90: 0,
            p95: 0,
            p99: 0,
          },
        },
        trophyStats: {
          averageTrophies: 1000,
          highestTrophies: 1000,
          totalPlayers: 0,
        },
        calculationDuration: Date.now() - startTime,
      }
    }

    // Process users in batches to avoid memory issues
    const batchSize = 1000
    const allRQMScores = []
    const allTrophyScores = []
    let processedCount = 0

    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          activeUsers.length / batchSize,
        )}`,
      )

      // Calculate RQM for each user in batch
      const batchPromises = batch.map(async user => {
        const userRQM = await calculateUserRQM(user._id)
        const userTrophies = user.quickClashTrophies || 1000

        return {
          userId: user._id,
          rqm: userRQM,
          trophies: userTrophies,
        }
      })

      const batchResults = await Promise.all(batchPromises)

      // Filter and collect scores
      batchResults.forEach(result => {
        if (result.rqm > 0) {
          allRQMScores.push(result.rqm)
        }
        allTrophyScores.push(result.trophies)
      })

      processedCount += batch.length
      console.log(`Processed ${processedCount}/${activeUsers.length} users`)
    }

    // Calculate RQM statistics
    allRQMScores.sort((a, b) => a - b)
    allTrophyScores.sort((a, b) => a - b)

    const rqmStats = calculateStatsFromArray(allRQMScores)
    const trophyStats = calculateStatsFromArray(allTrophyScores)

    const globalStats = {
      rqmStats: {
        globalAverage: rqmStats.average,
        highestAverage: rqmStats.highest,
        medianRQM: rqmStats.median,
        totalPlayersWithRQM: allRQMScores.length,
        percentiles: rqmStats.percentiles,
      },
      trophyStats: {
        averageTrophies: trophyStats.average,
        highestTrophies: trophyStats.highest,
        totalPlayers: allTrophyScores.length,
      },
      calculationDuration: Date.now() - startTime,
    }

    console.log(
      `Global RQM calculation completed in ${globalStats.calculationDuration}ms`,
    )
    console.log(
      `RQM Stats - Avg: ${rqmStats.average}, High: ${rqmStats.highest}, Players: ${allRQMScores.length}`,
    )

    return globalStats
  } catch (error) {
    console.error('Error calculating global RQM stats:', error)
    throw error
  }
}

/**
 * Calculate statistics from a sorted array
 * @param {number[]} sortedArray - Sorted array of numbers
 * @returns {Object} Statistics object
 */
const calculateStatsFromArray = sortedArray => {
  if (sortedArray.length === 0) {
    return {
      average: 0,
      median: 0,
      highest: 0,
      percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 },
    }
  }

  const sum = sortedArray.reduce((acc, val) => acc + val, 0)
  const average = Math.round(sum / sortedArray.length)
  const median = getPercentile(sortedArray, 50)
  const highest = sortedArray[sortedArray.length - 1]

  const percentiles = {
    p10: getPercentile(sortedArray, 10),
    p25: getPercentile(sortedArray, 25),
    p50: median,
    p75: getPercentile(sortedArray, 75),
    p90: getPercentile(sortedArray, 90),
    p95: getPercentile(sortedArray, 95),
    p99: getPercentile(sortedArray, 99),
  }

  return { average, median, highest, percentiles }
}

/**
 * Get percentile value from sorted array
 * @param {number[]} sortedArray - Sorted array
 * @param {number} percentile - Percentile (0-100)
 * @returns {number} Percentile value
 */
const getPercentile = (sortedArray, percentile) => {
  if (sortedArray.length === 0) return 0

  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))]
}

/**
 * Calculate user's percentile ranking
 * @param {number} userRQM - User's RQM score
 * @param {Object} percentiles - Global percentiles object
 * @returns {number} User's percentile (0-100)
 */
const calculateUserPercentile = (userRQM, percentiles) => {
  if (userRQM === 0) return 0

  if (userRQM >= percentiles.p99) return 99
  if (userRQM >= percentiles.p95) return 95
  if (userRQM >= percentiles.p90) return 90
  if (userRQM >= percentiles.p75) return 75
  if (userRQM >= percentiles.p50) return 50
  if (userRQM >= percentiles.p25) return 25
  if (userRQM >= percentiles.p10) return 10
  return Math.max(1, Math.round((userRQM / percentiles.p10) * 10))
}

/**
 * Update global RQM statistics in database
 * @returns {Promise<Object>} Updated statistics
 */
const updateGlobalRQMStats = async () => {
  try {
    const globalStats = await calculateGlobalRQMStats()

    // Update database
    const updatedStats = await GlobalQuickClashStats.findOneAndUpdate(
      { statsType: 'global_rqm' },
      {
        statsType: 'global_rqm',
        ...globalStats,
        lastUpdated: new Date(),
        dataSource: 'background_task',
        version: 1,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    )

    // Clear memory cache to force refresh
    cache.del('global_rqm_stats')
    console.log('Cleared memory cache for global RQM stats')

    return updatedStats
  } catch (error) {
    console.error('Error updating global RQM stats:', error)
    throw error
  }
}

/**
 * Get cached global RQM statistics
 * @returns {Promise<Object>} Cached or fresh statistics
 */
const getCachedGlobalRQMStats = async () => {
  const cacheKey = 'global_rqm_stats'

  try {
    // Try memory cache first (5-minute expiry)
    const cachedStats = cache.get(cacheKey)
    if (cachedStats) {
      console.log('Serving global RQM stats from memory cache')
      return cachedStats
    }

    // Fall back to database
    console.log('Serving global RQM stats from database')
    const dbStats = await GlobalQuickClashStats.findOne({
      statsType: 'global_rqm',
    }).lean()

    if (dbStats) {
      // Cache in memory for 5 minutes (300000 ms)
      cache.put(cacheKey, dbStats, 300000)
      return dbStats
    }

    // If no data exists, return defaults
    console.log('No global RQM stats found, returning defaults')
    const defaultStats = {
      rqmStats: {
        globalAverage: 0,
        highestAverage: 0,
        medianRQM: 0,
        totalPlayersWithRQM: 0,
        percentiles: {
          p10: 0,
          p25: 0,
          p50: 0,
          p75: 0,
          p90: 0,
          p95: 0,
          p99: 0,
        },
      },
      trophyStats: {
        averageTrophies: 1000,
        highestTrophies: 1000,
        totalPlayers: 0,
      },
      lastUpdated: new Date(),
    }

    // Cache defaults for 1 minute to prevent repeated database calls
    cache.put(cacheKey, defaultStats, 60000)
    return defaultStats
  } catch (error) {
    console.error('Error getting cached global RQM stats:', error)
    throw error
  }
}

module.exports = {
  calculateUserRQM,
  calculateGlobalRQMStats,
  updateGlobalRQMStats,
  getCachedGlobalRQMStats,
  calculateUserPercentile,
}
