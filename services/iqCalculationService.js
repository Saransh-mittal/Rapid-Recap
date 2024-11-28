const User = require('../model/userSchema')
const {
  handleSocietyOrCircleUpgrade,
} = require('../utils/dailyUserIQCalc.utils')
const {
  getScoreStatistics,
  updateSingleUserScore,
} = require('../utils/memoryCache.utils')

// New utility function to calculate IQ boost based on RQM score
const calculateIQBoostMultiplier = (RQM_score, user, iqIncrement) => {
  if (iqIncrement === 0) {
    return 1
  }
  // No boost if user needs onboarding
  if (user?.needsOnboarding) {
    return 1
  }

  let multiplier
  if (RQM_score >= 100) multiplier = 5
  else if (RQM_score >= 76) multiplier = 4
  else if (RQM_score >= 51) multiplier = 2
  else multiplier = 1

  return multiplier
}

// Modified calculateRealTimeIQ function
const calculateRealTimeIQ = async (
  userId,
  newUserScore,
  RQM_score,
  session,
) => {
  // Get global statistics
  const { meanScore, standardDeviation } = await getScoreStatistics()

  // Calculate new IQ score
  const normalizedScore = (newUserScore - meanScore) / standardDeviation
  const newIQScore = (100 + 15 * normalizedScore).toFixed(1)

  // Fetch current user
  const user = await User.findById(userId).session(session)
  const prevIQScore = user.IQ_score

  // Calculate IQ increment
  const iqIncrement = parseFloat(newIQScore) - parseFloat(prevIQScore)

  // Apply boost multiplier
  const boostMultiplier = calculateIQBoostMultiplier(
    RQM_score,
    user,
    iqIncrement,
  )
  const boostedIncrement = iqIncrement * boostMultiplier

  // Calculate final IQ score
  const finalIQScore = (parseFloat(prevIQScore) + boostedIncrement).toFixed(1)

  // Calculate required raw score and additional score needed
  const requiredRawScore =
    ((parseFloat(finalIQScore) - 100) / 15) * standardDeviation + meanScore
  const additionalScore = requiredRawScore - user.userScore

  // Check if XP is awardable
  const awardableXpOrNot = finalIQScore > user.maxIQScore
  const previousIQForXp = user.maxIQScore

  // Update user's scores
  if (user.role !== 'guest') {
    user.IQ_score = finalIQScore
    user.maxIQScore = Math.max(user.maxIQScore, finalIQScore)
    user.prevIQScore = prevIQScore
    user.userScore += additionalScore
    user.baseUserScore += additionalScore

    await user.save({ session })

    // Update cache
    await updateSingleUserScore(userId, user.userScore)
  }

  // Handle society/circle upgrades
  const upgradeResult =
    user.role === 'guest'
      ? {
          societyUpgradeMessage: '',
          hasSocietyOrCircleChanged: false,
          changedSocietyOrCircle: false,
          isUpgrade: false,
          newSociety: '',
          newCircle: '',
        }
      : await handleSocietyOrCircleUpgrade(
          userId,
          prevIQScore,
          finalIQScore,
          previousIQForXp,
          awardableXpOrNot,
          session,
        )

  const result = {
    newIQScore: finalIQScore,
    prevIQScore,
    awardableXpOrNot,
    previousIQForXp,
    boostMultiplier,
    originalIncrement: iqIncrement,
    boostedIncrement,
    additionalScore,
    globalMeanUserScore: meanScore,
    globalStandardDeviation: standardDeviation,
    finalUserScore: user.userScore,
    ...upgradeResult,
  }

  return result
}

module.exports = { calculateRealTimeIQ }
