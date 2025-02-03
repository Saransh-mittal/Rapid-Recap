const MonthlyStats = require('../model/monthlyStatsSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { calculateRealTimeIQ } = require('../services/iqCalculationService')
const mongoose = require('mongoose')

const normalizeIQ = async () => {
  try {
    // Get start and end of today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // Find specified users
    // const userInGameNames = ['Nikhil']
    const users = await User.find({
      // inGameName: { $in: userInGameNames },
      IQ_score: { $gt: 0 },
    })
    const monthlyUserStats = await MonthlyStats.find({})
    for (let user of monthlyUserStats) {
      const u = await User.findById(user.user)
      if (user.iqScore.final >= 130) {
        u.IQ_score = 110
        u.userScore = 1125
        u.baseUserScore = 1043.75
      } else if (user.iqScore.final >= 110 && user.iqScore.final < 130) {
        u.IQ_score = 97
        u.userScore = 1043.75
        u.baseUserScore = 1043.75
      } else if (user.iqScore.final >= 90 && user.iqScore.final < 110) {
        u.IQ_score = 90
        u.userScore = 750
        u.baseUserScore = 750
      } else if (user.iqScore.final >= 10 && user.iqScore.final < 90) {
        u.IQ_score = 10
        u.userScore = 500
        u.baseUserScore = 500
      }

      await u.save()
    }
    const userIds = users.map(user => user._id)

    // Get today's quiz attempts for these users
    const attempts = await QuizAttempt.find({
      user: { $in: userIds },
      createdAt: {
        $gte: yesterday,
        $lt: tomorrow,
      },
    })
      .sort({ createdAt: 1 })
      .populate('user')

    console.log('\nProcessing attempts in chronological order:')
    console.log('Total attempts found:', attempts.length)

    // Start a session for transactions
    const session = await mongoose.startSession()
    await session.withTransaction(async () => {
      // Process each attempt chronologically
      for (const [index, attempt] of attempts.entries()) {
        // Get current user state
        const user = await User.findById(attempt.user._id).session(session)
        const prevUserScore = user.userScore
        console.log(
          `\nAttempt ${
            index + 1
          } at ${attempt.createdAt.toLocaleTimeString()}:`,
        )
        console.log(`User: ${user.inGameName}`)
        console.log('Original values:', {
          prevIQ: attempt.prevIQScore,
          newIQ: attempt.newIQScore,
          increment: (attempt.newIQScore - attempt.prevIQScore).toFixed(2),
          RQM: attempt.RQM_score,
          userScore: attempt.newUserScore,
        })

        // Calculate new IQ values
        const result = await calculateRealTimeIQ(
          user._id,
          attempt.newUserScore,
          attempt.RQM_score,
          session,
        )

        // Calculate new increment
        const newIncrement = (result.newIQScore - user.IQ_score).toFixed(2)

        // Update the quiz attempt with new values
        attempt.prevIQScore = parseFloat(user.IQ_score)
        attempt.newIQScore = parseFloat(result.newIQScore)
        attempt.prevUserScore = prevUserScore
        attempt.newUserScore = result.finalUserScore
        attempt.globalMeanUserScore = result.globalMeanUserScore
        attempt.globalStandardDeviation = result.globalStandardDeviation

        await attempt.save({ session })

        console.log('Updated values:', {
          prevIQ: attempt.prevIQScore,
          newIQ: attempt.newIQScore,
          increment: newIncrement,
          boostMultiplier: result.boostMultiplier,
          userScore: result.finalUserScore.toFixed(2),
        })

        // Log time to next attempt if exists
        if (index < attempts.length - 1) {
          const nextAttempt = attempts[index + 1]
          const timeDiff = nextAttempt.createdAt - attempt.createdAt
          console.log(
            `Time to next attempt: ${(timeDiff / 1000).toFixed(2)} seconds`,
          )
        }
      }
    })

    session.endSession()
    console.log('\nNormalization complete')
  } catch (error) {
    console.error('Error in normalizeIQ:', error)
  }
}

normalizeIQ()
