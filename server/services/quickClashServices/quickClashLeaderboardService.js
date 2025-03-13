// services/quickClashServices/quickClashLeaderboardService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const mongoose = require('mongoose')

/**
 * Get Quick Clash leaderboard data
 * @param {Object} params - Parameters
 * @param {number} params.page - Page number (starting from 1)
 * @param {number} params.limit - Number of items per page
 * @param {string} params.searchQuery - Optional search query for usernames
 * @returns {Promise<Object>} Leaderboard data with pagination info
 */
const getLeaderboard = async ({ page = 1, limit = 20, searchQuery = '' }) => {
  try {
    // Convert page and limit to numbers
    page = parseInt(page)
    limit = parseInt(limit)

    // First perform a basic pipeline to gather all user stats
    const baseStatsPipeline = [
      // Match completed challenges
      { $match: { status: 'completed' } },

      // Unwind both challenger and opponent
      {
        $facet: {
          // Process challenger stats
          challengerStats: [
            { $match: { challengerAttempted: true, opponentAttempted: true } },
            {
              $project: {
                userId: '$challenger',
                isWinner: {
                  $cond: [
                    { $and: [{ $gt: ['$challengerScore', '$opponentScore'] }] },
                    true,
                    false,
                  ],
                },
                score: '$challengerScore',
                isTie: { $eq: ['$challengerScore', '$opponentScore'] },
              },
            },
          ],
          // Process opponent stats
          opponentStats: [
            { $match: { challengerAttempted: true, opponentAttempted: true } },
            {
              $project: {
                userId: '$opponent',
                isWinner: {
                  $cond: [
                    { $and: [{ $gt: ['$opponentScore', '$challengerScore'] }] },
                    true,
                    false,
                  ],
                },
                score: '$opponentScore',
                isTie: { $eq: ['$challengerScore', '$opponentScore'] },
              },
            },
          ],
        },
      },

      // Combine the challenger and opponent stats
      {
        $project: {
          combinedStats: {
            $concatArrays: ['$challengerStats', '$opponentStats'],
          },
        },
      },
      { $unwind: '$combinedStats' },
      { $replaceRoot: { newRoot: '$combinedStats' } },

      // Group by user and calculate stats
      {
        $group: {
          _id: '$userId',
          totalChallenges: { $sum: 1 },
          wins: { $sum: { $cond: ['$isWinner', 1, 0] } },
          ties: { $sum: { $cond: ['$isTie', 1, 0] } },
          totalScore: { $sum: '$score' },
        },
      },

      // Calculate derived stats
      {
        $project: {
          _id: 1,
          totalChallenges: 1,
          wins: 1,
          ties: 1,
          winRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$wins', { $max: ['$totalChallenges', 1] }] },
                  100,
                ],
              },
              1,
            ],
          },
          avgScore: {
            $round: [
              { $divide: ['$totalScore', { $max: ['$totalChallenges', 1] }] },
              1,
            ],
          },
        },
      },
    ]

    // Execute the base pipeline
    const userStatsResults = await QuickClashChallenge.aggregate(
      baseStatsPipeline,
    )

    // Get ALL user details regardless of search query
    const allUserIds = userStatsResults.map(stat => stat._id)
    const allUsers = await User.find({ _id: { $in: allUserIds } })
      .select('_id name inGameName pic')
      .lean()

    // Create maps for quick lookups
    const userDetailsMap = {}
    allUsers.forEach(user => {
      userDetailsMap[user._id.toString()] = user
    })

    // Combine ALL stats with user details and apply sorting to get global rankings
    const allCombinedResults = userStatsResults
      .filter(stat => userDetailsMap[stat._id.toString()])
      .map(stat => {
        const user = userDetailsMap[stat._id.toString()]
        return {
          _id: stat._id,
          name: user.name,
          inGameName: user.inGameName,
          pic: user.pic,
          totalChallenges: stat.totalChallenges,
          wins: stat.wins,
          ties: stat.ties,
          winRate: stat.winRate,
          avgScore: stat.avgScore,
        }
      })

    // Sort by wins, then winRate, then avgScore to determine global ranks
    allCombinedResults.sort((a, b) => {
      // Sort by wins first
      if (b.wins !== a.wins) return b.wins - a.wins
      // Then by win rate
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      // Then by avg score
      return b.avgScore - a.avgScore
    })

    // Assign global ranks to all users
    const resultsWithGlobalRanks = allCombinedResults.map((user, index) => ({
      ...user,
      rank: index + 1, // Global rank (1-based)
    }))

    // Now apply search filter if provided while preserving global ranks
    let filteredResults = resultsWithGlobalRanks

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i')
      filteredResults = resultsWithGlobalRanks.filter(
        user =>
          searchRegex.test(user.name) || searchRegex.test(user.inGameName),
      )
    }

    // Calculate pagination info based on filtered results
    const totalUsers = filteredResults.length
    const totalPages = Math.ceil(totalUsers / limit)
    const hasMore = page < totalPages

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Paginate results while preserving original ranks
    const paginatedResults = filteredResults.slice(skip, skip + limit)

    return {
      users: paginatedResults,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasMore,
      },
    }
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    throw error
  }
}

module.exports = {
  getLeaderboard,
}
