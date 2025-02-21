// services/abilityServices/timeDilationService.js

const Ability = require('../../model/abilitySchema')
const QuizAttempt = require('../../model/quizAttemptSchema')
const moment = require('moment-timezone')
const createTimeDilation = async ({
  userId,
  session,
  quantity = 1,
  duration = null,
  additionalTime = 30,
  expiresAt,
  isClaimed = false,
  isActive = false,
  description = 'Adds 30 seconds to your quiz time while maintaining scoring scale',
  isBadgePowerUp = false,
}) => {
  try {
    // Create the ability
    const timeDilation = new Ability({
      user: userId,
      name: 'TimeDilation',
      description,
      type: 'POWER_UP',
      quantity,
      additionalTime,
      duration,
      expiresAt,
      claimed: isClaimed,
      isActive,
      isBadgePowerUp,
      stackable: false,
      icon: '/images/abilities/time-dilation.webp',
    })

    await timeDilation.save({ session })

    return timeDilation
  } catch (error) {
    console.error('Error creating Time Dilation ability:', error)
    throw error
  }
}

/**
 * Check if user qualifies for Time Dilation ability based on consecutive attempts
 * Awards ability if:
 * - The latest two consecutive quizzes had RQM >= 40
 * - These attempts haven't been used for previous Time Dilation awards
 */
const checkAndAwardTimeDilation = async ({ userId, session }) => {
  try {
    // Get today's start
    const todayStart = moment().startOf('day').toDate()

    // Get all today's attempts in chronological order
    const todayAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: todayStart },
    })
      .sort({ createdAt: 1 }) // Chronological order
      .session(session)

    // Need at least 2 attempts
    if (todayAttempts.length < 2) {
      return {
        awarded: false,
        reason: 'Not enough attempts today',
      }
    }

    // Get the latest two attempts
    const latestAttempt = todayAttempts[todayAttempts.length - 1]
    const previousAttempt = todayAttempts[todayAttempts.length - 2]

    // Check if both attempts are qualifying and unused
    const isQualifying =
      latestAttempt.RQM_score >= 40 &&
      previousAttempt.RQM_score >= 40 &&
      !latestAttempt.usedForTimeDilation &&
      !previousAttempt.usedForTimeDilation

    if (!isQualifying) {
      return {
        awarded: false,
        reason: "Latest consecutive attempts don't qualify",
      }
    }

    // Calculate expiry (2 days from now)
    const expiryDate = moment().add(2, 'days').toDate()

    // Create Time Dilation ability
    const timeDilation = await createTimeDilation({
      userId,
      session,
      quantity: 1,
      additionalTime: 30,
      description:
        'Adds 30 seconds to your quiz time while maintaining scoring scale',
      expiresAt: expiryDate,
      isClaimed: false,
      isActive: false,
    })

    // Mark these attempts as used for Time Dilation
    await QuizAttempt.updateMany(
      {
        _id: {
          $in: [latestAttempt._id, previousAttempt._id],
        },
      },
      {
        $set: { usedForTimeDilation: true },
      },
      { session },
    )

    return {
      awarded: true,
      ability: timeDilation,
      usedAttempts: [previousAttempt._id, latestAttempt._id],
    }
  } catch (error) {
    console.error('Error in checkAndAwardTimeDilation:', error)
    throw error
  }
}

module.exports = {
  createTimeDilation,
  checkAndAwardTimeDilation,
}
