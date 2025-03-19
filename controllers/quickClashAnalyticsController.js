// controllers/quickClashAnalyticsController.js
const asyncHandler = require('express-async-handler')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')
const User = require('../model/userSchema')
const mongoose = require('mongoose')

/**
 * @desc    Get overall Quick Clash statistics
 * @route   GET /api/admin/quick-clash/stats
 * @access  Private/Admin
 */
const getQuickClashStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, includeBots = 'true' } = req.query

  // Parse dates or use defaults (last 30 days)
  const end = endDate ? new Date(endDate) : new Date()
  end.setHours(23, 59, 59, 999) // End of day

  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days before end date
  start.setHours(0, 0, 0, 0) // Start of day

  // Determine if we should include bot users in our stats
  const shouldIncludeBots = includeBots === 'true'

  // Bot user regex pattern
  const botPattern = /^dummy\d+@mail\.com$/

  // First get all the users to distinguish between bots and real users
  const users = await User.find({}, { _id: 1, email: 1, role: 1 }).lean()

  // Create a map of user IDs to determine if they're bots
  const botUserMap = {}
  users.forEach(user => {
    // Check if user is a bot based on email pattern
    botUserMap[user._id.toString()] = user.email && botPattern.test(user.email)
  })

  // Run aggregation pipeline for overall stats
  const overallStats = await QuickClashChallenge.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalChallenges: { $sum: 1 },
        completedChallenges: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
          },
        },
        activeChallenges: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
        pendingChallenges: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
          },
        },
        rejectedChallenges: {
          $sum: {
            $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
          },
        },
        expiredChallenges: {
          $sum: {
            $cond: [{ $eq: ['$status', 'expired'] }, 1, 0],
          },
        },
        totalUsers: {
          $addToSet: {
            $concatArrays: [
              [{ $toString: '$challenger' }],
              [{ $toString: '$opponent' }],
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalChallenges: 1,
        completedChallenges: 1,
        activeChallenges: 1,
        pendingChallenges: 1,
        rejectedChallenges: 1,
        expiredChallenges: 1,
        completionRate: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    '$completedChallenges',
                    { $max: ['$totalChallenges', 1] },
                  ],
                },
                100,
              ],
            },
            1,
          ],
        },
        uniqueUsers: {
          $size: {
            $reduce: {
              input: '$totalUsers',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
        },
      },
    },
  ])

  // Calculate category distribution
  const categoryStats = await QuickClashChallenge.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        completed: 1,
        completionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ['$completed', { $max: ['$count', 1] }] },
                100,
              ],
            },
            1,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ])

  // Get daily trends
  const dailyTrends = await QuickClashChallenge.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        challenges: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        date: '$_id',
        challenges: 1,
        completed: 1,
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ])

  // Get bot-specific stats if requested
  let botStats = null
  if (shouldIncludeBots) {
    // Find all bot user IDs
    const botUserIds = Object.entries(botUserMap)
      .filter(([_, isBot]) => isBot)
      .map(([userId]) => new mongoose.Types.ObjectId(userId))

    // Get bot challenges stats
    const botChallenges = await QuickClashChallenge.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          $or: [
            { challenger: { $in: botUserIds } },
            { opponent: { $in: botUserIds } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          botChallenges: { $sum: 1 },
          completedBotChallenges: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          botChallenges: 1,
          completedBotChallenges: 1,
          botCompletionRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      '$completedBotChallenges',
                      { $max: ['$botChallenges', 1] },
                    ],
                  },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
    ])

    botStats = botChallenges.length
      ? botChallenges[0]
      : {
          botChallenges: 0,
          completedBotChallenges: 0,
          botCompletionRate: 0,
        }

    // Get top bot users
    const topBots = await QuickClashChallenge.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          $or: [
            { challenger: { $in: botUserIds } },
            { opponent: { $in: botUserIds } },
          ],
        },
      },
      {
        $project: {
          challenger: 1,
          opponent: 1,
          status: 1,
          challengerId: { $toString: '$challenger' },
          opponentId: { $toString: '$opponent' },
        },
      },
      {
        $addFields: {
          isChallengerBot: {
            $in: [
              '$challengerId',
              Object.entries(botUserMap)
                .filter(([_, isBot]) => isBot)
                .map(([userId]) => userId),
            ],
          },
          isOpponentBot: {
            $in: [
              '$opponentId',
              Object.entries(botUserMap)
                .filter(([_, isBot]) => isBot)
                .map(([userId]) => userId),
            ],
          },
        },
      },
      {
        $match: {
          $or: [{ isChallengerBot: true }, { isOpponentBot: true }],
        },
      },
      {
        $facet: {
          challengerStats: [
            {
              $match: { isChallengerBot: true },
            },
            {
              $group: {
                _id: '$challenger',
                totalChallenges: { $sum: 1 },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                  },
                },
              },
            },
          ],
          opponentStats: [
            {
              $match: { isOpponentBot: true },
            },
            {
              $group: {
                _id: '$opponent',
                totalChallenges: { $sum: 1 },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          allBots: {
            $concatArrays: ['$challengerStats', '$opponentStats'],
          },
        },
      },
      { $unwind: '$allBots' },
      {
        $group: {
          _id: '$allBots._id',
          totalChallenges: { $sum: '$allBots.totalChallenges' },
          completed: { $sum: '$allBots.completed' },
        },
      },
      {
        $project: {
          userId: { $toString: '$_id' },
          totalChallenges: 1,
          completed: 1,
          completionRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$completed', { $max: ['$totalChallenges', 1] }],
                  },
                  100,
                ],
              },
              1,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { totalChallenges: -1 } },
      { $limit: 10 },
    ])

    // Get user details for top bots
    const botUserIds2 = topBots.map(
      bot => new mongoose.Types.ObjectId(bot.userId),
    )
    if (botUserIds2.length > 0) {
      const botDetails = await User.find(
        { _id: { $in: botUserIds2 } },
        { _id: 1, name: 1, inGameName: 1 },
      ).lean()

      botStats.topBots = topBots.map(bot => {
        const botDetail = botDetails.find(
          u => u._id.toString() === bot.userId,
        ) || { name: 'Unknown Bot', inGameName: 'Unknown Bot' }

        return {
          ...bot,
          name: botDetail.name,
          inGameName: botDetail.inGameName,
        }
      })
    } else {
      botStats.topBots = []
    }
  }

  // Get top users
  const topUsers = await QuickClashChallenge.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $facet: {
        challengerStats: [
          {
            $group: {
              _id: '$challenger',
              challengesCreated: { $sum: 1 },
              wins: {
                $sum: {
                  $cond: [{ $eq: ['$winner', '$challenger'] }, 1, 0],
                },
              },
            },
          },
        ],
        opponentStats: [
          {
            $group: {
              _id: '$opponent',
              challengesReceived: { $sum: 1 },
              wins: {
                $sum: {
                  $cond: [{ $eq: ['$winner', '$opponent'] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        users: {
          $concatArrays: ['$challengerStats', '$opponentStats'],
        },
      },
    },
    { $unwind: '$users' },
    {
      $group: {
        _id: '$users._id',
        challengesCreated: {
          $sum: { $ifNull: ['$users.challengesCreated', 0] },
        },
        challengesReceived: {
          $sum: { $ifNull: ['$users.challengesReceived', 0] },
        },
        wins: { $sum: '$users.wins' },
      },
    },
    {
      $project: {
        userId: '$_id',
        totalChallenges: {
          $add: ['$challengesCreated', '$challengesReceived'],
        },
        wins: 1,
        winRate: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    '$wins',
                    {
                      $max: [
                        { $add: ['$challengesCreated', '$challengesReceived'] },
                        1,
                      ],
                    },
                  ],
                },
                100,
              ],
            },
            1,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { totalChallenges: -1 } },
    { $limit: 10 },
  ])

  // Get user details for the top users
  const userIds = topUsers.map(user => new mongoose.Types.ObjectId(user.userId))
  let topUserDetails = []

  if (userIds.length > 0) {
    topUserDetails = await User.find(
      { _id: { $in: userIds } },
      { _id: 1, name: 1, inGameName: 1 },
    ).lean()
  }

  // Merge user details with stats and mark bots
  const topUsersWithDetails = topUsers.map(userStat => {
    const userDetail = topUserDetails.find(
      u => u._id.toString() === userStat.userId.toString(),
    ) || { name: 'Unknown', inGameName: 'Unknown' }

    // Check if this user is a bot
    const isBot = botUserMap[userStat.userId] || false

    return {
      ...userStat,
      name: userDetail.name,
      inGameName: userDetail.inGameName,
      isBot: isBot,
    }
  })

  // Calculate reading vs quiz time stats if data is available
  const timeStats = await QuickClashSession.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        phase: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalReadingTime: { $sum: { $ifNull: ['$reading.timeSpent', 0] } },
        totalQuizTime: { $sum: { $ifNull: ['$quizAttempt.timeSpent', 0] } },
        sessionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        avgReadingTime: {
          $round: [
            { $divide: ['$totalReadingTime', { $max: ['$sessionCount', 1] }] },
            1,
          ],
        },
        avgQuizTime: {
          $round: [
            { $divide: ['$totalQuizTime', { $max: ['$sessionCount', 1] }] },
            1,
          ],
        },
        sessionCount: 1,
      },
    },
  ])

  // Response data
  res.json({
    success: true,
    stats: {
      overall:
        overallStats.length > 0
          ? overallStats[0]
          : {
              totalChallenges: 0,
              completedChallenges: 0,
              activeChallenges: 0,
              pendingChallenges: 0,
              rejectedChallenges: 0,
              expiredChallenges: 0,
              completionRate: 0,
              uniqueUsers: 0,
            },
      categories: categoryStats,
      dailyTrends: dailyTrends,
      topUsers: topUsersWithDetails,
      timeStats:
        timeStats.length > 0
          ? timeStats[0]
          : {
              avgReadingTime: 0,
              avgQuizTime: 0,
              sessionCount: 0,
            },
      botStats: botStats, // Add bot statistics if available
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      includedBots: shouldIncludeBots,
    },
  })
})

