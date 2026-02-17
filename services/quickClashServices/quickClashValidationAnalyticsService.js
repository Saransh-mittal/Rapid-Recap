// services/quickClashServices/quickClashValidationAnalyticsService.js
// Comprehensive analytics service for 30-Day Indie Validation Playbook metrics
// NEW architecture - does not extend existing analytics

const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const ApplicationUpdates = require('../../model/applicationUpdatesSchema')
const AnalyticsAdmin = require('../../model/quickClashSchemas/analyticsAdminSchema')
const SoloDrillSession = require('../../model/quickClashSchemas/soloDrillSchema')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range boundaries
 * @param {number} daysAgo - Days ago from now
 * @returns {Object} { startDate, endDate }
 */
const getDateRange = (daysAgo = 30) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)
  startDate.setHours(0, 0, 0, 0)
  return { startDate, endDate }
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Bot filter query - excludes bot users from calculations
 * Bot users use dummy1@mail.com to dummy100@mail.com pattern
 */
const BOT_FILTER = {
  email: {
    $not: /^dummy\d+@mail\.com$/
  }
}

// ============================================================================
// FOOTFALL & TRAFFIC METRICS
// ============================================================================

/**
 * Get total footfall (unique visitors)
 * Tracks BOTH login-based and battle-based activity
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Footfall data
 */
const getTotalFootfall = async ({ startDate, endDate }) => {
  // Previous period for trend calculation
  const periodLength = endDate - startDate
  const prevStartDate = new Date(startDate - periodLength)
  const prevEndDate = new Date(startDate)

  // Get bot user IDs for exclusion
  const botUsers = await User.find({
    email: { $regex: /^dummy\d+@mail\.com$/ }
  }).select('_id')
  const botUserIds = botUsers.map(u => u._id)

  // === LOGIN-BASED FOOTFALL ===
  // Current period - users who logged in
  const usersLoggedIn = await User.countDocuments({
    lastLogin: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
  })

  // Current period - session players who were active
  const sessionsActive = await PlaySession.countDocuments({
    lastActiveAt: { $gte: startDate, $lte: endDate },
  })

  // === BATTLE-BASED FOOTFALL ===
  // Get unique users who played battles in period
  const battleParticipants = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'active'] },
      },
    },
    {
      $project: {
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $match: {
        'allMembers.user': { $nin: botUserIds }
      }
    },
    {
      $group: {
        _id: null,
        uniqueUsers: { $addToSet: '$allMembers.user' },
        uniqueSessions: { $addToSet: '$allMembers.sessionPlayer' },
      },
    },
  ])

  const usersPlayed = battleParticipants[0]?.uniqueUsers?.filter(Boolean)?.length || 0
  const sessionsPlayed = battleParticipants[0]?.uniqueSessions?.filter(Boolean)?.length || 0

  // Previous period
  const prevUsersLoggedIn = await User.countDocuments({
    lastLogin: { $gte: prevStartDate, $lte: prevEndDate },
    ...BOT_FILTER,
  })
  const prevSessionsActive = await PlaySession.countDocuments({
    lastActiveAt: { $gte: prevStartDate, $lte: prevEndDate },
  })

  const currentLoginTotal = usersLoggedIn + sessionsActive
  const prevLoginTotal = prevUsersLoggedIn + prevSessionsActive
  const currentBattleTotal = usersPlayed + sessionsPlayed

  return {
    // Total footfall (login-based)
    total: currentLoginTotal,
    users: usersLoggedIn,
    sessions: sessionsActive,
    // Battle-based breakdown
    battle: {
      users: usersPlayed,
      sessions: sessionsPlayed,
      total: currentBattleTotal,
    },
    trend: calculateTrend(currentLoginTotal, prevLoginTotal).toFixed(1),
    previousTotal: prevLoginTotal,
  }
}

/**
 * Get Daily Active Users (DAU) trend
 * Tracks BOTH login-based and battle-based activity per day
 * Excludes bot users (dummy1-100@mail.com pattern)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Array>} Daily active user counts
 */
