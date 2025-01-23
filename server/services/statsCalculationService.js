const moment = require('moment-timezone')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { makeRetryable } = require('../utils/retryUtils')
const { CircleAndSocietyDataXP } = require('../data/CircleAndSocietyData')

function determineUserSocietyAndCircle(iqScore) {
  // Find the matching society/circle based on IQ score
  const userLevel = CircleAndSocietyDataXP.find(
    level =>
      iqScore >= level.IQ_Lower &&
      (level.IQ_Upper === null || iqScore < level.IQ_Upper),
  )

  if (!userLevel) {
    // Default to Explorers Society if no match found
    return {
      society: 'Explorers Society',
      circle: null,
    }
  }

  return {
    society: userLevel.society,
    circle: userLevel.circle,
  }
}

// Modified calculateUserMonthlyStats function
const calculateUserMonthlyStats = makeRetryable(
  async ({ userId, month, year, session }) => {
    const startDate = moment
      .utc({ year: year, month: month - 1 })
      .startOf('month')
    const endDate = moment.utc(startDate).endOf('month')

    // Get all quiz attempts for the month
    const monthlyQuizAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    }).session(session)

    // Get user data at month end
    const user = await User.findById(userId)
      .select('IQ_score inGameName pic maxIQScore name level')
      .session(session)

    // Determine current society and circle based on IQ score
    const { society, circle } = determineUserSocietyAndCircle(user.IQ_score)

    // Calculate RQM stats
    const rqmScores = monthlyQuizAttempts.map(attempt => attempt.RQM_score)
    const averageRQM =
      rqmScores.length > 0
        ? rqmScores.reduce((acc, score) => acc + score, 0) / rqmScores.length
        : 0
    const highestRQM = rqmScores.length > 0 ? Math.max(...rqmScores) : 0

    // Calculate perfect scores
    const perfectScores = monthlyQuizAttempts.filter(attempt => {
      const allCorrect = attempt.responses.every(response => response.isCorrect)
      return allCorrect && attempt.responses.length === 5
    }).length

    // Get starting IQ score (first attempt in month)
    const firstAttempt = await QuizAttempt.findOne({
      user: userId,
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    })
      .sort({ createdAt: 1 })
      .select('prevIQScore')
      .session(session)

    return {
      user: userId,
      month,
      year,
      name: user.name,
      experienceLevel: user.level,
      displayName: user.inGameName,
      profilePicture: user.pic,
      iqScore: {
        start: firstAttempt?.prevIQScore || user.IQ_score,
        final: user.IQ_score,
        peak: user.maxIQScore,
      },
      rqmScore: {
        average: Math.round(averageRQM * 100) / 100,
        highest: highestRQM,
      },
      quizStats: {
        total: monthlyQuizAttempts.length,
        perfectScores,
      },
      society,
      circle,
    }
  },
)

const calculateMonthlyRanks = makeRetryable(
  async ({ month, year, session }) => {
    // Get all users sorted by IQ score, then avgRQM, then xp for tiebreakers
    const rankedUsers = await User.find()
      .sort({ IQ_score: -1, avgRQM: -1, xp: -1 })
      .select('_id IQ_score avgRQM xp')
      .session(session)
      .lean()

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

    return rankMap
  },
)

module.exports = {
  calculateUserMonthlyStats,
  calculateMonthlyRanks,
}
