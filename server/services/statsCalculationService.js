const moment = require('moment-timezone')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { makeRetryable } = require('../utils/retryUtils')

const calculateUserMonthlyStats = makeRetryable(
  async ({ userId, month, year, session }) => {
    const startDate = moment({ year, month: month - 1 }).startOf('month')
    const endDate = moment(startDate).endOf('month')

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
      .select('IQ_score society circle inGameName pic')
      .session(session)

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
      return allCorrect && attempt.responses.length === 5 // assuming 5 questions per quiz
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
      society: user.society,
      circle: user.circle,
    }
  },
)

const calculateMonthlyRanks = makeRetryable(
  async ({ month, year, session }) => {
    // Get all users sorted by final IQ score
    const rankedUsers = await User.find()
      .sort({ IQ_score: -1 })
      .select('_id')
      .session(session)

    // Create rank mapping
    const rankMap = new Map(
      rankedUsers.map((user, index) => [user._id.toString(), index + 1]),
    )

    return rankMap
  },
)

module.exports = {
  calculateUserMonthlyStats,
  calculateMonthlyRanks,
}
