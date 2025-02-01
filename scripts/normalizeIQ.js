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

    // Find specified users
    const userInGameNames = ['kavyansh_mittal', 'saransh_1234', 'Nikhil']
    const users = await User.find({
      inGameName: { $in: userInGameNames },
    })
    for (let user of users) {
      if (user.inGameName === 'kavyansh_mittal') {
        user.IQ_score = 97
        user.userScore = 1043.75
        user.baseUserScore = 1043.75
      } else {
        user.IQ_score = 110
        user.userScore = 1125
        user.baseUserScore = 1125
      }

      await user.save()
    }
    const userIds = users.map(user => user._id)

    // Get today's quiz attempts for these users
    const attempts = await QuizAttempt.find({
      user: { $in: userIds },
      createdAt: {
        $gte: today,
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
  } finally {
    await mongoose.disconnect()
  }
}

normalizeIQ()
