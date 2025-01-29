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
      // Add logging to track execution
      console.log(`Starting monthly stats calculation for ${month}/${year}`)

      // Calculate ranks first
      const rankSession = await MonthlyStats.startSession()
      let rankMap
      try {
        // Wrap rank calculation in its own transaction
        await rankSession.withTransaction(async () => {
          console.log('Calculating monthly ranks...')
          rankMap = await calculateMonthlyRanks({
            month,
            year,
            session: rankSession,
          })
        })
      } finally {
        rankSession.endSession()
      }

      const totalUsers = await User.countDocuments()
      console.log(`Processing ${totalUsers} users in batches of ${batchSize}`)

      // Process users in batches
      for (let skip = 0; skip < totalUsers; skip += batchSize) {
        const batchSession = await MonthlyStats.startSession()

        try {
          await batchSession.withTransaction(
            async () => {
              // Add transaction options
              const users = await User.find()
                .skip(skip)
                .limit(batchSize)
                .session(batchSession)
                .lean()
                .exec() // Add exec() to ensure proper promise resolution

              console.log(`Processing batch of ${users.length} users`)

              for (const user of users) {
                try {
                  const stats = await calculateUserMonthlyStats({
                    userId: user._id,
                    month,
                    year,
                    session: batchSession,
                  })

                  if (!stats) {
                    throw new Error('Failed to calculate user stats')
                  }

                  stats.finalRank = rankMap.get(user._id.toString())

                  // Explicitly check if stats exist before creation
                  if (!stats.finalRank) {
                    console.warn(`No rank found for user ${user._id}`)
                  }

                  await MonthlyStats.create([stats], { session: batchSession })
                  processedCount++

                  if (processedCount % 100 === 0) {
                    console.log(
                      `Progress: ${processedCount}/${totalUsers} users processed`,
                    )
                  }
                } catch (error) {
                  console.error(
                    `Error processing user ${user._id}:`,
                    error.message,
                    error.stack,
                  )
                  errors.push({ userId: user._id, error: error.message })
                }
              }
            },
            {
              // Add transaction options for better error handling
              readConcern: { level: 'majority' },
              writeConcern: { w: 'majority' },
              maxCommitTimeMS: 60000,
            },
          )
        } catch (error) {
          console.error(`Batch transaction failed:`, error)
          throw error
        } finally {
          await batchSession.endSession()
        }
      }

      return { processedCount, errors }
    } catch (error) {
      console.error('Fatal error in saveMonthlyStats:', error)
      throw error
    }
  },
  {
    maxRetries: 3,
    backoffFactor: 2,
    operationName: 'SaveMonthlyStats',
    // Add custom retry logic for transaction errors
    isRetryable: error => {
      return (
        error.errorLabels?.includes('TransientTransactionError') ||
        error.name === 'MongoNetworkError' ||
        error.message.includes('Transaction has been aborted')
      )
    },
  },
)

// Modified getMonthlyLeaderboard to only fetch top 10
const getMonthlyLeaderboard = makeRetryable(
  async ({ month, year, includeModalStats = false }) => {
    const pipeline = [
      { $match: { month, year } },
      { $sort: { finalRank: 1 } },
      { $limit: 10 }, // Only fetch top 10
    ]

    if (!includeModalStats) {
      pipeline.push({
        $project: {
          finalRank: 1,
          displayName: 1,
          profilePicture: 1,
          'iqScore.final': 1,
          'rqmScore.average': 1,
          'quizStats.total': 1,
          username: 1,
          society: 1,
          circle: 1,
        },
      })
    }

    const leaderboard = await MonthlyStats.aggregate(pipeline)
    return { leaderboard }
  },
)

// Get available leaderboard months
const getAvailableLeaderboardMonths = makeRetryable(async () => {
  const availableMonths = await MonthlyStats.aggregate([
    {
      $group: {
        _id: { year: '$year', month: '$month' },
        hasData: { $sum: 1 },
      },
    },
    {
      $match: { hasData: { $gt: 0 } },
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 },
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        _id: 0,
      },
    },
  ])

  return availableMonths
})

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
  getAvailableLeaderboardMonths,
}
