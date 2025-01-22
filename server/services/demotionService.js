const { makeRetryable } = require('../utils/retryUtils')
const User = require('../model/userSchema')
const _ = require('lodash')
const { calculateDistribution } = require('../utils/demotion.utils')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')

// Initialize distribution with default min score
const DISTRIBUTION = calculateDistribution(500)

// Core demotion logic
const demoteIQ = currentIQ => {
  // Titans & Mavericks → Elites (110 IQ)
  if (currentIQ >= 130) return 110
  // Elites → Strivers - Achievers Circle (97 IQ)
  if (currentIQ >= 110 && currentIQ < 130) return 97
  // Current Strivers → Lowest Strivers (90 IQ)
  if (currentIQ >= 90 && currentIQ < 110) return 90
  // Explorers → IQ 10
  if (currentIQ < 90 && currentIQ >= 10) return 10

  return 0
}

// Process user demotion
const processUserDemotion = async ({ user, session }) => {
  // Add retry logic for transient transaction errors
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      const prevIQScore = user.IQ_score
      const prevUserScore = user.userScore
      const newIQScore = demoteIQ(prevIQScore)
      const newUserScore =
        newIQScore === 0 ? 0 : DISTRIBUTION.iqToScore(newIQScore)

      // Create notification
      const notification = new ApplicationUpdates({
        userId: user._id,
        title: 'Monthly Leaderboard Refresh',
        mainText: `Your IQ score has been adjusted from ${prevIQScore} to ${newIQScore} as part of our monthly refresh.`,
        type: 'demotion',
      })

      // Save notification within the transaction
      await notification.save({ session })

      // Update user
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            IQ_score: newIQScore,
            userScore: newUserScore,
            prevIQScore: newIQScore,
            baseUserScore: newUserScore,
            avgRQM: 0,
          },
        },
        { session },
      )

      return { prevIQScore, newIQScore }
    } catch (error) {
      attempt++
      if (
        error.errorLabels?.includes('TransientTransactionError') &&
        attempt < maxRetries
      ) {
        console.log(
          `Retrying transaction for user ${user._id}, attempt ${attempt + 1}`,
        )
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        continue
      }
      throw error
    }
  }
}

// Main demotion service function
const executeMonthlyDemotion = makeRetryable(
  async ({ batchSize = 100 } = {}) => {
    let processedCount = 0
    let errors = []

    try {
      // Get total count of eligible users
      const totalUsers = await User.countDocuments()

      // Process users in batches - SINGLE LOOP
      for (let skip = 0; skip < totalUsers; skip += batchSize) {
        const session = await User.startSession()

        try {
          await session.withTransaction(
            async () => {
              // Get batch of users
              const users = await User.find()
                .skip(skip)
                .limit(batchSize)
                .session(session)
                .lean()

              // Process users sequentially to avoid transaction conflicts
              for (const user of users) {
                try {
                  const result = await processUserDemotion({
                    user,
                    session,
                  })
                  processedCount++

                  if (processedCount % 100 === 0) {
                    console.log(
                      `Processed demotion for ${processedCount} users`,
                    )
                    console.log(
                      `Sample demotion: ${result.prevIQScore} -> ${result.newIQScore}`,
                    )
                  }
                } catch (error) {
                  console.error(
                    `Failed to process demotion for user ${user._id}:`,
                    error,
                  )
                  errors.push({ userId: user._id, error: error.message })
                }
              }
            },
            {
              maxCommitTimeMS: 60000,
              readPreference: 'primary',
              readConcern: { level: 'majority' },
              writeConcern: { w: 'majority' },
            },
          )
        } catch (error) {
          console.error(`Failed to process batch starting at ${skip}:`, error)
          errors.push({ batchStart: skip, error: error.message })
        } finally {
          await session.endSession()
        }
      }

      return {
        processedCount,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      console.error('Fatal error in executeMonthlyDemotion:', error)
      throw error
    }
  },
  {
    maxRetries: 5,
    backoffFactor: 2,
    operationName: 'ExecuteMonthlyDemotion',
  },
)

const calculateRanksAfterDemotion = makeRetryable(
  async ({ batchSize = 100 } = {}) => {
    let processedCount = 0
    let errors = []

    try {
      const session = await User.startSession()

      try {
        await session.withTransaction(
          async () => {
            // Get all users sorted by IQ score, avgRQM, and xp
            const rankedUsers = await User.find()
              .sort({ IQ_score: -1, avgRQM: -1, xp: -1 })
              .select('_id IQ_score avgRQM xp')
              .session(session)
              .lean()

            console.log(`Calculating ranks for ${rankedUsers.length} users...`)

            // Create rank mapping with proper handling of ties
            const rankMap = new Map()
            let currentRank = 1
            let previousUser = null

            rankedUsers.forEach((user, index) => {
              if (previousUser) {
                // Check if current user has same scores as previous user
                const sameTier =
                  user.IQ_score === previousUser.IQ_score &&
                  user.avgRQM === previousUser.avgRQM &&
                  user.xp === previousUser.xp

                // Only increment rank if there's any difference in the hierarchy
                if (!sameTier) {
                  currentRank = index + 1
                }
              }

              rankMap.set(user._id.toString(), currentRank)
              previousUser = user
            })

            // Update ranks in batches
            const userIds = Array.from(rankMap.keys())

            for (let i = 0; i < userIds.length; i += batchSize) {
              const batch = userIds.slice(i, i + batchSize)
              const bulkOps = batch.map(userId => ({
                updateOne: {
                  filter: { _id: userId },
                  update: { $set: { rank: rankMap.get(userId) } },
                },
              }))

              await User.bulkWrite(bulkOps, { session })
              processedCount += batch.length

              console.log(`Updated ranks for ${processedCount} users`)
            }
          },
          {
            maxCommitTimeMS: 60000,
            readPreference: 'primary',
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' },
          },
        )
      } catch (error) {
        console.error('Failed to process rank updates:', error)
        errors.push({ error: error.message })
        throw error
      } finally {
        await session.endSession()
      }

      return {
        processedCount,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      console.error('Fatal error in calculateRanksAfterDemotion:', error)
      throw error
    }
  },
  {
    maxRetries: 5,
    backoffFactor: 2,
    operationName: 'CalculateRanksAfterDemotion',
  },
)

module.exports = {
  executeMonthlyDemotion,
  calculateRanksAfterDemotion,
}
