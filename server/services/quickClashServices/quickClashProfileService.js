// services/quickClashServices/quickClashProfileService.js
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashAnalysis = require('../../model/quickClashSchemas/quickClashAnalysisSchema')
const QuickClashInsightFeedback = require('../../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const QuickClashTeamBattleAnalysis = require('../../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')
const { DEFAULT_STARTING_TROPHIES } = require('./quickClashTrophyService')
const moment = require('moment')

/**
 * Get AI-driven insights for user profile (minimal cost approach)
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getProfileAIInsights = async userId => {
  try {
    const userObjectId =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    // Get the most recent high-rated insight from team battles
    const recentTeamInsight = await QuickClashInsightFeedback.findOne({
      user: userObjectId,
      'explicitFeedback.rating': { $gte: 4 }, // Only high-rated insights
      'insightData.type': { $in: ['strength', 'improvement', 'achievement'] },
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()

    // Get the latest analysis recommendation from 1v1 matches
    const recentAnalysis = await QuickClashAnalysis.findOne({
      $or: [
        { 'challenger.userId': userObjectId },
        { 'opponent.userId': userObjectId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()

    // Extract user-specific data from analysis
    let userAnalysisData = null
    if (recentAnalysis) {
      const isChallenger =
        recentAnalysis.challenger?.userId?.toString() ===
        userObjectId.toString()
      userAnalysisData = isChallenger
        ? recentAnalysis.challenger
        : recentAnalysis.opponent
    }

    // Get learning focus areas from recent analyses (last 5 analyses)
    const learningFocus = await QuickClashAnalysis.aggregate([
      {
        $match: {
          $or: [
            { 'challenger.userId': userObjectId },
            { 'opponent.userId': userObjectId },
          ],
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $project: {
          focusAreas: {
            $cond: [
              { $eq: ['$challenger.userId', userObjectId] },
              '$challenger.learningPath.focusAreas',
              '$opponent.learningPath.focusAreas',
            ],
          },
        },
      },
      { $unwind: '$focusAreas' },
      {
        $group: {
          _id: '$focusAreas',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 2 },
    ])

    return {
      recentInsight: recentTeamInsight
        ? {
            title: recentTeamInsight.insightData.title,
            description: recentTeamInsight.insightData.description,
            type: recentTeamInsight.insightData.type,
            rating: recentTeamInsight.explicitFeedback.rating,
            createdAt: recentTeamInsight.createdAt,
          }
        : null,

      topRecommendation:
        userAnalysisData?.analysis?.recommendations?.[0] || null,

      learningFocus:
        learningFocus.length > 0 ? learningFocus.map(f => f._id) : [],

      performanceTrend:
        userAnalysisData?.analysis?.strengths?.length > 0
          ? {
              strengths: userAnalysisData.analysis.strengths.slice(0, 2),
              weaknesses: userAnalysisData.analysis.weaknesses.slice(0, 1),
              trophyTrend:
                userAnalysisData.trophyInsights?.progressTrend || 'stable',
            }
          : null,
    }
  } catch (error) {
    console.error('Error getting profile AI insights:', error)
    return {
      recentInsight: null,
      topRecommendation: null,
      learningFocus: [],
      performanceTrend: null,
    }
  }
}

/**
 * Get comprehensive Quick Clash profile data for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Complete profile data
 */
const getQuickClashProfile = async ({ userId }) => {
  try {
    // Convert userId to ObjectId if it's a string
    const userObjectId =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    // Get user basic info
    const user = await User.findById(userObjectId)
      .select(
        '_id name inGameName pic quickClashTrophies quickClashStats createdAt level xp',
      )
      .lean()

    // If user not found, try to find a session player
    if (!user) {
      const sessionPlayer = await PlaySession.findById(userObjectId)
        .select('_id sessionId inGameName trophies stats streak coins createdAt lastActiveAt')
        .lean()

      if (!sessionPlayer) {
        throw new Error('User not found')
      }

      // Return simplified profile for session player
      return getSessionPlayerProfile(sessionPlayer)
    }

    // Get trophy history to calculate rank
    const allUsers = await User.find({
      quickClashTrophies: { $exists: true, $ne: null },
    })
      .select('_id quickClashTrophies')
      .sort({ quickClashTrophies: -1 })
      .lean()

    const userRank =
      allUsers.findIndex(u => u._id.toString() === userObjectId.toString()) + 1

    // Get match statistics
    const [oneVsOneStats, teamBattleStats] = await Promise.all([
      getOneVsOneStats(userObjectId),
      getTeamBattleStats(userObjectId),
    ])

    // Calculate overall stats
    const totalMatches =
      oneVsOneStats.totalMatches + teamBattleStats.totalMatches
    const totalWins = oneVsOneStats.wins + teamBattleStats.wins
    const totalLosses = oneVsOneStats.losses + teamBattleStats.losses
    const overallWinRate =
      totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : 0

    // Get recent activity
    const recentActivity = await getRecentActivity(userObjectId)

    // Get achievements
    const achievements = await calculateAchievements(userObjectId, {
      totalMatches,
      totalWins,
      currentTrophies: user.quickClashTrophies || DEFAULT_STARTING_TROPHIES,
      currentWinStreak: user.quickClashStats?.currentWinStreak || 0,
      peakTrophies:
        user.quickClashStats?.peakTrophies || DEFAULT_STARTING_TROPHIES,
    })

    // Get favorite categories
    const favoriteCategories = await getFavoriteCategories(userObjectId)

    // Get AI insights (minimal cost)
    const aiInsights = await getProfileAIInsights(userObjectId)

    return {
      user: {
        id: user._id,
        name: user.name,
        inGameName: user.inGameName,
        picture: user.pic,
        level: user.level || 0,
        xp: user.xp || 0,
        joinedAt: user.createdAt,
      },
      trophies: {
        current: user.quickClashTrophies || DEFAULT_STARTING_TROPHIES,
        peak: user.quickClashStats?.peakTrophies || DEFAULT_STARTING_TROPHIES,
        rank: userRank,
        totalPlayers: allUsers.length,
      },
      statistics: {
        overall: {
          totalMatches,
          wins: totalWins,
          losses: totalLosses,
          ties: oneVsOneStats.ties + teamBattleStats.ties,
          winRate: parseFloat(overallWinRate),
        },
        oneVsOne: oneVsOneStats,
        teamBattle: teamBattleStats,
      },
      streaks: {
        current: user.quickClashStats?.currentWinStreak || 0,
        longest: await getLongestWinStreak(userObjectId),
        protectionAvailable:
          user.quickClashStats?.streakProtectionAvailable || false,
      },
      achievements,
      favoriteCategories,
      recentActivity,
      // New AI insights section
      aiInsights,
    }
  } catch (error) {
    console.error('Error getting Quick Clash profile:', error)
    throw error
  }
}

/**
 * Get profile data for a session player (simplified version)
 * @param {Object} sessionPlayer - Session player document
 * @returns {Object} Profile data for session player
 */
const getSessionPlayerProfile = async (sessionPlayer) => {
  const sessionPlayerId = sessionPlayer._id

  // Get team battle stats for session player from trophy history
  const teamBattleStats = await getSessionPlayerTeamBattleStats(sessionPlayerId)

  // Use team battle stats for overall stats (session players only do team battles)
  // The PlaySession.stats field is not actively maintained, so we use trophy history
  const totalMatches = teamBattleStats.totalMatches || 0
  const totalWins = teamBattleStats.wins || 0
  const totalLosses = teamBattleStats.losses || 0
  const ties = teamBattleStats.ties || 0
  const overallWinRate = teamBattleStats.winRate || 0

  // Calculate peak trophies - if current trophies are higher than starting, that's their peak
  const currentTrophies = sessionPlayer.trophies || DEFAULT_STARTING_TROPHIES
  const peakTrophies = Math.max(currentTrophies, DEFAULT_STARTING_TROPHIES)

  // Get recent activity for session player
  const recentActivity = await getSessionPlayerRecentActivity(sessionPlayerId)

  // Calculate simple achievements for session player
  const achievements = calculateSessionPlayerAchievements({
    totalMatches,
    totalWins,
    currentTrophies,
    currentWinStreak: sessionPlayer.streak?.dayStreak || 0,
    peakTrophies,
  })

  return {
    isSessionPlayer: true, // Flag to indicate this is a session player
    user: {
      id: sessionPlayer._id,
      name: sessionPlayer.inGameName,
      inGameName: sessionPlayer.inGameName,
      picture: null, // Session players don't have profile pictures
      level: 0,
      xp: 0,
      joinedAt: sessionPlayer.createdAt,
      coins: sessionPlayer.coins || 0,
    },
    trophies: {
      current: currentTrophies,
      peak: peakTrophies,
      rank: null, // Session players don't appear in leaderboard
      totalPlayers: null,
    },
    statistics: {
      overall: {
        totalMatches,
        wins: totalWins,
        losses: totalLosses,
        ties,
        winRate: parseFloat(overallWinRate),
      },
      oneVsOne: {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winRate: 0,
        totalTrophiesGained: 0,
        totalTrophiesLost: 0,
      },
      teamBattle: teamBattleStats,
    },
    streaks: {
      current: sessionPlayer.streak?.dayStreak || 0,
      longest: sessionPlayer.streak?.longestStreak || 0,
      protectionAvailable: false,
    },
    achievements,
    favoriteCategories: [],
    recentActivity,
    aiInsights: {
      recentInsight: null,
      topRecommendation: null,
      learningFocus: [],
      performanceTrend: null,
    },
  }
}

/**
 * Get team battle stats for a session player
 * @param {mongoose.Types.ObjectId} sessionPlayerId - Session player ObjectId
 */
const getSessionPlayerTeamBattleStats = async (sessionPlayerId) => {
  // Ensure sessionPlayerId is a proper ObjectId for aggregation
  const sessionPlayerObjectId =
    typeof sessionPlayerId === 'string'
      ? new mongoose.Types.ObjectId(sessionPlayerId)
      : sessionPlayerId

  // Note: Session player trophy records may have userParticipated: false
  // so we don't filter by that field
  const stats = await QuickClashTeamTrophyHistory.aggregate([
    { $match: { sessionPlayer: sessionPlayerObjectId } },
    {
      $group: {
        _id: null,
        totalMatches: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$result', 'loss'] }, 1, 0] } },
        ties: { $sum: { $cond: [{ $eq: ['$result', 'tie'] }, 1, 0] } },
        totalTrophiesGained: {
          $sum: {
            $cond: [{ $gt: ['$trophiesChange', 0] }, '$trophiesChange', 0],
          },
        },
        totalTrophiesLost: {
          $sum: {
            $cond: [
              { $lt: ['$trophiesChange', 0] },
              { $abs: '$trophiesChange' },
              0,
            ],
          },
        },
        // Also calculate average score here
        avgScore: { $avg: '$userScore' },
      },
    },
  ])

  // Get average score from last 10 matches
  const last10Matches = await QuickClashTeamTrophyHistory.find({
    sessionPlayer: sessionPlayerObjectId,
    userScore: { $exists: true, $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('userScore')
    .lean()

  const avgScoreLast10 =
    last10Matches.length > 0
      ? Math.round(
          last10Matches.reduce((sum, m) => sum + (m.userScore || 0), 0) /
            last10Matches.length,
        )
      : 0

  const result = stats[0] || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    totalTrophiesGained: 0,
    totalTrophiesLost: 0,
  }

  result.winRate =
    result.totalMatches > 0
      ? parseFloat(((result.wins / result.totalMatches) * 100).toFixed(1))
      : 0

  // Add average score from last 10 matches
  result.avgScoreLast10 = avgScoreLast10
  result.matchesForAvg = last10Matches.length

  return result
}

/**
 * Get recent activity for a session player
 * @param {mongoose.Types.ObjectId} sessionPlayerId - Session player ObjectId
 */
const getSessionPlayerRecentActivity = async (sessionPlayerId) => {
  const recentTeamBattles = await QuickClashTeamTrophyHistory.find({
    sessionPlayer: sessionPlayerId,
  })
    .populate('teamBattle', 'createdAt categories')
    .populate('opponentTeam', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  return recentTeamBattles.map(battle => ({
    type: 'team',
    id: battle._id,
    result: battle.result,
    trophyChange: battle.trophiesChange,
    opponentTeam: battle.opponentTeam,
    categories: battle.teamBattle?.categories,
    date: battle.createdAt,
  }))
}

/**
 * Calculate simple achievements for session player
 * @param {Object} stats - Session player statistics
 */
const calculateSessionPlayerAchievements = (stats) => {
  const achievements = []

  // Trophy milestones
  if (stats.currentTrophies >= 2000)
    achievements.push({
      id: 'trophy_master',
      name: 'Trophy Master',
      description: 'Reach 2000 trophies',
      icon: '🏆',
      unlocked: true,
    })
  if (stats.currentTrophies >= 1500)
    achievements.push({
      id: 'trophy_hunter',
      name: 'Trophy Hunter',
      description: 'Reach 1500 trophies',
      icon: '🎯',
      unlocked: true,
    })
  if (stats.currentTrophies >= 1200)
    achievements.push({
      id: 'rising_star',
      name: 'Rising Star',
      description: 'Reach 1200 trophies',
      icon: '⭐',
      unlocked: true,
    })

  // Match milestones
  if (stats.totalMatches >= 100)
    achievements.push({
      id: 'veteran',
      name: 'Veteran Player',
      description: 'Play 100 matches',
      icon: '🎖️',
      unlocked: true,
    })
  if (stats.totalMatches >= 50)
    achievements.push({
      id: 'experienced',
      name: 'Experienced',
      description: 'Play 50 matches',
      icon: '🥉',
      unlocked: true,
    })
  if (stats.totalMatches >= 10)
    achievements.push({
      id: 'getting_started',
      name: 'Getting Started',
      description: 'Play 10 matches',
      icon: '🚀',
      unlocked: true,
    })

  // Win streaks
  if (stats.currentWinStreak >= 10)
    achievements.push({
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Win 10 matches in a row',
      icon: '🔥',
      unlocked: true,
    })
  if (stats.currentWinStreak >= 5)
    achievements.push({
      id: 'hot_streak',
      name: 'Hot Streak',
      description: 'Win 5 matches in a row',
      icon: '🔥',
      unlocked: true,
    })

  // Win count milestones
  if (stats.totalWins >= 50)
    achievements.push({
      id: 'champion',
      name: 'Champion',
      description: 'Win 50 matches',
      icon: '👑',
      unlocked: true,
    })
  if (stats.totalWins >= 25)
    achievements.push({
      id: 'winner',
      name: 'Winner',
      description: 'Win 25 matches',
      icon: '🏅',
      unlocked: true,
    })

  return achievements
}

/**
 * Get 1v1 match statistics
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getOneVsOneStats = async userId => {
  // Ensure userId is ObjectId
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  const stats = await QuickClashTrophyHistory.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: null,
        totalMatches: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$result', 'loss'] }, 1, 0] } },
        ties: { $sum: { $cond: [{ $eq: ['$result', 'tie'] }, 1, 0] } },
        totalTrophiesGained: {
          $sum: {
            $cond: [{ $gt: ['$trophiesChange', 0] }, '$trophiesChange', 0],
          },
        },
        totalTrophiesLost: {
          $sum: {
            $cond: [
              { $lt: ['$trophiesChange', 0] },
              { $abs: '$trophiesChange' },
              0,
            ],
          },
        },
      },
    },
  ])

  const result = stats[0] || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    totalTrophiesGained: 0,
    totalTrophiesLost: 0,
  }

  result.winRate =
    result.totalMatches > 0
      ? parseFloat(((result.wins / result.totalMatches) * 100).toFixed(1))
      : 0

  return result
}

/**
 * Get team battle statistics
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getTeamBattleStats = async userId => {
  // Ensure userId is ObjectId
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  // Get overall stats
  const stats = await QuickClashTeamTrophyHistory.aggregate([
    { $match: { user: userObjectId, userParticipated: true } },
    {
      $group: {
        _id: null,
        totalMatches: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$result', 'loss'] }, 1, 0] } },
        ties: { $sum: { $cond: [{ $eq: ['$result', 'tie'] }, 1, 0] } },
        totalTrophiesGained: {
          $sum: {
            $cond: [{ $gt: ['$trophiesChange', 0] }, '$trophiesChange', 0],
          },
        },
        totalTrophiesLost: {
          $sum: {
            $cond: [
              { $lt: ['$trophiesChange', 0] },
              { $abs: '$trophiesChange' },
              0,
            ],
          },
        },
      },
    },
  ])

  // Get average score from last 10 matches
  const last10Matches = await QuickClashTeamTrophyHistory.find({
    user: userObjectId,
    userParticipated: true,
    userScore: { $exists: true, $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('userScore')
    .lean()

  const avgScoreLast10 =
    last10Matches.length > 0
      ? Math.round(
          last10Matches.reduce((sum, m) => sum + (m.userScore || 0), 0) /
            last10Matches.length,
        )
      : 0

  const result = stats[0] || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    totalTrophiesGained: 0,
    totalTrophiesLost: 0,
  }

  result.winRate =
    result.totalMatches > 0
      ? parseFloat(((result.wins / result.totalMatches) * 100).toFixed(1))
      : 0

  // Add average score from last 10 matches
  result.avgScoreLast10 = avgScoreLast10
  result.matchesForAvg = last10Matches.length

  return result
}

/**
 * Get recent activity for the user
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getRecentActivity = async userId => {
  // Ensure userId is ObjectId
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  const [recentOneVsOne, recentTeamBattles] = await Promise.all([
    QuickClashTrophyHistory.find({ user: userObjectId })
      .populate('challenge', 'category createdAt')
      .populate('opponent', 'name inGameName pic')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    QuickClashTeamTrophyHistory.find({ user: userObjectId })
      .populate('teamBattle', 'createdAt categories')
      .populate('opponentTeam', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  // Combine and sort by date
  const allActivity = [
    ...recentOneVsOne.map(match => ({
      type: '1v1',
      id: match._id,
      result: match.result,
      trophyChange: match.trophiesChange,
      opponent: match.opponent,
      category: match.challenge?.category,
      date: match.createdAt,
    })),
    ...recentTeamBattles.map(battle => ({
      type: 'team',
      id: battle._id,
      result: battle.result,
      trophyChange: battle.trophiesChange,
      opponentTeam: battle.opponentTeam,
      categories: battle.teamBattle?.categories,
      date: battle.createdAt,
    })),
  ]

  return allActivity
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
}

/**
 * Calculate achievements based on user stats
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 * @param {Object} stats - User statistics
 */
const calculateAchievements = async (userId, stats) => {
  const achievements = []

  // Trophy milestones
  if (stats.currentTrophies >= 2000)
    achievements.push({
      id: 'trophy_master',
      name: 'Trophy Master',
      description: 'Reach 2000 trophies',
      icon: '🏆',
      unlocked: true,
    })
  if (stats.currentTrophies >= 1500)
    achievements.push({
      id: 'trophy_hunter',
      name: 'Trophy Hunter',
      description: 'Reach 1500 trophies',
      icon: '🎯',
      unlocked: true,
    })
  if (stats.currentTrophies >= 1200)
    achievements.push({
      id: 'rising_star',
      name: 'Rising Star',
      description: 'Reach 1200 trophies',
      icon: '⭐',
      unlocked: true,
    })

  // Match milestones
  if (stats.totalMatches >= 100)
    achievements.push({
      id: 'veteran',
      name: 'Veteran Player',
      description: 'Play 100 matches',
      icon: '🎖️',
      unlocked: true,
    })
  if (stats.totalMatches >= 50)
    achievements.push({
      id: 'experienced',
      name: 'Experienced',
      description: 'Play 50 matches',
      icon: '🥉',
      unlocked: true,
    })
  if (stats.totalMatches >= 10)
    achievements.push({
      id: 'getting_started',
      name: 'Getting Started',
      description: 'Play 10 matches',
      icon: '🚀',
      unlocked: true,
    })

  // Win streaks
  if (stats.currentWinStreak >= 10)
    achievements.push({
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Win 10 matches in a row',
      icon: '🔥',
      unlocked: true,
    })
  if (stats.currentWinStreak >= 5)
    achievements.push({
      id: 'hot_streak',
      name: 'Hot Streak',
      description: 'Win 5 matches in a row',
      icon: '🔥',
      unlocked: true,
    })

  // Win count milestones
  if (stats.totalWins >= 50)
    achievements.push({
      id: 'champion',
      name: 'Champion',
      description: 'Win 50 matches',
      icon: '👑',
      unlocked: true,
    })
  if (stats.totalWins >= 25)
    achievements.push({
      id: 'winner',
      name: 'Winner',
      description: 'Win 25 matches',
      icon: '🏅',
      unlocked: true,
    })

  return achievements
}

/**
 * Get user's favorite categories based on match history
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getFavoriteCategories = async userId => {
  // Ensure userId is ObjectId
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  const categoryStats = await QuickClashChallenge.aggregate([
    {
      $match: {
        $or: [{ challenger: userObjectId }, { opponent: userObjectId }],
        status: 'completed',
        challengerAttempted: true,
        opponentAttempted: true,
      },
    },
    {
      $group: {
        _id: '$category',
        totalMatches: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $and: [
                      { $eq: ['$challenger', userObjectId] },
                      { $gt: ['$challengerScore', '$opponentScore'] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ['$opponent', userObjectId] },
                      { $gt: ['$opponentScore', '$challengerScore'] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        winRate: {
          $cond: [
            { $gt: ['$totalMatches', 0] },
            { $multiply: [{ $divide: ['$wins', '$totalMatches'] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { totalMatches: -1, winRate: -1 } },
    { $limit: 5 },
  ])

  return categoryStats.map(cat => ({
    category: cat._id,
    matches: cat.totalMatches,
    wins: cat.wins,
    winRate: Math.round(cat.winRate),
  }))
}

/**
 * Get longest win streak for user
 * @param {mongoose.Types.ObjectId} userId - User ObjectId
 */
const getLongestWinStreak = async userId => {
  // Ensure userId is ObjectId
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  // Get Team Battle matches
  const teamHistory = await QuickClashTeamTrophyHistory.find({
    user: userObjectId,
    userParticipated: true
  })
    .select('result createdAt')
    .sort({ createdAt: 1 })
    .lean()

  // Merge and sort all matches chronologically
  const allHistory = [...teamHistory]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  let longestStreak = 0
  let currentStreak = 0

  for (const match of allHistory) {
    if (match.result === 'win') {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return longestStreak
}

/**
 * Get Quick Clash achievements for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 */
const getQuickClashAchievements = async ({ userId }) => {
  // Convert userId to ObjectId if it's a string
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  // This would typically be part of getQuickClashProfile, but separated for specific endpoint
  const user = await User.findById(userObjectId)
    .select('quickClashTrophies quickClashStats')
    .lean()

  if (!user) {
    throw new Error('User not found')
  }

  const stats = await getOneVsOneStats(userObjectId)
  const teamStats = await getTeamBattleStats(userObjectId)
  const totalMatches = stats.totalMatches + teamStats.totalMatches
  const totalWins = stats.wins + teamStats.wins

  return calculateAchievements(userObjectId, {
    totalMatches,
    totalWins,
    currentTrophies: user.quickClashTrophies || DEFAULT_STARTING_TROPHIES,
    currentWinStreak: user.quickClashStats?.currentWinStreak || 0,
    peakTrophies:
      user.quickClashStats?.peakTrophies || DEFAULT_STARTING_TROPHIES,
  })
}

/**
 * Get Quick Clash recent matches for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number} params.limit - Number of matches to return
 */
const getQuickClashRecentMatches = async ({ userId, limit = 10 }) => {
  // Convert userId to ObjectId if it's a string
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  const activity = await getRecentActivity(userObjectId)
  return activity.slice(0, limit)
}

/**
 * Get Quick Clash detailed statistics for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 */
const getQuickClashStatistics = async ({ userId }) => {
  // Convert userId to ObjectId if it's a string
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

  const [oneVsOneStats, teamBattleStats] = await Promise.all([
    getOneVsOneStats(userObjectId),
    getTeamBattleStats(userObjectId),
  ])

  const favoriteCategories = await getFavoriteCategories(userObjectId)

  return {
    oneVsOne: oneVsOneStats,
    teamBattle: teamBattleStats,
    favoriteCategories,
  }
}

module.exports = {
  getQuickClashProfile,
  getQuickClashAchievements,
  getQuickClashRecentMatches,
  getQuickClashStatistics,
}