const getDailyActiveUsers = async ({ startDate, endDate }) => {
  // First, get all bot user IDs to exclude
  const botUsers = await User.find({
    email: { $regex: /^dummy\d+@mail\.com$/ }
  }).select('_id')
  const botUserIds = botUsers.map(u => u._id)

  // Get battle-based DAU (users who PLAYED each day)
  // 1. Get Battle USERS (Registered users who played)
  const battleUsersData = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'active'] },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $match: {
        'allMembers.user': { $nin: botUserIds, $ne: null }, // User MUST exist and not be bot
      }
    },
    {
      $group: {
        _id: '$date',
        uniqueUsers: { $addToSet: '$allMembers.user' },
      },
    },
    {
      $project: {
        date: '$_id',
        count: { $size: '$uniqueUsers' },
      },
    },
    { $sort: { date: 1 } },
  ])

  // 2. Get Battle GUESTS (Session players with NO user ID)
  const battleGuestsData = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'active'] },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $match: {
        'allMembers.sessionPlayer': { $ne: null }, // Session MUST exist
        'allMembers.user': null, // User MUST NOT exist (Strict Guest)
      }
    },
    {
      $group: {
        _id: '$date',
        uniqueSessions: { $addToSet: '$allMembers.sessionPlayer' },
      },
    },
    {
      $project: {
        date: '$_id',
        count: { $size: '$uniqueSessions' },
      },
    },
    { $sort: { date: 1 } },
  ])

  // Get login-based DAU (users who LOGGED IN each day)
  // Group by date from lastLogin field
  const loginDauData = await User.aggregate([
    {
      $match: {
        lastLogin: { $gte: startDate, $lte: endDate },
        email: { $not: /^dummy\d+@mail\.com$/ },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
        loginUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Get active sessions (guests who were ACTIVE each day)
  // Group by date from lastActiveAt field
  const sessionDauData = await PlaySession.aggregate([
    {
      $match: {
        lastActiveAt: { $gte: startDate, $lte: endDate },
        convertedToUser: null, // Only count non-converted sessions (users are counted in loginDauData)
        user: null, // Only count anonymous sessions (registered users are counted in loginDauData)
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActiveAt' } },
        sessionUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Combine battle, login, and session data by date
  const dateMap = new Map()

  // Add battle USERS data
  battleUsersData.forEach(d => {
    dateMap.set(d.date, {
      date: d.date,
      battleUsers: d.count,
      battleSessions: 0,
      loginUsers: 0,
      dau: d.count,
    })
  })

  // Add battle GUESTS data
  battleGuestsData.forEach(d => {
    if (dateMap.has(d.date)) {
      const existing = dateMap.get(d.date)
      existing.battleSessions = d.count
      existing.dau += d.count // Sum users + guests
    } else {
      dateMap.set(d.date, {
        date: d.date,
        battleUsers: 0,
        battleSessions: d.count,
        loginUsers: 0,
        dau: d.count,
      })
    }
  })

  // Merge login data (Users)
  loginDauData.forEach(d => {
    if (dateMap.has(d._id)) {
      const existing = dateMap.get(d._id)
      existing.loginUsers += d.loginUsers
      existing.dau = Math.max(existing.dau, existing.loginUsers)
    } else {
      dateMap.set(d._id, {
        date: d._id,
        battleUsers: 0,
        battleSessions: 0,
        loginUsers: d.loginUsers,
        dau: d.loginUsers,
      })
    }
  })

  // Merge session data (Guests) into 'loginUsers' to represent Total Login/Active Footfall
  sessionDauData.forEach(d => {
    if (dateMap.has(d._id)) {
      const existing = dateMap.get(d._id)
      existing.loginUsers += d.sessionUsers // Add sessions to login count
      existing.dau = Math.max(existing.dau, existing.loginUsers)
    } else {
      dateMap.set(d._id, {
        date: d._id,
        battleUsers: 0,
        battleSessions: 0,
        loginUsers: d.sessionUsers,
        dau: d.sessionUsers,
      })
    }
  })

  // Convert to sorted array
  const dauData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  return dauData
}

/**
 * Get new vs returning users breakdown
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} New vs returning breakdown
 */
const getNewVsReturning = async ({ startDate, endDate }) => {
  // New users - created in this period
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
  })

  // Returning users - created before period, active in period
  const returningUsers = await User.countDocuments({
    createdAt: { $lt: startDate },
    lastLogin: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
  })

  // New session players
  const newSessions = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  })

  // Returning session players
  const returningSessions = await PlaySession.countDocuments({
    createdAt: { $lt: startDate },
    lastActiveAt: { $gte: startDate, $lte: endDate },
  })

  return {
    new: {
      users: newUsers,
      sessions: newSessions,
      total: newUsers + newSessions,
    },
    returning: {
      users: returningUsers,
      sessions: returningSessions,
      total: returningUsers + returningSessions,
    },
  }
}

/**
 * Get traffic by source
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Traffic breakdown by source
 */
const getTrafficBySource = async ({ startDate, endDate }) => {
  // Organic users - no referral, not from team invite
  const organic = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    referredBy: null,
    ...BOT_FILTER,
  })

  // Referral users
  const referral = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    referredBy: { $ne: null },
    ...BOT_FILTER,
  })

  // Team invite sessions
  const teamInvite = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    invitedByTeam: { $ne: null },
  })

  // Direct sessions (no team invite)
  const directSession = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    invitedByTeam: null,
  })

  const total = organic + referral + teamInvite + directSession

  return {
    organic: { count: organic, percentage: total > 0 ? ((organic / total) * 100).toFixed(1) : 0 },
    referral: { count: referral, percentage: total > 0 ? ((referral / total) * 100).toFixed(1) : 0 },
    teamInvite: { count: teamInvite, percentage: total > 0 ? ((teamInvite / total) * 100).toFixed(1) : 0 },
    directSession: { count: directSession, percentage: total > 0 ? ((directSession / total) * 100).toFixed(1) : 0 },
    total,
  }
}

// ============================================================================
// BOUNCE RATE METRICS
// ============================================================================

/**
 * Get all bounce rate metrics
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} All bounce rates
 */
