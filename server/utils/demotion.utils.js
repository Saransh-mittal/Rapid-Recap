// Utility functions for demotion calculations

// Convert IQ to Z-score
const iqToZScore = iq => (iq - 100) / 15

// Calculate distribution parameters
const calculateDistribution = (minScore = 500) => {
  // Get z-scores for target IQs
  const z10 = iqToZScore(10) // For IQ 10 (lowest active)
  const z90 = iqToZScore(90) // For IQ 90 (strivers)

  // Calculate SD and mean that ensures proper mapping
  const sd = minScore / (z90 - z10)
  const mean = minScore - z10 * sd

  return {
    mean,
    standardDeviation: sd,
    zScoreToScore: z => mean + z * sd,
    iqToScore: iq => mean + iqToZScore(iq) * sd,
    scoreToIQ: score => 100 + ((score - mean) / sd) * 15,
  }
}

// Calculate statistics for a group of users
const calculateDemotionStats = users => {
  const meanUserScore = _.meanBy(users, 'userScore')
  const userScoreVariance = _.meanBy(users, u =>
    Math.pow(u.userScore - meanUserScore, 2),
  )

  return {
    count: users.length,
    userScore: {
      mean: meanUserScore,
      highest: _.maxBy(users, 'userScore')?.userScore,
      lowest: _.minBy(users, 'userScore')?.userScore,
      standardDeviation: Math.sqrt(userScoreVariance),
    },
    IQ_score: {
      mean: _.meanBy(users, 'IQ_score'),
      highest: _.maxBy(users, 'IQ_score')?.IQ_score,
      lowest: _.minBy(users, 'IQ_score')?.IQ_score,
    },
    demotion: {
      averageIQDrop: _.meanBy(users, u => u.prevIQScore - u.IQ_score),
      averageScoreDrop: _.meanBy(users, u => u.prevUserScore - u.userScore),
    },
  }
}

module.exports = {
  calculateDistribution,
  calculateDemotionStats,
  iqToZScore,
}
