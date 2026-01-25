// services/quickClashServices/quickClashLeaderboardService.js
const User = require('../../model/userSchema')
// Import the new history schemas
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
// QuickClashChallenge is needed for the $lookup target collection name and its schema structure (scores, fromTeamBattle).
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
// QuickClashTeamBattle model might not be directly queried for stats aggregation anymore,
// but keeping the import in case its collection name or other details are needed.
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')

/**
 * Get Quick Clash leaderboard data, sorted by trophies.
 * Includes 1v1 and 4v4 auxiliary stats.
 * @param {Object} params - Parameters
 * @param {number} params.page - Page number (starting from 1)
 * @param {number} params.limit - Number of items per page
 * @param {string} params.searchQuery - Optional search query for usernames
 * @param {string} params.currentUserId - Optional user ID to get specific rank for
 * @returns {Promise<Object>} Leaderboard data with pagination info
 */
const getLeaderboard = async ({ page = 1, limit = 20, searchQuery = '', currentUserId = null }) => {
  try {
    page = parseInt(page) || 1
    limit = parseInt(limit) || 20

    // === 1. Fetch 1v1 Auxiliary Stats using QuickClashTrophyHistory ===
    const individualStatsPipeline = [
      {
        $lookup: {
          // Use Model.collection.name to robustly get the collection name
          from: QuickClashChallenge.collection.name,
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeDetailsArr', // Use a different name to avoid conflict if 'challengeDetails' is a field
        },
      },
      {
        // $unwind will filter out history records with no matching challenge (if any)
        $unwind: '$challengeDetailsArr',
      },
      {
        // Filter based on the properties of the looked-up challenge
        $match: {
          'challengeDetailsArr.status': 'completed',
          'challengeDetailsArr.challenger': { $ne: null, $exists: true },
          'challengeDetailsArr.opponent': { $ne: null, $exists: true },
          // Ensure it's a standalone 1v1 challenge, not part of a team battle
          'challengeDetailsArr.fromTeamBattle': { $ne: true },
        },
      },
      {
        $project: {
          userId: '$user', // User from the QuickClashTrophyHistory record
          isWinner: { $eq: ['$result', 'win'] }, // Result from QuickClashTrophyHistory
          // Determine the score of THIS user in that specific challenge
          score: {
            $cond: {
              if: { $eq: ['$user', '$challengeDetailsArr.challenger'] },
              then: '$challengeDetailsArr.challengerScore',
              else: {
                // User must be the opponent
                $cond: {
                  if: { $eq: ['$user', '$challengeDetailsArr.opponent'] },
                  then: '$challengeDetailsArr.opponentScore',
                  else: 0, // Fallback, ideally $user is always challenger or opponent
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalChallenges1v1: { $sum: 1 },
          wins1v1: { $sum: { $cond: ['$isWinner', 1, 0] } },
          totalScore1v1: { $sum: '$score' },
        },
      },
      {
        $project: {
          _id: 1, // User ID
          wins1v1: 1,
          winRate1v1: {
            $cond: {
              if: { $gt: ['$totalChallenges1v1', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$wins1v1', '$totalChallenges1v1'] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              else: 0,
            },
          },
          avgScore1v1: {
            $cond: {
              if: { $gt: ['$totalChallenges1v1', 0] },
              then: {
                $round: [
                  { $divide: ['$totalScore1v1', '$totalChallenges1v1'] },
                  1,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ]
    const individualAggregatedStats = await QuickClashTrophyHistory.aggregate(
      individualStatsPipeline,
    )

    const individualStatsMap = new Map()
    individualAggregatedStats.forEach(stat => {
      if (stat._id) {
        // stat._id is the user's ObjectId
        individualStatsMap.set(stat._id.toString(), {
          wins1v1: stat.wins1v1 || 0,
          winRate1v1: stat.winRate1v1 || 0,
          avgScore1v1: stat.avgScore1v1 || 0,
        })
      }
    })

    // === 2. Fetch 4v4 Auxiliary Stats using QuickClashTeamTrophyHistory ===
    // This approach is much simpler as QuickClashTeamTrophyHistory contains user-specific battle outcomes and scores.
    const teamBattleStatsPipeline = [
      // We assume QuickClashTeamTrophyHistory records are created for completed battles
      // where a result ('win', 'loss', 'tie') is determined for the user's team.
      // The 'userParticipated' field is crucial.
      {
        $match: {
          userParticipated: true, // Only consider stats if the user actually participated
        },
      },
      {
        $group: {
          _id: '$user', // Group by user
          totalBattles4v4: { $sum: 1 }, // Each matching record is a participated battle
          wins4v4: {
            $sum: {
              $cond: [{ $eq: ['$result', 'win'] }, 1, 0], // Count if result is 'win'
            },
          },
          // Sum userScore (directly available in QuickClashTeamTrophyHistory)
          totalScore4v4: { $sum: '$userScore' },
        },
      },
      {
        $project: {
          _id: 1, // User ID
          wins4v4: 1,
          winRate4v4: {
            $cond: {
              if: { $gt: ['$totalBattles4v4', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$wins4v4', '$totalBattles4v4'] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              else: 0,
            },
          },
          avgScore4v4: {
            $cond: {
              if: { $gt: ['$totalBattles4v4', 0] },
              then: {
                $round: [
                  { $divide: ['$totalScore4v4', '$totalBattles4v4'] },
                  1,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ]
    const teamBattleAggregatedStats =
      await QuickClashTeamTrophyHistory.aggregate(teamBattleStatsPipeline)

    const teamStatsMap = new Map()
    teamBattleAggregatedStats.forEach(stat => {
      if (stat._id) {
        // stat._id is the user's ObjectId
        teamStatsMap.set(stat._id.toString(), {
          wins4v4: stat.wins4v4 || 0,
          winRate4v4: stat.winRate4v4 || 0,
          avgScore4v4: stat.avgScore4v4 || 0,
        })
      }
    })

    // === 3. Fetch Users, Rank, and Paginate ===
    let userQuery = {}
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i')
      // Ensure search targets fields present in the User model
      userQuery = {
        $or: [{ name: searchRegex }, { inGameName: searchRegex }],
        'quickClashStats.totalMatches': { $gt: 0 },
      }
    } else {
      userQuery = { 'quickClashStats.totalMatches': { $gt: 0 } }
    }

    const totalMatchingUsers = await User.countDocuments(userQuery)

    const usersFromDB = await User.find(userQuery)
      .select('_id name inGameName pic quickClashTrophies')
      .sort({ quickClashTrophies: -1, name: 1 }) // Primary sort by trophies, secondary by name for tie-breaking
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // For global ranking: Fetch all active users' trophies.
    // This matches the original implementation for determining global rank.
    const allUserTrophiesForRanking = await User.find({
      'quickClashStats.totalMatches': { $gt: 0 },
    }) // Fetch all active users for global ranking context
      .select('_id quickClashTrophies')
      .sort({ quickClashTrophies: -1, name: 1 }) // Consistent sort for ranking
      .lean()

    const rankMap = new Map()
    // Assign rank based on the sorted order. Users with same trophies, sorted by name next, get sequential ranks.
    allUserTrophiesForRanking.forEach((u, index) => {
      rankMap.set(u._id.toString(), index + 1)
    })

    // === 4. Combine All Data ===
    const leaderboardUsers = usersFromDB.map(user => {
      const stats1v1 = individualStatsMap.get(user._id.toString()) || {
        wins1v1: 0,
        winRate1v1: 0,
        avgScore1v1: 0,
      }
      const stats4v4 = teamStatsMap.get(user._id.toString()) || {
        wins4v4: 0,
        winRate4v4: 0,
        avgScore4v4: 0,
      }

      return {
        _id: user._id.toString(),
        name: user.name,
        inGameName: user.inGameName,
        pic: user.pic,
        trophies: user.quickClashTrophies || 0,
        rank: rankMap.get(user._id.toString()) || 0, // Get global rank from map

        // Original fields for backward compatibility or primary display (derived from 1v1)
        wins: stats1v1.wins1v1,
        winRate: stats1v1.winRate1v1,
        avgScore: stats1v1.avgScore1v1,

        // Explicit 1v1 stats
        wins1v1: stats1v1.wins1v1,
        winRate1v1: stats1v1.winRate1v1,
        avgScore1v1: stats1v1.avgScore1v1,

        // Explicit 4v4 stats
        wins4v4: stats4v4.wins4v4,
        winRate4v4: stats4v4.winRate4v4,
        avgScore4v4: stats4v4.avgScore4v4,
      }
    })

    const totalPages = Math.ceil(totalMatchingUsers / limit)
    const hasMore = page < totalPages

    // === 5. Get Current User Rank Data (if requested) ===
    let currentUserRank = null
    if (currentUserId) {
      const currentUserIdStr = currentUserId.toString()
      const globalRank = rankMap.get(currentUserIdStr)

      // If user exists in the ranking map (should always be true for valid users)
      if (globalRank) {
        // Find user doc (might be in usersFromDB if on this page, otherwise fetch)
        let userDoc = usersFromDB.find(u => u._id.toString() === currentUserIdStr)

        if (!userDoc) {
          // User not on current page, fetch basic details
          userDoc = await User.findById(currentUserId)
            .select('_id name inGameName pic quickClashTrophies')
            .lean()
        }

        if (userDoc) {
          const stats1v1 = individualStatsMap.get(currentUserIdStr) || {
            wins1v1: 0,
            winRate1v1: 0,
            avgScore1v1: 0,
          }
          const stats4v4 = teamStatsMap.get(currentUserIdStr) || {
            wins4v4: 0,
            winRate4v4: 0,
            avgScore4v4: 0,
          }

          currentUserRank = {
            _id: userDoc._id.toString(),
            name: userDoc.name,
            inGameName: userDoc.inGameName,
            pic: userDoc.pic,
            trophies: userDoc.quickClashTrophies || 0,
            rank: globalRank,

            // Stats
            wins: stats1v1.wins1v1,
            winRate: stats1v1.winRate1v1,
            avgScore: stats1v1.avgScore1v1,
            wins1v1: stats1v1.wins1v1,
            winRate1v1: stats1v1.winRate1v1,
            avgScore1v1: stats1v1.avgScore1v1,
            wins4v4: stats4v4.wins4v4,
            winRate4v4: stats4v4.winRate4v4,
            avgScore4v4: stats4v4.avgScore4v4,
          }
        }
      }
    }

    return {
      users: leaderboardUsers,
      currentUserRank,
      pagination: {
        page,
        limit,
        totalUsers: totalMatchingUsers, // Total users matching the search query
        totalPages,
        hasMore,
      },
    }
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    // Depending on application's error handling strategy, rethrow or return a formatted error
    throw error
  }
}

module.exports = {
  getLeaderboard,
}