const getBounceRates = async ({ startDate, endDate }) => {
  // Previous period for trends
  const periodLength = endDate - startDate
  const prevStartDate = new Date(startDate - periodLength)
  const prevEndDate = new Date(startDate)

  // 1. SIGNUP BOUNCE: Created account but never played a battle
  const totalSignups = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
  })

  const neverPlayed = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
    $or: [
      { 'quickClashStats.totalMatches': 0 },
      { 'quickClashStats.totalMatches': { $exists: false } },
      { quickClashStats: { $exists: false } },
    ],
  })

  const signupBounceRate = totalSignups > 0 ? (neverPlayed / totalSignups) * 100 : 0

  // Previous signup bounce
  const prevTotalSignups = await User.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    ...BOT_FILTER,
  })
  const prevNeverPlayed = await User.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    ...BOT_FILTER,
    $or: [
      { 'quickClashStats.totalMatches': 0 },
      { 'quickClashStats.totalMatches': { $exists: false } },
      { quickClashStats: { $exists: false } },
    ],
  })
  const prevSignupBounceRate = prevTotalSignups > 0 ? (prevNeverPlayed / prevTotalSignups) * 100 : 0

  // 2. SINGLE BATTLE BOUNCE: Played exactly 1 battle, never returned
  // Denominator: All users who played at least 1 battle
  const gracePeriod = new Date(Date.now() - 48 * 60 * 60 * 1000) // 48hr grace

  const usersWhoPlayed = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    'quickClashStats.totalMatches': { $gte: 1 },
    ...BOT_FILTER,
  })

  // Users who played exactly 1 battle and signed up before grace period (gave them time to return)
  const oneBattleNeverReturned = await User.countDocuments({
    createdAt: { $gte: startDate, $lt: gracePeriod },
    'quickClashStats.totalMatches': 1,
    ...BOT_FILTER,
  })

  const singleBattleBounceRate = usersWhoPlayed > 0 ? (oneBattleNeverReturned / usersWhoPlayed) * 100 : 0

  // 3. SESSION ABANDON: Session player who left without converting
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const totalSessions = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  })

  const abandonedSessions = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    convertedToUser: null,
    lastActiveAt: { $lt: sevenDaysAgo },
  })

  const sessionAbandonRate = totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0

  // Previous session abandon
  const prevTotalSessions = await PlaySession.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
  })
  const prevAbandonedSessions = await PlaySession.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    convertedToUser: null,
    lastActiveAt: { $lt: new Date(prevEndDate - 7 * 24 * 60 * 60 * 1000) },
  })
  const prevSessionAbandonRate = prevTotalSessions > 0 ? (prevAbandonedSessions / prevTotalSessions) * 100 : 0

  // 4. RESULT CHECK BOUNCE: Users who played but never returned to view results
  // Find battles completed in period
  // NOTE: `completedAt` doesn't exist in schema, using `updatedAt` as proxy for completion time
  const completedBattles = await QuickClashTeamBattle.find({
    status: 'completed',
    updatedAt: { $gte: startDate, $lte: endDate },
  }).select('teamAMembers teamBMembers updatedAt').lean()

  // Collect all user IDs from battles to batch fetch (avoid N+1 query)
  const allBattleMembers = []
  for (const battle of completedBattles) {
    const allMembers = [...(battle.teamAMembers || []), ...(battle.teamBMembers || [])]
    for (const member of allMembers) {
      if (member.user) {
        allBattleMembers.push({
          userId: member.user,
          battleCompletedAt: battle.updatedAt,
        })
      }
    }
  }

  // Batch fetch all users at once (single query instead of N queries)
  const userIds = [...new Set(allBattleMembers.map(m => m.userId.toString()))]
  const users = await User.find({
    _id: { $in: userIds },
    email: { $not: /^dummy\d+@mail\.com$/ }, // Exclude bots
  }).select('_id lastLogin').lean()
  const userMap = new Map(users.map(u => [u._id.toString(), u]))

  let totalBattleParticipants = 0
  let didNotReturnAfterBattle = 0

  for (const { userId, battleCompletedAt } of allBattleMembers) {
    const user = userMap.get(userId.toString())
    if (!user) continue // Skip bots (filtered out)

    totalBattleParticipants++

    // If lastLogin is before or same as battle completion, they didn't return
    if (user.lastLogin && new Date(user.lastLogin) <= new Date(battleCompletedAt)) {
      didNotReturnAfterBattle++
    }
  }

  const resultCheckBounceRate = totalBattleParticipants > 0
    ? (didNotReturnAfterBattle / totalBattleParticipants) * 100
    : 0

  // Calculate overall bounce (average of all bounce types)
  const overallBounce = (signupBounceRate + singleBattleBounceRate + sessionAbandonRate + resultCheckBounceRate) / 4

  return {
    signupBounce: {
      rate: signupBounceRate.toFixed(1),
      count: neverPlayed,
      total: totalSignups,
      trend: (signupBounceRate - prevSignupBounceRate).toFixed(1),
    },
    singleBattleBounce: {
      rate: singleBattleBounceRate.toFixed(1),
      count: oneBattleNeverReturned,
      total: usersWhoPlayed,
      trend: 0,
    },
    sessionAbandon: {
      rate: sessionAbandonRate.toFixed(1),
      count: abandonedSessions,
      total: totalSessions,
      trend: (sessionAbandonRate - prevSessionAbandonRate).toFixed(1),
    },
    resultCheckBounce: {
      rate: resultCheckBounceRate.toFixed(1),
      count: didNotReturnAfterBattle,
      total: totalBattleParticipants,
      trend: 0,
    },
    overall: {
      rate: overallBounce.toFixed(1),
      trend: 0,
    },
  }
}

// ============================================================================
// RETENTION METRICS
// ============================================================================

/**
 * Get D1 retention rate (both battle-based and login-based)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} D1 retention data
 */
const getD1Retention = async ({ startDate, endDate }) => {
  // Get users who signed up in the period (excluding last day for D1 calculation)
  const d1CutoffStart = new Date(startDate)
  const d1CutoffEnd = new Date(endDate)
  d1CutoffEnd.setDate(d1CutoffEnd.getDate() - 1) // Exclude last day

  const signups = await User.find({
    createdAt: { $gte: d1CutoffStart, $lte: d1CutoffEnd },
    ...BOT_FILTER,
  }).select('_id createdAt lastLogin')

  if (signups.length === 0) {
    return {
      battle: { rate: 0, count: 0, total: 0 },
      login: { rate: 0, count: 0, total: 0 },
      rate: 0, count: 0, total: 0, trend: 0, target: 25, status: 'fail'
    }
  }

  let battleReturnedCount = 0
  let loginReturnedCount = 0

  for (const user of signups) {
    const signupDate = new Date(user.createdAt)
    const d1Start = new Date(signupDate)
    d1Start.setDate(d1Start.getDate() + 1)
    d1Start.setHours(0, 0, 0, 0)
    const d1End = new Date(d1Start)
    d1End.setHours(23, 59, 59, 999)

    // Check if user played a BATTLE on D1
    const d1Battle = await QuickClashTeamBattle.findOne({
      $or: [
        { 'teamAMembers.user': user._id },
        { 'teamBMembers.user': user._id },
      ],
      createdAt: { $gte: d1Start, $lte: d1End },
    })

    if (d1Battle) {
      battleReturnedCount++
    }

    // Check if user LOGGED IN on D1 (lastLogin was updated on D1)
    if (user.lastLogin) {
      const lastActive = new Date(user.lastLogin)
      if (lastActive >= d1Start && lastActive <= d1End) {
        loginReturnedCount++
      }
    }
  }

  const battleD1Rate = (battleReturnedCount / signups.length) * 100
  const loginD1Rate = (loginReturnedCount / signups.length) * 100

  return {
    battle: {
      rate: battleD1Rate.toFixed(1),
      count: battleReturnedCount,
      total: signups.length,
      status: battleD1Rate >= 25 ? 'pass' : battleD1Rate >= 20 ? 'conditional' : 'fail',
    },
    login: {
      rate: loginD1Rate.toFixed(1),
      count: loginReturnedCount,
      total: signups.length,
      status: loginD1Rate >= 25 ? 'pass' : loginD1Rate >= 20 ? 'conditional' : 'fail',
    },
    // Primary metric uses battle-based for gaming context
    rate: battleD1Rate.toFixed(1),
    count: battleReturnedCount,
    total: signups.length,
    target: 25,
    status: battleD1Rate >= 25 ? 'pass' : battleD1Rate >= 20 ? 'conditional' : 'fail',
    trend: 0,
  }
}

