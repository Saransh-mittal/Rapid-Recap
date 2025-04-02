// services/quickClashServices/quickClashStatsService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const { getUserTrophies } = require('./quickClashTrophyService')

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
      currentWinStreak: 0, // New field for current streak
      longestWinStreak: 0, // New field for longest streak
    }

    // Calculate active challenges
    const activeChallenges = await QuickClashChallenge.countDocuments({
      $or: [
        { challenger: userId, status: { $in: ['active'] } },
        { opponent: userId, status: { $in: ['active'] } },
      ],
      expiresAt: { $gt: new Date() },
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

    // For tracking win streaks
    let currentWinStreak = 0
    let longestWinStreak = 0

    // Sort challenges by date for proper win streak calculation
    const chronologicalChallenges = [...completedChallenges].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )

    for (const challenge of chronologicalChallenges) {
      // Only count challenges where both players have attempted
      if (!challenge.challengerAttempted || !challenge.opponentAttempted) {
        continue
      }

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
        // Increment win streak
        currentWinStreak++
        // Update longest win streak if current is greater
        if (currentWinStreak > longestWinStreak) {
          longestWinStreak = currentWinStreak
        }
      } else if (userScore < opponentScore) {
        losses++
        // Reset win streak on loss
        currentWinStreak = 0
      } else {
        // Only count as tie if both players completed the challenge
        ties++
        // Reset win streak on tie
        currentWinStreak = 0
      }
    }

    // Store win streak stats
    stats.currentWinStreak = currentWinStreak
    stats.longestWinStreak = longestWinStreak

    // Calculate win rate only from completed matches where both players participated
    const totalCompletedMatches = wins + losses + ties

    if (totalCompletedMatches > 0) {
      stats.winRate = Math.round((wins / totalCompletedMatches) * 100)
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

    try {
      const trophies = await getUserTrophies({ userId })
      stats.trophies = trophies
    } catch (error) {
      console.error('Error getting user trophies:', error)
      // Continue with other stats even if trophies fail
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
