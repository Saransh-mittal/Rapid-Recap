const User = require('../model/userSchema')
const {
  handleSocietyOrCircleUpgrade,
} = require('../utils/dailyUserIQCalc.utils')
const {
  getScoreStatistics,
  updateSingleUserScore,
} = require('../utils/memoryCache.utils')
const { makeRetryable } = require('../utils/retryUtils')

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

// Base function implementation
const calculateTournamentRankIQBoostBase = async (
  user,
  rank,
  tournamentId,
  tournamentNumber,
) => {
  try {
    // Get global statistics for IQ calculation
    const { meanScore, standardDeviation } = await getScoreStatistics()

    // Get user
    if (!user || user.role === 'guest') {
      return null
    }

    const prevIQScore = user.IQ_score

    // Define IQ boost based on rank
    let targetIQIncrease = 0
    switch (rank) {
      case 1:
        targetIQIncrease = 5
        break
      case 2:
        targetIQIncrease = 3
        break
      case 3:
        targetIQIncrease = 2
        break
      default:
        return null
    }

    // Calculate required score increase to achieve target IQ boost
    const currentNormalizedScore =
      (user.userScore - meanScore) / standardDeviation
    const currentBaseIQ = 100 + 15 * currentNormalizedScore
    const targetIQ = currentBaseIQ + targetIQIncrease

    // Calculate required user score for target IQ
    const requiredNormalizedScore = (targetIQ - 100) / 15
    const requiredUserScore =
      requiredNormalizedScore * standardDeviation + meanScore
    const scoreIncrease = requiredUserScore - user.userScore

    // Update user scores immediately
    user.userScore += scoreIncrease
    user.baseUserScore += scoreIncrease
    user.prevIQScore = prevIQScore
    user.IQ_score = targetIQ.toFixed(1)
    user.maxIQScore = Math.max(user.maxIQScore, targetIQ)

    // Store the IQ boost record for history
    const boostRecord = {
      tournament: tournamentId,
      tournamentNumber,
      rank,
      prevIQ: prevIQScore,
      boostedIQ: targetIQ.toFixed(1),
      boost: targetIQIncrease,
    }

    user.tournamentIQBoosts.push(boostRecord)

    // Handle society/circle upgrades
    const upgradeResult = await handleSocietyOrCircleUpgrade(
      user._id,
      prevIQScore,
      targetIQ,
      user.maxIQScore,
      true,
    )

    await user.save()

    // // Update cache
    await updateSingleUserScore(user._id, user.userScore)

    return {
      boostId: user.tournamentIQBoosts[user.tournamentIQBoosts.length - 1]._id,
      prevIQScore,
      newIQScore: targetIQ.toFixed(1),
      boost: targetIQIncrease,
      ...upgradeResult,
    }
  } catch (error) {
    console.error('Error applying tournament rank IQ boost:', error)
    throw error
  }
}

// Make functions retryable with specific configurations
const calculateTournamentRankIQBoost = makeRetryable(
  calculateTournamentRankIQBoostBase,
  {
    operationName: 'CalculateTournamentRankIQBoost',
    maxRetries: 3,
    onRetry: (error, attempt) => {
      console.warn(
        `Retrying IQ boost calculation, attempt ${attempt}. Error: ${error.message}`,
      )
    },
    // Custom error classifier for this specific operation
    isRetryable: error => {
      if (error.message.includes('Transaction')) return true
      if (error.name === 'MongoError') return true
      return defaultIsRetryableError(error)
    },
  },
)

module.exports = {
  calculateRealTimeIQ,
  calculateTournamentRankIQBoost,
}