/**
 * Get D7 retention rate (both battle-based and login-based)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} D7 retention data
 */
const getD7Retention = async ({ startDate, endDate }) => {
  // Get users who signed up at least 7 days ago
  const d7CutoffEnd = new Date(endDate)
  d7CutoffEnd.setDate(d7CutoffEnd.getDate() - 7)

  const signups = await User.find({
    createdAt: { $gte: startDate, $lte: d7CutoffEnd },
    ...BOT_FILTER,
  }).select('_id createdAt lastLogin')

  if (signups.length === 0) {
    return {
      battle: { rate: 0, count: 0, total: 0 },
      login: { rate: 0, count: 0, total: 0 },
      rate: 0, count: 0, total: 0, trend: 0, target: 10, status: 'fail'
    }
  }

  let battleReturnedCount = 0
  let loginReturnedCount = 0

  for (const user of signups) {
    const signupDate = new Date(user.createdAt)
    const d7Start = new Date(signupDate)
    d7Start.setDate(d7Start.getDate() + 7)
    d7Start.setHours(0, 0, 0, 0)
    const d7End = new Date(d7Start)
    d7End.setHours(23, 59, 59, 999)

    // Check if user played a BATTLE on D7
    const d7Battle = await QuickClashTeamBattle.findOne({
      $or: [
        { 'teamAMembers.user': user._id },
        { 'teamBMembers.user': user._id },
      ],
      createdAt: { $gte: d7Start, $lte: d7End },
    })

    if (d7Battle) {
      battleReturnedCount++
    }

    // Check if user LOGGED IN on D7 or after (still active)
    if (user.lastLogin) {
      const lastActive = new Date(user.lastLogin)
      if (lastActive >= d7Start) {
        loginReturnedCount++
      }
    }
  }

  const battleD7Rate = (battleReturnedCount / signups.length) * 100
  const loginD7Rate = (loginReturnedCount / signups.length) * 100

  return {
    battle: {
      rate: battleD7Rate.toFixed(1),
      count: battleReturnedCount,
      total: signups.length,
      status: battleD7Rate >= 10 ? 'pass' : battleD7Rate >= 7 ? 'conditional' : 'fail',
    },
    login: {
      rate: loginD7Rate.toFixed(1),
      count: loginReturnedCount,
      total: signups.length,
      status: loginD7Rate >= 10 ? 'pass' : loginD7Rate >= 7 ? 'conditional' : 'fail',
    },
    // Primary metric uses battle-based for gaming context
    rate: battleD7Rate.toFixed(1),
    count: battleReturnedCount,
    total: signups.length,
    target: 10,
    status: battleD7Rate >= 10 ? 'pass' : battleD7Rate >= 7 ? 'conditional' : 'fail',
    trend: 0,
  }
}

/**
 * Get retention curve (D1 to D30)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Array>} Retention curve data
 */
const getRetentionCurve = async ({ startDate, endDate }) => {
  const retentionData = []
  const days = [1, 3, 7, 14, 21, 30]

  for (const day of days) {
    const cutoffEnd = new Date(endDate)
    cutoffEnd.setDate(cutoffEnd.getDate() - day)

    const signups = await User.find({
      createdAt: { $gte: startDate, $lte: cutoffEnd },
      ...BOT_FILTER,
    }).select('_id createdAt')

    if (signups.length === 0) {
      retentionData.push({ day, rate: 0, count: 0, total: 0 })
      continue
    }

    let returnedCount = 0

    for (const user of signups) {
      const signupDate = new Date(user.createdAt)
      const targetStart = new Date(signupDate)
      targetStart.setDate(targetStart.getDate() + day)
      targetStart.setHours(0, 0, 0, 0)
      const targetEnd = new Date(targetStart)
      targetEnd.setHours(23, 59, 59, 999)

      const battle = await QuickClashTeamBattle.findOne({
        $or: [
          { 'teamAMembers.user': user._id },
          { 'teamBMembers.user': user._id },
        ],
        createdAt: { $gte: targetStart, $lte: targetEnd },
      })

      if (battle) {
        returnedCount++
      }
    }

    const rate = (returnedCount / signups.length) * 100

    retentionData.push({
      day,
      rate: rate.toFixed(1),
      count: returnedCount,
      total: signups.length,
    })
  }

  return retentionData
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

/**
 * Get Battles Per User (BPU)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} BPU data
 */
const getBattlesPerUser = async ({ startDate, endDate }) => {
  // Get total battles in period
  const totalBattles = await QuickClashTeamBattle.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'completed',
  })

  // Get unique users who played
  const uniquePlayersAgg = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $project: {
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $group: {
        _id: null,
        uniqueUsers: {
          $addToSet: {
            $cond: [
              { $ne: ['$allMembers.user', null] },
              '$allMembers.user',
              null,
            ],
          },
        },
        uniqueSessions: {
          $addToSet: {
            $cond: [
              { $ne: ['$allMembers.sessionPlayer', null] },
              '$allMembers.sessionPlayer',
              null,
            ],
          },
        },
      },
    },
  ])

  let uniquePlayers = 0
  if (uniquePlayersAgg.length > 0) {
    const users = uniquePlayersAgg[0].uniqueUsers.filter(u => u !== null).length
    const sessions = uniquePlayersAgg[0].uniqueSessions.filter(s => s !== null).length
    uniquePlayers = users + sessions
  }

  const bpu = uniquePlayers > 0 ? totalBattles / uniquePlayers : 0

  // Calculate days in period
  const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const bpuPerDay = daysInPeriod > 0 ? bpu / daysInPeriod : 0

  return {
    bpu: bpu.toFixed(2),
    bpuPerDay: bpuPerDay.toFixed(2),
    totalBattles,
    uniquePlayers,
    target: 1.6,
    status: bpuPerDay >= 1.6 ? 'pass' : bpuPerDay >= 1.2 ? 'conditional' : 'fail',
    trend: 0,
  }
}

/**
 * Get multi-battle rate (2+ and 3+ battles)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Multi-battle rates
 */
