// services/playSessionService.js
// Spark Engine - PlaySession service for frictionless viral invites
const PlaySession = require('../model/quickClashSchemas/playSessionSchema')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const User = require('../model/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

/**
 * Create a new PlaySession
 * @param {Object} params
 * @param {string} params.inGameName - User-chosen name
 * @param {string} [params.deviceFingerprint] - Device fingerprint for return visits
 * @param {string} [params.invitedByTeam] - Team code if joining via invite
 * @returns {Promise<{session: Object, token: string}>}
 */
const createSession = async ({ inGameName, deviceFingerprint, invitedByTeam }) => {
  // Validate in-game name
  if (!inGameName || inGameName.trim().length === 0) {
    throw new Error('In-game name is required')
  }

  const trimmedName = inGameName.trim()

  if (trimmedName.length > 16) {
    throw new Error('In-game name cannot exceed 16 characters')
  }

  if (trimmedName.includes(' ')) {
    throw new Error('In-game name cannot contain spaces')
  }

  // Check for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(trimmedName)) {
    throw new Error('Email cannot be used as an in-game name')
  }

  // Check uniqueness against existing Users (case-insensitive)
  const existingUser = await User.findOne({
    inGameName: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
  })
  if (existingUser) {
    throw new Error('This name is already taken. Please choose a different name.')
  }

  // Check uniqueness against existing PlaySessions (case-insensitive, only active sessions)
  const existingSession = await PlaySession.findOne({
    inGameName: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    convertedToUser: null, // Only check unconverted sessions
  })
  if (existingSession) {
    throw new Error('This name is already taken. Please choose a different name.')
  }

  // Create the session
  const session = new PlaySession({
    inGameName: trimmedName,
    deviceFingerprint,
    invitedByTeam,
  })

  await session.save()

  // Generate a session token (similar to user auth token)
  const token = jwt.sign(
    { sessionId: session.sessionId, type: 'playSession' },
    process.env.SECRET_KEY
  )

  return { session, token }
}

/**
 * Get an existing session by sessionId
 * @param {Object} params
 * @param {string} params.sessionId
 * @returns {Promise<Object|null>}
 */
const getSession = async ({ sessionId }) => {
  return PlaySession.findOne({ sessionId, convertedToUser: null })
}

/**
 * Get session by device fingerprint (for return visits)
 * @param {Object} params
 * @param {string} params.deviceFingerprint
 * @returns {Promise<Object|null>}
 */
const getSessionByFingerprint = async ({ deviceFingerprint }) => {
  // Strict validation - fingerprint must be a non-empty string
  if (!deviceFingerprint || typeof deviceFingerprint !== 'string' || deviceFingerprint.length < 10) {
    return null
  }

  return PlaySession.findOne({
    deviceFingerprint,
    convertedToUser: null
  }).sort({ lastActiveAt: -1 })
}

/**
 * Create a new team for a session player
 * @param {Object} params
 * @param {string} params.sessionId - PlaySession ID
 * @returns {Promise<Object>} Created team
 */
const createTeamForSession = async ({ sessionId }) => {
  const session = await PlaySession.findOne({ sessionId, convertedToUser: null })
  if (!session) {
    throw new Error('Session not found')
  }

  // Check if session already has a team
  if (session.currentTeamId) {
    const existingTeam = await QuickClashTeam.findById(session.currentTeamId)
    if (existingTeam) {
      return existingTeam
    }
  }

  // Create a new team with the session player as the leader
  const team = new QuickClashTeam({
    name: `${session.inGameName}'s Squad`,
    creator: null, // No user creator for session teams
    teamType: 'manual', // Valid enum: 'manual' or 'auto'
    maxMembers: 4,
    members: [
      {
        sessionPlayer: session._id,
        role: 'leader',
        status: 'accepted',
        joinedAt: new Date(),
      },
    ],
    lastActive: new Date(),
  })

  await team.save()

  // Update session's current team
  session.currentTeamId = team._id
  session.lastActiveAt = new Date()
  await session.save()

  return team
}

/**
 * Join a team as a session player
 * @param {Object} params
 * @param {string} params.teamCode - Team code to join
 * @param {string} params.sessionId - PlaySession ID
 * @returns {Promise<Object>} Updated team
 */
