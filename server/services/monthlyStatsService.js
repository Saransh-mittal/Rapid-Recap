const MonthlyStats = require('../model/monthlyStatsSchema')
const User = require('../model/userSchema')
const { makeRetryable } = require('../utils/retryUtils')
const {
  calculateUserMonthlyStats,
  calculateMonthlyRanks,
} = require('./statsCalculationService')
const moment = require('moment-timezone')

// Save monthly stats for all users
const saveMonthlyStats = makeRetryable(
  async ({
    month = moment().month() + 1,
    year = moment().year(),
    batchSize = 100,
  } = {}) => {
    const session = await MonthlyStats.startSession()
    let processedCount = 0
    let errors = []

    try {
      await session.withTransaction(async () => {
        // First calculate all ranks
        const rankMap = await calculateMonthlyRanks({ month, year, session })

        // Process users in batches
        const cursor = User.find().cursor()

        for (
          let user = await cursor.next();
          user != null;
          user = await cursor.next()
        ) {
          try {
            // Calculate stats for user
            const stats = await calculateUserMonthlyStats({
              userId: user._id,
              month,
              year,
              session,
            })

            // Add rank from rankMap
            stats.finalRank = rankMap.get(user._id.toString())

            // Save stats
            await MonthlyStats.create([stats], { session })
            processedCount++

            if (processedCount % batchSize === 0) {
              console.log(`Processed monthly stats for ${processedCount} users`)
            }
          } catch (error) {
            console.error(
              `Error processing monthly stats for user ${user._id}:`,
              error,
            )
            errors.push({ userId: user._id, error: error.message })
          }
        }
      })

      return { processedCount, errors }
    } finally {
      session.endSession()
    }
  },
  {
    maxRetries: 3,
    backoffFactor: 2,
    operationName: 'SaveMonthlyStats',
  },
)

// Get leaderboard for a specific month
const getMonthlyLeaderboard = makeRetryable(
  async ({ month, year, page = 1, limit = 100, includeModalStats = false }) => {
    const skip = (page - 1) * limit

    const pipeline = [
      { $match: { month, year } },
      { $sort: { finalRank: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]

    // If modal stats aren't needed, exclude them
    if (!includeModalStats) {
      pipeline.push({
        $project: {
          finalRank: 1,
          displayName: 1,
          profilePicture: 1,
          'iqScore.final': 1,
          'rqmScore.average': 1,
          'quizStats.total': 1,
        },
      })
    }

    const leaderboard = await MonthlyStats.aggregate(pipeline)
    const total = await MonthlyStats.countDocuments({ month, year })

    return {
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
)

// Get monthly stats for a user
const getUserMonthlyStats = async ({ userId, year, month }) => {
  return await MonthlyStats.findOne({ user: userId, year, month })
}

// Get historical stats for a user
const getUserHistoricalStats = async ({ userId, limit = 12 }) => {
  return await MonthlyStats.find({ user: userId })
    .sort({ year: -1, month: -1 })
    .limit(limit)
}

module.exports = {
  saveMonthlyStats,
  getMonthlyLeaderboard,
  getUserMonthlyStats,
  getUserHistoricalStats,
}