/**
 * @desc    Get Quick Clash user activity data with pagination
 * @route   GET /api/admin/quick-clash/user-activity
 * @access  Private/Admin
 */
const getQuickClashUserActivity = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 50, includeBots = 'true' } = req.query

  // Parse date or use today
  const selectedDate = date ? new Date(date) : new Date()
  selectedDate.setHours(0, 0, 0, 0) // Start of day

  const nextDay = new Date(selectedDate)
  nextDay.setDate(nextDay.getDate() + 1) // End of day

  // Bot user regex pattern
  const botPattern = /^dummy\d+@mail\.com$/
  const shouldIncludeBots = includeBots === 'true'

  // Build our query
  const matchQuery = {
    createdAt: { $gte: selectedDate, $lt: nextDay },
  }

  // Find all challenges for the selected day
  const challenges = await QuickClashChallenge.find(matchQuery)
    .select('challenger opponent status winner category createdAt')
    .lean()

  // Process data in memory to avoid complex aggregation issues
  const userMap = {}

  // Process challenger data
  challenges.forEach(challenge => {
    const challengerId = challenge.challenger.toString()
    const opponentId = challenge.opponent.toString()

    // Process challenger data (always include challengers)
    if (!userMap[challengerId]) {
      userMap[challengerId] = {
        userId: challengerId,
        asChallenger: {
          totalChallenges: 0,
          completedChallenges: 0,
          wonChallenges: 0,
        },
        asOpponent: {
          totalChallenges: 0,
          completedChallenges: 0,
          wonChallenges: 0,
        },
        lastActive: null,
      }
    }

    userMap[challengerId].asChallenger.totalChallenges++
    if (challenge.status === 'completed') {
      userMap[challengerId].asChallenger.completedChallenges++
      if (challenge.winner && challenge.winner.toString() === challengerId) {
        userMap[challengerId].asChallenger.wonChallenges++
      }
    }

    if (
      !userMap[challengerId].lastActive ||
      new Date(challenge.createdAt) > new Date(userMap[challengerId].lastActive)
    ) {
      userMap[challengerId].lastActive = challenge.createdAt
    }

    // Process opponent data - ONLY if the challenge is NOT pending
    if (challenge.status !== 'pending') {
      if (!userMap[opponentId]) {
        userMap[opponentId] = {
          userId: opponentId,
          asChallenger: {
            totalChallenges: 0,
            completedChallenges: 0,
            wonChallenges: 0,
          },
          asOpponent: {
            totalChallenges: 0,
            completedChallenges: 0,
            wonChallenges: 0,
          },
          lastActive: null,
        }
      }

      userMap[opponentId].asOpponent.totalChallenges++
      if (challenge.status === 'completed') {
        userMap[opponentId].asOpponent.completedChallenges++
        if (challenge.winner && challenge.winner.toString() === opponentId) {
          userMap[opponentId].asOpponent.wonChallenges++
        }
      }

      if (
        !userMap[opponentId].lastActive ||
        new Date(challenge.createdAt) > new Date(userMap[opponentId].lastActive)
      ) {
        userMap[opponentId].lastActive = challenge.createdAt
      }
    }
  })

  // Convert to array and calculate aggregated metrics
  let userActivity = Object.values(userMap).map(user => {
    const totalChallenges =
      user.asChallenger.totalChallenges + user.asOpponent.totalChallenges
    const completedChallenges =
      user.asChallenger.completedChallenges +
      user.asOpponent.completedChallenges
    const wonChallenges =
      user.asChallenger.wonChallenges + user.asOpponent.wonChallenges

    // Determine primary role
    const primaryRole =
      user.asChallenger.totalChallenges >= user.asOpponent.totalChallenges
        ? 'challenger'
        : 'opponent'

    // Calculate rates
    const completionRate =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0

    const winRate =
      completedChallenges > 0
        ? Math.round((wonChallenges / completedChallenges) * 100)
        : 0

    return {
      userId: user.userId,
      totalChallenges,
      completedChallenges,
      wonChallenges,
      completionRate,
      winRate,
      primaryRole,
      lastActive: user.lastActive,
    }
  })

  // Sort by total challenges
  userActivity.sort((a, b) => b.totalChallenges - a.totalChallenges)

  // Get user details for all users to identify bots
  const allUserIds = userActivity.map(
    user => new mongoose.Types.ObjectId(user.userId),
  )

  const allUsers = await User.find(
    { _id: { $in: allUserIds } },
    { _id: 1, name: 1, inGameName: 1, email: 1, pic: 1 },
  ).lean()

  // Create a map for all users with bot identification
  const allUserDetailsMap = {}
  allUsers.forEach(user => {
    const isBot = user.email && botPattern.test(user.email)
    allUserDetailsMap[user._id.toString()] = {
      ...user,
      isBot,
    }
  })

  // Calculate total counts for DAU/MAU first including all users
  const uniqueUserIds = new Set(userActivity.map(user => user.userId))

  // Then calculate DAU excluding bots if needed
  const realUsers = new Set()
  allUserIds.forEach(userId => {
    const userDetails = allUserDetailsMap[userId.toString()]
    if (userDetails && (!userDetails.isBot || shouldIncludeBots)) {
      realUsers.add(userId.toString())
    }
  })
  const dau = realUsers.size

  // Get MAU - users active in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const mauChallenges = await QuickClashChallenge.find({
    createdAt: { $gte: thirtyDaysAgo, $lt: nextDay },
  })
    .select('challenger opponent status')
    .lean()

  // Collect all user IDs that were active in the last 30 days
  const mauUserIds = new Set()
  mauChallenges.forEach(challenge => {
    // Always include challengers
    mauUserIds.add(challenge.challenger.toString())

    // Only add opponents for non-pending challenges
    if (challenge.status !== 'pending') {
      mauUserIds.add(challenge.opponent.toString())
    }
  })

  // Convert to array for batch query
  const mauUserIdsArray = Array.from(mauUserIds).map(
    id => new mongoose.Types.ObjectId(id),
  )

  // Get user details for MAU calculation to identify bots
  const mauUsers = await User.find(
    { _id: { $in: mauUserIdsArray } },
    { _id: 1, email: 1 },
  ).lean()

  // Create a map of MAU users with bot identification
  const mauUserDetailsMap = {}
  mauUsers.forEach(user => {
    mauUserDetailsMap[user._id.toString()] = {
      isBot: user.email && botPattern.test(user.email),
    }
  })

  // Calculate real MAU excluding bots if needed
  const realMauUsers = new Set()
  mauUserIds.forEach(userId => {
    const userDetails = mauUserDetailsMap[userId]
    if (userDetails && (!userDetails.isBot || shouldIncludeBots)) {
      realMauUsers.add(userId)
    }
  })

  const mau = realMauUsers.size
  const dauMauRatio = mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0

  // Paginate the results
  const paginatedUserIds = userActivity
    .slice((page - 1) * limit, page * limit)
    .map(user => new mongoose.Types.ObjectId(user.userId))

  // Add user details to paginated results
  const activityWithUserDetails = userActivity
    .slice((page - 1) * limit, page * limit)
    .map(activity => {
      const user = allUserDetailsMap[activity.userId] || {
        name: 'Unknown User',
        inGameName: 'Unknown',
        email: '',
        pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        isBot: false,
      }

      // Skip bots if includeBots is false
      if (!shouldIncludeBots && user.isBot) {
        return null
      }

      return {
        ...activity,
        name: user.name,
        inGameName: user.inGameName,
        email: user.email,
        pic: user.pic,
        isBot: user.isBot,
      }
    })
    .filter(Boolean) // Remove null entries (filtered bots)

  res.json({
    success: true,
    activityDate: selectedDate.toISOString(),
    stats: {
      dau,
      mau,
      dauMauRatio,
      totalUsersToday: shouldIncludeBots ? uniqueUserIds.size : realUsers.size,
    },
    users: activityWithUserDetails,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: shouldIncludeBots
        ? userActivity.length
        : userActivity.filter(user => !allUserDetailsMap[user.userId]?.isBot)
            .length,
      hasMore:
        page * limit <
        (shouldIncludeBots
          ? userActivity.length
          : userActivity.filter(user => !allUserDetailsMap[user.userId]?.isBot)
              .length),
    },
  })
})

module.exports = {
  getQuickClashStats,
  getQuickClashUserActivity,
}