const joinTeamAsSession = async ({ teamCode, sessionId }) => {
  const session = await PlaySession.findOne({ sessionId, convertedToUser: null })
  if (!session) {
    throw new Error('Session not found')
  }

  const team = await QuickClashTeam.findOne({ teamCode })
  if (!team) {
    throw new Error('Team not found')
  }

  if (team.isInMatch) {
    throw new Error('Team is currently in a match')
  }

  if (team.members.length >= team.maxMembers) {
    throw new Error('Team is full')
  }

  // Check if session player already in this team
  const existingMember = team.members.find(
    m => m.sessionPlayer?.toString() === session._id.toString()
  )
  if (existingMember) {
    throw new Error('Already in this team')
  }

  // Add session player to team
  team.members.push({
    sessionPlayer: session._id,
    role: 'member',
    status: 'accepted',
    joinedAt: new Date(),
  })

  team.lastActive = new Date()
  await team.save()

  // Update session's current team
  session.currentTeamId = team._id
  session.lastActiveAt = new Date()
  await session.save()

  // Notify team members
  const globalEmitter = require('../eventEmitter')
  const teamInfo = await getPublicTeamInfo({ teamCode: team.teamCode })

  globalEmitter.emit('quickClash:teamUpdated', {
    teamId: team._id.toString(),
    team: teamInfo
  })

  return team
}

/**
 * Get public team info for invite preview
 * @param {Object} params
 * @param {string} params.teamCode
 * @returns {Promise<Object>}
 */
const getPublicTeamInfo = async ({ teamCode }) => {
  const team = await QuickClashTeam.findOne({ teamCode })
    .populate('members.user', 'inGameName pic quickClashTrophies')
    .lean()

  if (!team) {
    throw new Error('Team not found')
  }

  // Also populate session players
  const sessionPlayerIds = team.members
    .filter(m => m.sessionPlayer)
    .map(m => m.sessionPlayer)

  const sessionPlayers = await PlaySession.find({
    _id: { $in: sessionPlayerIds },
  }).lean()

  const sessionPlayerMap = new Map(
    sessionPlayers.map(sp => [sp._id.toString(), sp])
  )

  return {
    _id: team._id, // Include team ID for matchmaking
    teamCode: team.teamCode,
    name: team.name,
    memberCount: team.members.length,
    maxMembers: team.maxMembers,
    avgTrophies: team.avgTrophies,
    isInMatch: team.isInMatch,
    members: team.members.map(m => {
      if (m.user) {
        return {
          type: 'user',
          inGameName: m.user.inGameName,
          pic: m.user.pic,
          trophies: m.user.quickClashTrophies,
          role: m.role,
        }
      } else if (m.sessionPlayer) {
        const sp = sessionPlayerMap.get(m.sessionPlayer.toString())
        return {
          type: 'session',
          sessionId: sp?.sessionId, // Include sessionId to identify current user
          inGameName: sp?.inGameName || 'Player',
          trophies: sp?.trophies || 1000,
          role: m.role,
        }
      }
      return null
    }).filter(Boolean),
  }
}

/**
 * Convert PlaySession to full User account
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {Object} params.userData - { name, email, password, pic }
 * @returns {Promise<Object>} New user
 */
const convertToUser = async ({ sessionId, userData }) => {
  const session = await PlaySession.findOne({ sessionId, convertedToUser: null })
  if (!session) {
    throw new Error('Session not found or already converted')
  }

  const { name, email, password, pic } = userData

  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Check if email exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('Email already in use')
  }

  // Check if in-game name exists (for users)
  const existingName = await User.findOne({ inGameName: session.inGameName })
  if (existingName) {
    throw new Error('In-game name already taken. Please choose a different name.')
  }

  // Create new user with session stats
  const user = new User({
    name: name || session.inGameName,
    email,
    password,
    cpassword: password,
    pic: pic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    inGameName: session.inGameName,
    verified: false, // Will need email verification
    quickClashTrophies: session.trophies,
    quickClashStats: {
      currentWinStreak: 0,
      streakProtectionAvailable: false,
      peakTrophies: session.stats.peakTrophies,
    },
    needsOnboarding: false, // Skip onboarding for converted users
  })

  await user.save()

  // Mark session as converted
  session.convertedToUser = user._id
  session.convertedAt = new Date()
  await session.save()

  // Migrate session player's team memberships to user
  await migrateSessionTeams(session._id, user._id)

  // Transfer all session battles to the user
  await migrateSessionBattles(session._id, user._id)

  // Generate auth token (Using ACCESS_TOKEN_SECRET to match authenticate middleware)
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )

  return { user, token }
}

/**
 * Generate invite URL for a team
 * @param {Object} params
 * @param {string} params.teamId
 * @returns {Promise<string>}
 */