const getMultiBattleRate = async ({ startDate, endDate }) => {
  // Aggregate battles per user
  const battleCounts = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $project: {
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $group: {
        _id: {
          $cond: [
            { $ne: ['$allMembers.user', null] },
            { $concat: ['user_', { $toString: '$allMembers.user' }] },
            { $concat: ['session_', { $toString: '$allMembers.sessionPlayer' }] },
          ],
        },
        battleCount: { $sum: 1 },
      },
    },
  ])

  const totalPlayers = battleCounts.length
  const playedTwoPlus = battleCounts.filter(b => b.battleCount >= 2).length
  const playedThreePlus = battleCounts.filter(b => b.battleCount >= 3).length

  return {
    twoPlusBattles: {
      count: playedTwoPlus,
      rate: totalPlayers > 0 ? ((playedTwoPlus / totalPlayers) * 100).toFixed(1) : 0,
      target: 20,
      status: totalPlayers > 0 && (playedTwoPlus / totalPlayers) * 100 >= 20 ? 'pass' : 'fail',
    },
    threePlusBattles: {
      count: playedThreePlus,
      rate: totalPlayers > 0 ? ((playedThreePlus / totalPlayers) * 100).toFixed(1) : 0,
      target: 10,
      status: totalPlayers > 0 && (playedThreePlus / totalPlayers) * 100 >= 10 ? 'pass' : 'fail',
    },
    totalPlayers,
  }
}

// ============================================================================
// STREAK ANALYTICS
// ============================================================================

/**
 * Get streak distribution
 * Uses quickClashStats.dayStreak for battle streaks
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Streak distribution data
 */
const getStreakDistribution = async ({ startDate, endDate }) => {
  // Get users with QuickClash streaks (excluding bots)
  const userStreaks = await User.aggregate([
    {
      $match: {
        email: { $not: /^dummy\d+@mail\.com$/ },
        'quickClashStats.dayStreak': { $gte: 1 },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $gte: ['$quickClashStats.dayStreak', 14] }, then: 'Champion (14+)' },
              { case: { $gte: ['$quickClashStats.dayStreak', 7] }, then: 'Expert (7-13)' },
              { case: { $gte: ['$quickClashStats.dayStreak', 4] }, then: 'Rising (4-6)' },
              { case: { $gte: ['$quickClashStats.dayStreak', 2] }, then: 'Started (2-3)' },
            ],
            default: 'Day 1',
          },
        },
        count: { $sum: 1 },
      },
    },
  ])

  // Session player streaks
  const sessionStreaks = await PlaySession.aggregate([
    {
      $match: {
        'streak.dayStreak': { $gte: 1 },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $gte: ['$streak.dayStreak', 14] }, then: 'Champion (14+)' },
              { case: { $gte: ['$streak.dayStreak', 7] }, then: 'Expert (7-13)' },
              { case: { $gte: ['$streak.dayStreak', 4] }, then: 'Rising (4-6)' },
              { case: { $gte: ['$streak.dayStreak', 2] }, then: 'Started (2-3)' },
            ],
            default: 'Day 1',
          },
        },
        count: { $sum: 1 },
      },
    },
  ])

  // Combine and format
  const tiers = ['Day 1', 'Started (2-3)', 'Rising (4-6)', 'Expert (7-13)', 'Champion (14+)']
  const distribution = {}

  tiers.forEach(tier => {
    const userCount = userStreaks.find(s => s._id === tier)?.count || 0
    const sessionCount = sessionStreaks.find(s => s._id === tier)?.count || 0
    distribution[tier] = { users: userCount, sessions: sessionCount, total: userCount + sessionCount }
  })

  // Calculate Day-2 streak rate (users who reached at least 2-day streak)
  const totalActiveUsers = await User.countDocuments({
    lastLogin: { $gte: startDate, $lte: endDate },
    ...BOT_FILTER,
  })

  const day2PlusStreaks = Object.entries(distribution)
    .filter(([tier]) => tier !== 'Day 1')
    .reduce((sum, [, data]) => sum + data.total, 0)

  const day2StreakRate = totalActiveUsers > 0 ? (day2PlusStreaks / totalActiveUsers) * 100 : 0

  return {
    distribution,
    day2StreakRate: {
      rate: day2StreakRate.toFixed(1),
      count: day2PlusStreaks,
      total: totalActiveUsers,
      target: 20,
      status: day2StreakRate >= 20 ? 'pass' : day2StreakRate >= 15 ? 'conditional' : 'fail',
    },
  }
}

// ============================================================================
// VIRAL K-COEFFICIENT
// ============================================================================

/**
 * Get comprehensive viral K-coefficient
 * Tracks: Team invite links, direct team invitations, friend requests
 * K = (invites per active user) × (conversion rate of invites)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} K-coefficient data
 */
