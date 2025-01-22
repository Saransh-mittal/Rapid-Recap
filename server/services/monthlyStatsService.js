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
    let processedCount = 0
    let errors = []

    try {
      // Calculate all ranks first, outside of user processing transaction
      const session = await MonthlyStats.startSession()
      const rankMap = await calculateMonthlyRanks({ month, year, session })
      session.endSession()

      // Get total count of users for progress tracking
      const totalUsers = await User.countDocuments()

      // Process users in smaller batches with separate transactions
      for (let skip = 0; skip < totalUsers; skip += batchSize) {
        const batchSession = await MonthlyStats.startSession()

        try {
          await batchSession.withTransaction(async () => {
            const users = await User.find()
              .skip(skip)
              .limit(batchSize)
              .session(batchSession)
              .lean()

            for (const user of users) {
              try {
                // Calculate stats for user
                const stats = await calculateUserMonthlyStats({
                  userId: user._id,
                  month,
                  year,
                  session: batchSession,
                })

                // Add rank from rankMap
                stats.finalRank = rankMap.get(user._id.toString())

                // Save stats
                await MonthlyStats.create([stats], { session: batchSession })
                processedCount++

                if (processedCount % 100 === 0) {
                  console.log(
                    `Processed monthly stats for ${processedCount} users`,
                  )
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
        } finally {
          batchSession.endSession()
        }
      }

      return { processedCount, errors }
    } catch (error) {
      console.error('Error in saveMonthlyStats:', error)
      throw error
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