const generateInviteUrl = async ({ teamId }) => {
  const team = await QuickClashTeam.findById(teamId)
  if (!team) {
    throw new Error('Team not found')
  }

  // Base URL - should be configured via env
  const baseUrl = process.env.CLIENT_URL || 'https://wiseweb.app'
  return `${baseUrl}/play/join/${team.teamCode}`
}

/**
 * Join matchmaking queue as a session player team
 * @param {Object} params
 * @param {string} params.sessionId - PlaySession ID
 * @param {string} params.teamId - Team ID to enter matchmaking
 * @returns {Promise<Object>} Matchmaking result
 */
const joinMatchmakingQueue = async ({ sessionId, teamId }) => {
  const session = await PlaySession.findOne({ sessionId, convertedToUser: null })
  if (!session) {
    throw new Error('Session not found')
  }

  const team = await QuickClashTeam.findById(teamId)
  if (!team) {
    throw new Error('Team not found')
  }

  // Verify session is part of this team
  const isMember = team.members.some(
    m => m.sessionPlayer?.toString() === session._id.toString()
  )
  if (!isMember) {
    throw new Error('Session is not a member of this team')
  }

  // Verify session is the leader (only leader can start matchmaking)
  const isLeader = team.members.some(
    m => m.sessionPlayer?.toString() === session._id.toString() && m.role === 'leader'
  )
  if (!isLeader) {
    throw new Error('Only the team leader can start matchmaking')
  }

  // Mark all members as ready (for session teams this is automatic)
  for (const member of team.members) {
    member.status = 'ready'
  }
  await team.save()

  // For session-only teams, we create the matchmaking entry directly
  // since the existing joinTeamMatchmaking expects member.user which session teams don't have
  const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')

  // Check if team is already in matchmaking
  let matchmakingEntry = await QuickClashTeamMatchmaking.findOne({ team: team._id })

  const MATCHMAKING_EXPIRY = 10 * 60 * 1000 // 10 minutes

  if (matchmakingEntry) {
    // Update existing entry
    matchmakingEntry.status = 'available'
    matchmakingEntry.lastActive = new Date()
    matchmakingEntry.expiresAt = new Date(Date.now() + MATCHMAKING_EXPIRY)
    matchmakingEntry.avgTrophies = team.avgTrophies || 1000
    matchmakingEntry.memberCount = team.members.length
    await matchmakingEntry.save()
  } else {
    // Create new entry
    matchmakingEntry = new QuickClashTeamMatchmaking({
      team: team._id,
      avgTrophies: team.avgTrophies || 1000,
      memberCount: team.members.length,
      expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
    })
    await matchmakingEntry.save()
  }

  // Emit event to notify all team members that matchmaking has started
  const globalEmitter = require('../eventEmitter')
  setTimeout(() => {
    globalEmitter.emit('quickClash:teamJoinedMatchmaking', {
      teamId: team._id.toString(),
      teamName: team.name,
      avgTrophies: team.avgTrophies || 1000,
      memberCount: team.members.length,
      isSessionTeam: true,
      matchmakingId: matchmakingEntry._id.toString(),
    })
    console.log(`[QC_MM] Emitted quickClash:teamJoinedMatchmaking for session team ${team._id}`)
  }, 0)

  return {
    teamId: team._id,
    teamCode: team.teamCode,
    memberCount: team.members.length,
    status: 'queued',
    matchmakingId: matchmakingEntry._id,
  }
}

/**
 * Convert a PlaySession to a User via Google OAuth
 * Handles both new Google users and existing users linking a session
 * @param {Object} params
 * @param {string} params.sessionId - PlaySession's sessionId
 * @param {Object} params.googleUserInfo - Decoded Google JWT info { email, name, sub }
 * @returns {Promise<{user: Object, token: string, isNewUser: boolean}>}
 */