const getViralCoefficient = async ({ startDate, endDate }) => {
  // Source 1: Team code link joins (session players who joined via shareable link)
  const teamCodeJoins = await PlaySession.countDocuments({
    invitedByTeam: { $ne: null },
    createdAt: { $gte: startDate, $lte: endDate },
  })

  // Source 2: Direct team invitations sent (in-app user → user invites)
  const teamInvitesSent = await ApplicationUpdates.countDocuments({
    type: 'teamInvitation',
    date: { $gte: startDate, $lte: endDate },
  })

  const teamInvitesAccepted = await ApplicationUpdates.countDocuments({
    type: 'teamInvitation',
    'invitationData.status': 'accepted',
    date: { $gte: startDate, $lte: endDate },
  })

  // Source 3: Friend requests sent (social viral loop)
  const friendRequestsSent = await ApplicationUpdates.countDocuments({
    type: 'friendRequest',
    date: { $gte: startDate, $lte: endDate },
  })

  const friendRequestsAccepted = await ApplicationUpdates.countDocuments({
    type: 'friendRequest',
    'friendRequestData.status': 'accepted',
    date: { $gte: startDate, $lte: endDate },
  })

  // Source 4: Session → Account conversions from team invites (successful viral conversions)
  const sessionConversions = await PlaySession.countDocuments({
    invitedByTeam: { $ne: null },
    convertedToUser: { $ne: null },
    createdAt: { $gte: startDate, $lte: endDate },
  })

  // Get active users (potential inviters) - excluding bots
  // Use direct regex since spread operator may not work in all contexts
  let activeUsers = await User.countDocuments({
    lastLogin: { $gte: startDate, $lte: endDate },
    email: { $not: /^dummy\d+@mail\.com$/ },
  })

  // Fallback: if lastLogin query returns 0, count all non-bot users
  if (activeUsers === 0) {
    activeUsers = await User.countDocuments({
      email: { $not: /^dummy\d+@mail\.com$/ },
    })
  }

  // Calculate K-coefficient
  // Total "invites" = team invites sent + friend requests + team code shares (estimated from joins)
  const totalInviteActions = teamInvitesSent + friendRequestsSent + teamCodeJoins

  // Total conversions = accepted team invites + accepted friend requests + session conversions
  const totalConversions = teamInvitesAccepted + friendRequestsAccepted + sessionConversions

  // K = (invites per user) × (conversion rate)
  // Simplified: K = totalConversions / activeUsers (new users brought per existing user)
  // For K > 1, each user brings in more than 1 new user = viral growth
  const invitesPerUser = activeUsers > 0 ? totalInviteActions / activeUsers : 0
  const conversionRate = totalInviteActions > 0 ? totalConversions / totalInviteActions : 0

  // Use simplified formula: K = total new users brought / active users
  const kCoefficient = activeUsers > 0 ? totalConversions / activeUsers : 0

  return {
    k: kCoefficient.toFixed(3),
    invitesPerUser: invitesPerUser.toFixed(2),
    conversionRate: (conversionRate * 100).toFixed(1),
    breakdown: {
      teamCodeJoins,           // Players who joined via team code link
      teamInvitesSent,         // In-app team invitations sent
      teamInvitesAccepted,     // Team invitations accepted
      friendRequestsSent,      // Friend requests sent
      friendRequestsAccepted,  // Friend requests accepted
      sessionConversions,      // Invited session players who created accounts
    },
    activeUsers,
    totalInviteActions,
    totalConversions,
    trend: 0,
  }
}

/**
 * Get viral K-coefficient trend over time
 * @param {number} days - Number of days to get trend for
 * @returns {Promise<Array>} Daily K-coefficient values
 */
const getViralTrend = async (days = 30) => {
  const trendData = []
  const endDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(endDate)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const kData = await getViralCoefficient({ startDate: dayStart, endDate: dayEnd })

    trendData.push({
      date: dayStart.toISOString().split('T')[0],
      k: parseFloat(kData.k),
    })
  }

  return trendData
}

// ============================================================================
// CONVERSION METRICS
// ============================================================================

/**
 * Get session to account conversion rate
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Conversion data
 */
const getSessionToAccountConversion = async ({ startDate, endDate }) => {
  const totalSessions = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  })

  const convertedSessions = await PlaySession.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    convertedToUser: { $ne: null },
  })

  const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0

  return {
    rate: conversionRate.toFixed(1),
    converted: convertedSessions,
    total: totalSessions,
    target: 20,
    status: conversionRate >= 20 ? 'pass' : conversionRate >= 15 ? 'conditional' : 'fail',
    trend: 0,
  }
}

// ============================================================================
// SOLO DRILL ANALYTICS
// ============================================================================

/**
 * Get comprehensive Solo Drill metrics
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Solo Drill analytics data
 */
