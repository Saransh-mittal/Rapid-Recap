// services/quickClashServices/quickClashStatsService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const mongoose = require('mongoose')

/**
 * Calculate Quick Clash statistics for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async ({ userId }) => {
  try {
    // Get all completed challenges for this user
    const completedChallenges = await QuickClashChallenge.find({
      $or: [
        { challenger: userId, status: 'completed' },
        { opponent: userId, status: 'completed' },
      ],
    }).lean()

    // Initialize stats with default values for new users
    const stats = {
      winRate: 0,
      avgCompletionTime: 0,
      totalChallenges: 0,
      bestCategory: null,
      categoryBreakdown: {},
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
    }

    // Calculate active challenges
    const activeChallenges = await QuickClashChallenge.countDocuments({
      $or: [
        { challenger: userId, status: { $in: ['pending', 'active'] } },
        { opponent: userId, status: { $in: ['pending', 'active'] } },
      ],
    })

    stats.totalChallenges = completedChallenges.length + activeChallenges

    // If no completed challenges, return default stats
    if (completedChallenges.length === 0) {
      return stats
    }

    // Calculate wins, losses, and category performance
    let wins = 0
    let losses = 0
    let ties = 0
    const categoryScores = {}

    for (const challenge of completedChallenges) {
      const isChallenger = challenge.challenger.toString() === userId.toString()
      const userScore = isChallenger
        ? challenge.challengerScore
        : challenge.opponentScore
      const opponentScore = isChallenger
        ? challenge.opponentScore
        : challenge.challengerScore

      // Track category performance
      if (!categoryScores[challenge.category]) {
        categoryScores[challenge.category] = {
          totalScore: 0,
          count: 0,
          wins: 0,
        }
      }
      categoryScores[challenge.category].totalScore += userScore
      categoryScores[challenge.category].count += 1

      // Count wins, losses, and ties
      if (userScore > opponentScore) {
        wins++
        categoryScores[challenge.category].wins += 1
      } else if (userScore < opponentScore) {
        losses++
      } else if (userScore > 0 && opponentScore > 0) {
        // Only count as tie if both players completed the challenge
        ties++
      }
    }

    // Calculate win rate (only from completed challenges)
    const completedWithBothScores = completedChallenges.filter(
      challenge => challenge.challengerScore > 0 && challenge.opponentScore > 0,
    )

    if (completedWithBothScores.length > 0) {
      stats.winRate = Math.round((wins / completedWithBothScores.length) * 100)
    }

    stats.totalWins = wins
    stats.totalLosses = losses
    stats.totalTies = ties

    // Find best category based on win rate and score
    let bestCategory = null
    let bestScore = 0

    Object.entries(categoryScores).forEach(([category, data]) => {
      // Calculate score based on win rate and average score
      const categoryWinRate = data.count > 0 ? data.wins / data.count : 0
      const avgScore = data.count > 0 ? data.totalScore / data.count : 0
      const combinedScore = categoryWinRate * 0.7 + (avgScore / 200) * 0.3 // Weight win rate more

      if (combinedScore > bestScore && data.count >= 2) {
        // Need at least 2 challenges to be considered best
        bestScore = combinedScore
        bestCategory = category
      }

      // Save category breakdown
      stats.categoryBreakdown[category] = {
        avgScore: Math.round(avgScore),
        count: data.count,
        winRate:
          data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
      }
    })

    stats.bestCategory = bestCategory

    // Calculate average completion time from quiz sessions
    const sessions = await QuickClashSession.find({
      user: userId,
      phase: 'completed',
      'quizAttempt.completed': true,
    }).lean()

    if (sessions.length > 0) {
      const totalQuizTime = sessions.reduce((sum, session) => {
        return sum + (session.quizAttempt?.timeSpent || 0)
      }, 0)

      const totalReadingTime = sessions.reduce((sum, session) => {
        return sum + (session.reading?.timeSpent || 0)
      }, 0)

      // Calculate average time for quiz completion
      stats.avgCompletionTime = Math.round(totalQuizTime / sessions.length)

      // Include reading metrics for more detailed analytics
      stats.avgReadingTime = Math.round(totalReadingTime / sessions.length)
      stats.totalSessions = sessions.length
    }

    return stats
  } catch (error) {
    console.error('Error calculating user stats:', error)
    throw error
  }
}

module.exports = {
  getUserStats,
}