const convertWithGoogle = async ({ sessionId, googleUserInfo }) => {
  const session = await PlaySession.findOne({ sessionId, convertedToUser: null })
  if (!session) {
    throw new Error('Session not found or already converted')
  }

  const { email, name, sub: googleId } = googleUserInfo

  if (!email || !googleId) {
    throw new Error('Invalid Google credentials')
  }

  // Check if Google account already exists
  let existingUser = await User.findOne({
    $or: [
      { email },
      { googleEmail: email },
      { googleId },
    ],
  })

  let user
  let isNewUser = false

  if (existingUser) {
    // EXISTING GOOGLE USER - Link session to their account
    // Merge session stats into existing user stats
    existingUser.quickClashTrophies = Math.max(
      existingUser.quickClashTrophies || 1000,
      session.trophies
    )

    // Merge stats (add session stats to existing user stats)
    if (!existingUser.quickClashStats) {
      existingUser.quickClashStats = {}
    }
    existingUser.quickClashStats.peakTrophies = Math.max(
      existingUser.quickClashStats.peakTrophies || 1000,
      session.stats.peakTrophies
    )

    // Link Google if not already linked
    if (!existingUser.googleId) existingUser.googleId = googleId
    if (!existingUser.googleEmail) existingUser.googleEmail = email
    existingUser.verified = true

    await existingUser.save()
    user = existingUser
  } else {
    // NEW GOOGLE USER - Create account with session data
    const nameParts = (name || 'Player').split(' ')
    const displayName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
      : nameParts[0]

    user = new User({
      name: displayName,
      email,
      inGameName: session.inGameName,
      googleId,
      googleEmail: email,
      verified: true,
      needsOnboarding: false,
      // Transfer ALL session stats
      quickClashTrophies: session.trophies,
      quickClashStats: {
        wins: session.stats.wins || 0,
        losses: session.stats.losses || 0,
        totalMatches: session.stats.totalMatches || 0,
        totalScore: session.stats.totalScore || 0,
        avgScore: session.stats.avgScore || 0,
        peakTrophies: session.stats.peakTrophies || 1000,
        currentWinStreak: 0,
        streakProtectionAvailable: false,
      },
    })

    await user.save()
    isNewUser = true
  }

  // Mark session as converted
  session.convertedToUser = user._id
  session.convertedAt = new Date()
  await session.save()

  // Migrate team memberships from session to user
  await migrateSessionTeams(session._id, user._id)

  // Transfer all session battles to the user
  await migrateSessionBattles(session._id, user._id)

  // Generate auth token (Using ACCESS_TOKEN_SECRET to match authenticate middleware)
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )

  return { user, token, isNewUser }
}

/**
 * Migrate all battles from a session player to a user
 * @param {string} sessionId
 * @param {string} userId
 */