const getSoloDrillMetrics = async ({ startDate, endDate }) => {
  // Get bot user IDs for exclusion
  const botUsers = await User.find({
    email: { $regex: /^dummy\d+@mail\.com$/ }
  }).select('_id')
  const botUserIds = botUsers.map(u => u._id)

  // --- Core counts ---
  const totalDrills = await SoloDrillSession.countDocuments({
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
  })

  const completedDrills = await SoloDrillSession.countDocuments({
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
    status: 'completed',
  })

  const abandonedDrills = await SoloDrillSession.countDocuments({
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
    status: 'abandoned',
  })

  const completionRate = totalDrills > 0 ? (completedDrills / totalDrills) * 100 : 0
  const abandonRate = totalDrills > 0 ? (abandonedDrills / totalDrills) * 100 : 0

  // --- Unique drillers ---
  const uniqueDrillers = await SoloDrillSession.distinct('user', {
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
  })
  const uniqueDrillerCount = uniqueDrillers.length

  // --- Adoption rate: drillers / active battle users ---
  const battleParticipants = await QuickClashTeamBattle.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'active'] },
      },
    },
    {
      $project: {
        allMembers: { $concatArrays: ['$teamAMembers', '$teamBMembers'] },
      },
    },
    { $unwind: '$allMembers' },
    {
      $match: {
        'allMembers.user': { $nin: botUserIds, $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        uniqueUsers: { $addToSet: '$allMembers.user' },
      },
    },
  ])
  const activeBattleUsers = battleParticipants[0]?.uniqueUsers?.length || 0
  const adoptionRate = activeBattleUsers > 0 ? (uniqueDrillerCount / activeBattleUsers) * 100 : 0

  // --- Scoring averages (completed only) ---
  const scoreAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        avgForgeScore: { $avg: '$forgeScore' },
        avgQuizScore: { $avg: '$quizScore' },
        avgTotalScore: { $avg: '$totalScore' },
      },
    },
  ])

  const avgForgeScore = scoreAgg[0]?.avgForgeScore?.toFixed(1) || '0'
  const avgQuizScore = scoreAgg[0]?.avgQuizScore?.toFixed(1) || '0'
  const avgTotalScore = scoreAgg[0]?.avgTotalScore?.toFixed(1) || '0'

  // --- Benchmark distribution ---
  const benchmarkAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
        status: 'completed',
        benchmark: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$benchmark',
        count: { $sum: 1 },
      },
    },
  ])

  const benchmarkDistribution = {
    rookie: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    diamond: 0,
  }
  benchmarkAgg.forEach(b => {
    if (benchmarkDistribution.hasOwnProperty(b._id)) {
      benchmarkDistribution[b._id] = b.count
    }
  })

  // --- Source split ---
  const sourceAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
      },
    },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 },
      },
    },
  ])

  const sourceSplit = { daily_free: 0, purchased: 0 }
  sourceAgg.forEach(s => {
    if (sourceSplit.hasOwnProperty(s._id)) {
      sourceSplit[s._id] = s.count
    }
  })

  // --- Top categories ---
  const categoryAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])

  const topCategories = categoryAgg.map(c => ({
    category: c._id,
    count: c.count,
  }))

  // --- Daily trend ---
  const dailyTrend = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        starts: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const dailyData = dailyTrend.map(d => ({
    date: d._id,
    starts: d.starts,
    completions: d.completions,
  }))

  // --- Previous period for trend ---
  const periodLength = endDate - startDate
  const prevStartDate = new Date(startDate - periodLength)
  const prevEndDate = new Date(startDate)

  const prevTotalDrills = await SoloDrillSession.countDocuments({
    startedAt: { $gte: prevStartDate, $lte: prevEndDate },
    user: { $nin: botUserIds },
  })
  const prevCompletedDrills = await SoloDrillSession.countDocuments({
    startedAt: { $gte: prevStartDate, $lte: prevEndDate },
    user: { $nin: botUserIds },
    status: 'completed',
  })
  const prevCompletionRate = prevTotalDrills > 0 ? (prevCompletedDrills / prevTotalDrills) * 100 : 0

  return {
    totalDrills,
    completedDrills,
    abandonedDrills,
    inProgressDrills: totalDrills - completedDrills - abandonedDrills,
    completionRate: completionRate.toFixed(1),
    abandonRate: abandonRate.toFixed(1),
    completionStatus: completionRate >= 50 ? 'pass' : completionRate >= 35 ? 'conditional' : 'fail',
    uniqueDrillers: uniqueDrillerCount,
    activeBattleUsers,
    adoptionRate: adoptionRate.toFixed(1),
    adoptionStatus: adoptionRate >= 10 ? 'pass' : adoptionRate >= 5 ? 'conditional' : 'fail',
    avgForgeScore,
    avgQuizScore,
    avgTotalScore,
    benchmarkDistribution,
    sourceSplit,
    topCategories,
    dailyTrend: dailyData,
    trend: calculateTrend(totalDrills, prevTotalDrills).toFixed(1),
    completionTrend: (completionRate - prevCompletionRate).toFixed(1),
  }

  // --- CUSTOM DRILL ANALYTICS ---
  // Specific metrics for "Custom Solo Drills" (source: 'custom')

  // 1. Total & Completed
  const customTotal = await SoloDrillSession.countDocuments({
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
    source: 'custom',
  })

  const customCompleted = await SoloDrillSession.countDocuments({
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
    source: 'custom',
    status: 'completed',
  })

  const customCompletionRate = customTotal > 0 ? (customCompleted / customTotal) * 100 : 0

  // 2. Average Scores (Completed Custom Drills only)
  const customScoreAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
        source: 'custom',
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        avgForge: { $avg: '$forgeScore' },
        avgQuiz: { $avg: '$quizScore' },
        avgTotal: { $avg: '$totalScore' },
      },
    },
  ])

  const customAvgScores = {
    forge: customScoreAgg[0]?.avgForge?.toFixed(1) || '0',
    quiz: customScoreAgg[0]?.avgQuiz?.toFixed(1) || '0',
    total: customScoreAgg[0]?.avgTotal?.toFixed(1) || '0',
  }

  // 3. Unique Custom Drillers
  const uniqueCustomDrillers = await SoloDrillSession.distinct('user', {
    startedAt: { $gte: startDate, $lte: endDate },
    user: { $nin: botUserIds },
    source: 'custom',
  })

  // 4. Popular Topics (Group by customInput)
  const popularTopicsAgg = await SoloDrillSession.aggregate([
    {
      $match: {
        startedAt: { $gte: startDate, $lte: endDate },
        user: { $nin: botUserIds },
        source: 'custom',
        customInput: { $ne: null }, // Ensure input exists
      },
    },
    {
      $group: {
        _id: '$customInput', // Group by the input text
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 }, // Top 5
  ])

  const popularTopics = popularTopicsAgg.map(t => ({
    topic: t._id,
    count: t.count,
  }))

  return {
    totalDrills,
    completedDrills,
    abandonedDrills,
    inProgressDrills: totalDrills - completedDrills - abandonedDrills,
    completionRate: completionRate.toFixed(1),
    abandonRate: abandonRate.toFixed(1),
    completionStatus: completionRate >= 50 ? 'pass' : completionRate >= 35 ? 'conditional' : 'fail',
    uniqueDrillers: uniqueDrillerCount,
    activeBattleUsers,
    adoptionRate: adoptionRate.toFixed(1),
    adoptionStatus: adoptionRate >= 10 ? 'pass' : adoptionRate >= 5 ? 'conditional' : 'fail',
    avgForgeScore,
    avgQuizScore,
    avgTotalScore,
    benchmarkDistribution,
    sourceSplit,
    topCategories,
    dailyTrend: dailyData,
    trend: calculateTrend(totalDrills, prevTotalDrills).toFixed(1),
    completionTrend: (completionRate - prevCompletionRate).toFixed(1),
    // NEW: Explicit Custom Drill Analytics
    customDrills: {
      total: customTotal,
      completed: customCompleted,
      completionRate: customCompletionRate.toFixed(1),
      avgScores: customAvgScores,
      uniqueDrillers: uniqueCustomDrillers.length,
      popularTopics,
    },
  }
}

// ============================================================================
// VALIDATION VERDICT
// ============================================================================

/**
 * Calculate overall validation verdict
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} Verdict with detailed breakdown
 */
