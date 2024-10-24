const User = require('../model/userSchema')
const {
  handleSocietyOrCircleUpgrade,
} = require('../utils/dailyUserIQCalc.utils')
const {
  getScoreStatistics,
  updateSingleUserScore,
} = require('../utils/memoryCache.utils')

const calculateRealTimeIQ = async (userId, newUserScore, session) => {
  const { meanScore, standardDeviation } = await getScoreStatistics()

  // Calculate new IQ score
  const normalizedScore = (newUserScore - meanScore) / standardDeviation
  const newIQScore = (100 + 15 * normalizedScore).toFixed(1)

  // Fetch current user
  const user = await User.findById(userId).session(session)
  const prevIQScore = user.IQ_score
  const awardableXpOrNot = newIQScore > user.maxIQScore
  const previousIQForXp = user.maxIQScore

  // Update user's IQ score
  if (user.role !== 'guest') {
    user.IQ_score = newIQScore
    user.maxIQScore = Math.max(user.maxIQScore, newIQScore)
    user.prevIQScore = prevIQScore
  }
  await user.save({ session })

  // Update the cache with the new user score
  await updateSingleUserScore(userId, newUserScore)
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
          newIQScore,
          previousIQForXp,
          awardableXpOrNot,
          session,
        )
  return {
    newIQScore,
    prevIQScore,
    awardableXpOrNot,
    previousIQForXp,
    ...upgradeResult,
  }
}

module.exports = { calculateRealTimeIQ }