const migrateSessionBattles = async (sessionId, userId) => {
  const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')

  // Find all battles where this session player participated
  const battles = await QuickClashTeamBattle.find({
    $or: [
      { 'teamAMembers.sessionPlayer': sessionId },
      { 'teamBMembers.sessionPlayer': sessionId }
    ]
  })

  console.log(`[SessionConversion] Migrating ${battles.length} battles for session ${sessionId}`)

  for (const battle of battles) {
    let modified = false

    // Check Team A members
    for (const member of battle.teamAMembers) {
      if (member.sessionPlayer && member.sessionPlayer.toString() === sessionId.toString()) {
        member.user = userId
        member.sessionPlayer = null
        modified = true
      }
    }

    // Check Team B members
    for (const member of battle.teamBMembers) {
      if (member.sessionPlayer && member.sessionPlayer.toString() === sessionId.toString()) {
        member.user = userId
        member.sessionPlayer = null
        modified = true
      }
    }

    if (modified) {
      await battle.save()
    }
  }

  // Migrate Team Trophy History
  const QuickClashTeamTrophyHistory = require('../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
  const trophyHistories = await QuickClashTeamTrophyHistory.find({ sessionPlayer: sessionId })

  console.log(`[SessionConversion] Migrating ${trophyHistories.length} trophy history records for session ${sessionId}`)

  for (const history of trophyHistories) {
    history.user = userId
    history.sessionPlayer = null
    history.userParticipated = true
    await history.save()
  }

  // REPAIR STEP: Also find records already moved to User but missing the flag OR missing score
  const brokenHistories = await QuickClashTeamTrophyHistory.find({
    user: userId,
    $or: [
      { userParticipated: false },
      { userParticipated: { $exists: false } },
      { userScore: 0 },
      { userScore: { $exists: false } }
    ]
  }).populate('teamBattle')

  if (brokenHistories.length > 0) {
    console.log(`[SessionConversion] Repairing ${brokenHistories.length} broken history records for user ${userId}`)
    for (const history of brokenHistories) {
      history.userParticipated = true

      // Attempt to backfill score if missing/zero
      if ((!history.userScore || history.userScore === 0) && history.teamBattle) {
        const battle = history.teamBattle
        const member = battle.teamAMembers.find(m => m.user?.toString() === userId.toString()) ||
                       battle.teamBMembers.find(m => m.user?.toString() === userId.toString())

        if (member && member.score > 0) {
           history.userScore = member.score
        }
      }

      await history.save()
    }
  }

  // Force recalculate stats for the user to ensure consistency
  await recalculateUserStats(userId)
}

/**
 * Recalculate and save user stats based on battle history
 * @param {string} userId
 */
const recalculateUserStats = async (userId) => {
  const User = require('../model/userSchema')
  const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')

  console.log(`[StatsRecalc] Recalculating stats for user ${userId}`)

  // Find all COMPLETED battles for this user
  const battles = await QuickClashTeamBattle.find({
    $or: [{ 'teamAMembers.user': userId }, { 'teamBMembers.user': userId }],
    status: { $in: ['completed', 'expired'] } // Only count finished battles
  })

  let wins = 0
  let losses = 0
  let draws = 0
  let totalScore = 0

  for (const battle of battles) {
    // Determine which team the user was on
    const isTeamA = battle.teamAMembers.some(m => m.user?.toString() === userId.toString())
    const userTeam = isTeamA ? 'teamA' : 'teamB'
    const memberData = isTeamA
      ? battle.teamAMembers.find(m => m.user?.toString() === userId.toString())
      : battle.teamBMembers.find(m => m.user?.toString() === userId.toString())

    // Score
    if (memberData) {
      totalScore += (memberData.score || 0)
    }

    // Win/Loss
    if (battle.winner === 'tie') {
      draws++
    } else if (battle.winner === userTeam) {
      wins++
    } else if (battle.winner) {
      losses++
    }
  }

  // Calculate Current Win Streak
  // Sort battles by date descending to find the streak
  battles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  let currentWinStreak = 0
  for (const battle of battles) {
    const isTeamA = battle.teamAMembers.some(m => m.user?.toString() === userId.toString())
    const userTeam = isTeamA ? 'teamA' : 'teamB'

    if (battle.winner === userTeam) {
      currentWinStreak++
    } else {
      // Streak broken (loss or tie breaks streak)
      break
    }
  }

  const totalMatches = wins + losses + draws
  const avgScore = totalMatches > 0 ? Math.round(totalScore / totalMatches) : 0

  console.log(`[StatsRecalc] Computed: ${wins}W-${losses}L-${draws}D, Avg: ${avgScore}, Streak: ${currentWinStreak}`)

  // Update User
  await User.findByIdAndUpdate(userId, {
    $set: {
      'quickClashStats.wins': wins,
      'quickClashStats.losses': losses,
      'quickClashStats.draws': draws,
      'quickClashStats.totalMatches': totalMatches,
      'quickClashStats.totalScore': totalScore,
      'quickClashStats.avgScore': avgScore,
      'quickClashStats.currentWinStreak': currentWinStreak
    }
  })
}

/**
 * Migrate all team memberships from a session player to a user
 * @param {string} sessionId
 * @param {string} userId
 */
const migrateSessionTeams = async (sessionId, userId) => {
  const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
  const globalEmitter = require('../eventEmitter')

  // Find all teams where this session player is a member
  const teams = await QuickClashTeam.find({
    'members.sessionPlayer': sessionId
  })

  console.log(`[SessionConversion] Migrating ${teams.length} teams for session ${sessionId}`)

  for (const team of teams) {
    let modified = false
    let isLeader = false

    // Find and update the member entry
    const memberIndex = team.members.findIndex(
      m => m.sessionPlayer?.toString() === sessionId.toString()
    )

    if (memberIndex !== -1) {
      const member = team.members[memberIndex]

      // Update member fields
      member.user = userId
      member.sessionPlayer = null

      // Check if they were the leader
      if (member.role === 'leader') {
        isLeader = true
      }

      modified = true
    }

    if (modified) {
      // If they were the leader, update the team creator
      if (isLeader) {
        team.creator = userId
        // If it was a default session team name, maybe we should update it?
        // For now preventing name change to avoid confusion, but we could make it "{User}'s Squad"
      }

      await team.save()

      // Emit update event so clients refresh
      // We need to re-fetch to get populated user data for the event
      const teamInfo = await getPublicTeamInfo({ teamCode: team.teamCode })

      globalEmitter.emit('quickClash:teamUpdated', {
        teamId: team._id.toString(),
        team: teamInfo
      })

      console.log(`[SessionConversion] Migrated team ${team.teamCode} for user ${userId}`)
    }
  }
}

module.exports = {
  createSession,
  createTeamForSession,
  getSession,
  getSessionByFingerprint,
  joinTeamAsSession,
  joinMatchmakingQueue,
  getPublicTeamInfo,
  convertToUser,
  convertWithGoogle,
  generateInviteUrl,
  migrateSessionBattles,
  migrateSessionTeams,
  recalculateUserStats,
}