const getValidationVerdict = async ({ startDate, endDate }) => {
  // Gather all metrics
  const [d1, d7, bpu, multiBattle, streak, conversion, soloDrill] = await Promise.all([
    getD1Retention({ startDate, endDate }),
    getD7Retention({ startDate, endDate }),
    getBattlesPerUser({ startDate, endDate }),
    getMultiBattleRate({ startDate, endDate }),
    getStreakDistribution({ startDate, endDate }),
    getSessionToAccountConversion({ startDate, endDate }),
    getSoloDrillMetrics({ startDate, endDate }),
  ])

  // Evaluate each criterion
  const criteria = {
    d1Retention: {
      value: parseFloat(d1.rate),
      target: 25,
      conditionalMin: 20,
      status: d1.status,
    },
    d7Retention: {
      value: parseFloat(d7.rate),
      target: 10,
      conditionalMin: 7,
      status: d7.status,
    },
    bpuPerDay: {
      value: parseFloat(bpu.bpuPerDay),
      target: 1.6,
      conditionalMin: 1.2,
      status: bpu.status,
    },
    twoPlusBattles: {
      value: parseFloat(multiBattle.twoPlusBattles.rate),
      target: 20,
      conditionalMin: 15,
      status: multiBattle.twoPlusBattles.status,
    },
    threePlusBattles: {
      value: parseFloat(multiBattle.threePlusBattles.rate),
      target: 10,
      conditionalMin: 8,
      status: multiBattle.threePlusBattles.status,
    },
    day2Streak: {
      value: parseFloat(streak.day2StreakRate.rate),
      target: 20,
      conditionalMin: 15,
      status: streak.day2StreakRate.status,
    },
    sessionConversion: {
      value: parseFloat(conversion.rate),
      target: 20,
      conditionalMin: 15,
      status: conversion.status,
    },
    drillAdoption: {
      value: parseFloat(soloDrill.adoptionRate),
      target: 10,
      conditionalMin: 5,
      status: soloDrill.adoptionStatus,
    },
    drillCompletionRate: {
      value: parseFloat(soloDrill.completionRate),
      target: 50,
      conditionalMin: 35,
      status: soloDrill.completionStatus,
    },
  }

  // Count statuses
  const statusCounts = { pass: 0, conditional: 0, fail: 0 }
  Object.values(criteria).forEach(c => {
    statusCounts[c.status]++
  })

  // Determine overall verdict
  let verdict = 'PASS'
  let reason = 'All key metrics meet or exceed targets'

  if (statusCounts.fail >= 3) {
    verdict = 'FAIL'
    reason = 'Multiple critical metrics below minimum thresholds'
  } else if (statusCounts.fail >= 1 || statusCounts.conditional >= 3) {
    verdict = 'CONDITIONAL PASS'
    reason = 'Some metrics need improvement but core engagement is present'
  }

  return {
    verdict,
    reason,
    criteria,
    statusCounts,
    recommendation: verdict === 'PASS'
      ? 'Ready to scale - focus on growth channels'
      : verdict === 'CONDITIONAL PASS'
        ? 'Iterate on weak areas before scaling'
        : 'Significant product improvements needed before scaling',
  }
}

// ============================================================================
// OVERVIEW/DASHBOARD SUMMARY
// ============================================================================

/**
 * Get dashboard overview with all KPIs
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Object>} All KPIs for dashboard header
 */
const getAnalyticsOverview = async ({ startDate, endDate }) => {
  const [footfall, d1, d7, bpu, kCoef, bounce, verdict, soloDrill] = await Promise.all([
    getTotalFootfall({ startDate, endDate }),
    getD1Retention({ startDate, endDate }),
    getD7Retention({ startDate, endDate }),
    getBattlesPerUser({ startDate, endDate }),
    getViralCoefficient({ startDate, endDate }),
    getBounceRates({ startDate, endDate }),
    getValidationVerdict({ startDate, endDate }),
    getSoloDrillMetrics({ startDate, endDate }),
  ])

  return {
    footfall,
    d1Retention: d1,
    d7Retention: d7,
    bpu,
    kCoefficient: kCoef,
    bounceRate: bounce,
    soloDrill: {
      totalDrills: soloDrill.totalDrills,
      completionRate: soloDrill.completionRate,
      completionStatus: soloDrill.completionStatus,
      adoptionRate: soloDrill.adoptionRate,
      adoptionStatus: soloDrill.adoptionStatus,
      uniqueDrillers: soloDrill.uniqueDrillers,
      trend: soloDrill.trend,
    },
    verdict,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  }
}

// ============================================================================
// ACCESS CONTROL FUNCTIONS
// ============================================================================

/**
 * Check if user has analytics access
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Has access
 */
const hasAnalyticsAccess = async (userId) => {
  // Check if user is admin
  const user = await User.findById(userId).select('role')
  if (user?.role === 'admin') return true

  // Check analytics admin whitelist
  const access = await AnalyticsAdmin.findOne({
    user: userId,
    isActive: true,
  })

  return !!access
}

/**
 * Grant analytics access to a user
 * @param {Object} params - { userId, grantedBy, accessLevel, notes }
 * @returns {Promise<Object>} Created access record
 */
const grantAnalyticsAccess = async ({ userId, grantedBy, accessLevel = 'viewer', notes = '' }) => {
  const existing = await AnalyticsAdmin.findOne({ user: userId })

  if (existing) {
    existing.isActive = true
    existing.grantedBy = grantedBy
    existing.grantedAt = new Date()
    existing.accessLevel = accessLevel
    existing.notes = notes
    await existing.save()
    return existing
  }

  const access = new AnalyticsAdmin({
    user: userId,
    grantedBy,
    accessLevel,
    notes,
  })

  await access.save()
  return access
}

/**
 * Revoke analytics access
 * @param {string} userId - User ID to revoke access for
 * @returns {Promise<boolean>} Success
 */
const revokeAnalyticsAccess = async (userId) => {
  const result = await AnalyticsAdmin.updateOne(
    { user: userId },
    { isActive: false }
  )
  return result.modifiedCount > 0
}

/**
 * Get list of users with analytics access
 * @returns {Promise<Array>} List of users with access
 */
const getAnalyticsAccessList = async () => {
  const accessList = await AnalyticsAdmin.find({ isActive: true })
    .populate('user', 'name email inGameName')
    .populate('grantedBy', 'name email')
    .sort({ grantedAt: -1 })

  return accessList
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Footfall & Traffic
  getTotalFootfall,
  getDailyActiveUsers,
  getNewVsReturning,
  getTrafficBySource,

  // Bounce Rates
  getBounceRates,

  // Retention
  getD1Retention,
  getD7Retention,
  getRetentionCurve,

  // Engagement
  getBattlesPerUser,
  getMultiBattleRate,

  // Streaks
  getStreakDistribution,

  // Viral
  getViralCoefficient,
  getViralTrend,

  // Solo Drill
  getSoloDrillMetrics,

  // Conversion
  getSessionToAccountConversion,

  // Verdict
  getValidationVerdict,

  // Overview
  getAnalyticsOverview,

  // Access Control
  hasAnalyticsAccess,
  grantAnalyticsAccess,
  revokeAnalyticsAccess,
  getAnalyticsAccessList,

  // Helpers
  getDateRange,
}
