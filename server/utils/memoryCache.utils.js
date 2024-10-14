const cache = require('memory-cache')
const User = require('../model/userSchema')
const CACHE_KEY = 'user_scores'
const STATS_KEY = 'user_scores_stats'
const CACHE_EXPIRY = 3600000 // 1 hour in milliseconds

const updateUserScoreCache = async () => {
  const users = await User.find(
    { role: { $ne: 'guest' }, IQ_score: { $gt: 0 } },
    'userScore',
  )
  const userScores = {}
  let sumOfScores = 0

  users.forEach(user => {
    const userId = user._id.toString()
    const score = user.userScore
    userScores[userId] = score
    sumOfScores += score
  })
  cache.put(CACHE_KEY, userScores, CACHE_EXPIRY)

  // Calculate and cache statistics
  const userCount = users.length
  const meanScore = sumOfScores / userCount
  const sumOfSquares = Object.values(userScores).reduce(
    (sum, score) => sum + Math.pow(score - meanScore, 2),
    0,
  )
  const standardDeviation = Math.sqrt(sumOfSquares / userCount)

  const stats = { meanScore, standardDeviation, userCount }
  cache.put(STATS_KEY, stats, CACHE_EXPIRY)
}

const getUserScoresFromCache = async () => {
  let cachedScores = cache.get(CACHE_KEY)
  if (!cachedScores) {
    await updateUserScoreCache()
    cachedScores = cache.get(CACHE_KEY)
  }
  return cachedScores
}

const getScoreStatistics = async () => {
  let stats = cache.get(STATS_KEY)
  if (!stats) {
    await updateUserScoreCache()
    stats = cache.get(STATS_KEY)
  }
  return stats
}

const updateSingleUserScore = async (userId, newScore) => {
  const cachedScores = await getUserScoresFromCache()
  const oldScore = cachedScores[userId] || 0
  cachedScores[userId] = newScore
  cache.put(CACHE_KEY, cachedScores, CACHE_EXPIRY)

  // Recalculate statistics
  const stats = await getScoreStatistics()
  const { meanScore, standardDeviation, userCount } = stats

  const newSum = meanScore * userCount - oldScore + newScore
  const newMean = newSum / userCount

  const oldDiffSquared = Math.pow(oldScore - meanScore, 2)
  const newDiffSquared = Math.pow(newScore - newMean, 2)
  const newSumOfSquares =
    Math.pow(standardDeviation, 2) * userCount - oldDiffSquared + newDiffSquared
  const newStandardDeviation = Math.sqrt(newSumOfSquares / userCount)

  const newStats = {
    meanScore: newMean,
    standardDeviation: newStandardDeviation,
    userCount,
  }
  cache.put(STATS_KEY, newStats, CACHE_EXPIRY)
}

module.exports = {
  updateUserScoreCache,
  getUserScoresFromCache,
  getScoreStatistics,
  updateSingleUserScore,
}
