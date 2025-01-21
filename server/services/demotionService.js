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
  return 10
}

// Process user demotion
const processUserDemotion = async ({ user }) => {
  const prevIQScore = user.IQ_score
  const prevUserScore = user.userScore
  const newIQScore = demoteIQ(prevIQScore)
  const newUserScore = DISTRIBUTION.iqToScore(newIQScore)

  // Send notification to user
  const notification = new ApplicationUpdates({
    userId: user._id,
    title: 'Monthly Leaderboard Refresh',
    mainText: `Your IQ score has been adjusted from ${prevIQScore} to ${newIQScore} as part of our monthly refresh.`,
    type: 'demotion',
  })

  return {
    updates: {
      IQ_score: newIQScore,
      userScore: newUserScore,
      prevIQScore,
      baseUserScore: newUserScore,
    },
    notification,
  }
}

// Retryable user update function
const updateUserWithDemotion = makeRetryable(
  async ({ user, updates, notification }) => {
    const session = await User.startSession()
    try {
      await session.withTransaction(async () => {
        await User.findByIdAndUpdate(user._id, { $set: updates }, { session })
        if (notification) {
          await notification.save({ session })
        }
      })
    } finally {
      await session.endSession()
    }
  },
  {
    maxRetries: 3,
    backoffFactor: 2,
    operationName: 'UpdateUserDemotion',
  },
)

// Main demotion service function
const executeMonthlyDemotion = makeRetryable(
  async ({ batchSize = 100 } = {}) => {
    let processedCount = 0
    let cursor = User.find({ IQ_score: { $gt: 0 } }).cursor()

    for (
      let user = await cursor.next();
      user != null;
      user = await cursor.next()
    ) {
      try {
        const { updates, notification } = await processUserDemotion({
          user,
        })
        await updateUserWithDemotion({ user, updates, notification })
        processedCount++

        // Log progress every batchSize users
        if (processedCount % batchSize === 0) {
          console.log(`Processed ${processedCount} users`)
        }
      } catch (error) {
        console.error(`Failed to process demotion for user ${user._id}:`, error)
        // Continue processing other users even if one fails
      }
    }

    return { processedCount }
  },
  {
    maxRetries: 5,
    backoffFactor: 2,
    operationName: 'ExecuteMonthlyDemotion',
  },
)

module.exports = {
  executeMonthlyDemotion,
}
