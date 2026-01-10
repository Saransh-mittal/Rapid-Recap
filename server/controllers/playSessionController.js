// controllers/playSessionController.js
// Spark Engine - PlaySession controller for frictionless viral invites
const asyncHandler = require('express-async-handler')
const playSessionService = require('../services/playSessionService')

/**
 * @desc    Create a new PlaySession
 * @route   POST /api/play/session
 * @access  Public
 */
const createSession = asyncHandler(async (req, res) => {
  const { inGameName, deviceFingerprint, invitedByTeam } = req.body

  if (!inGameName) {
    return res.status(400).json({ error: 'In-game name is required' })
  }

  try {
    const { session, token } = await playSessionService.createSession({
      inGameName,
      deviceFingerprint,
      invitedByTeam,
    })

    // Set cookie for session token
    res.cookie('playSessionToken', token, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      httpOnly: true,
      sameSite: 'lax',
    })

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        sessionId: session.sessionId,
        inGameName: session.inGameName,
        trophies: session.trophies,
        stats: session.stats,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Get existing session
 * @route   GET /api/play/session/:sessionId
 * @access  Public
 */
const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  const session = await playSessionService.getSession({ sessionId })

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  res.status(200).json({
    session: {
      sessionId: session.sessionId,
      inGameName: session.inGameName,
      trophies: session.trophies,
      stats: session.stats,
      currentTeamId: session.currentTeamId,
    },
  })
})

/**
 * @desc    Get session by device fingerprint (for return visits)
 * @route   POST /api/play/session/restore
 * @access  Public
 */
const restoreSession = asyncHandler(async (req, res) => {
  const { deviceFingerprint, sessionId } = req.body

  // Try sessionId first, then fingerprint
  let session = null

  if (sessionId) {
    session = await playSessionService.getSession({ sessionId })
  }

  if (!session && deviceFingerprint) {
    session = await playSessionService.getSessionByFingerprint({ deviceFingerprint })
  }

  if (!session) {
    return res.status(404).json({ error: 'No session found' })
  }

  res.status(200).json({
    session: {
      sessionId: session.sessionId,
      inGameName: session.inGameName,
      trophies: session.trophies,
      stats: session.stats,
      currentTeamId: session.currentTeamId,
    },
  })
})

/**
 * @desc    Join team as session player
 * @route   POST /api/play/join/:teamCode
 * @access  Public (requires session)
 */
const joinTeam = asyncHandler(async (req, res) => {
  const { teamCode } = req.params
  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    const team = await playSessionService.joinTeamAsSession({ teamCode, sessionId })

    res.status(200).json({
      message: 'Joined team successfully',
      team: {
        _id: team._id,
        teamCode: team.teamCode,
        name: team.name,
        memberCount: team.members.length,
        maxMembers: team.maxMembers,
      },
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Get public team info for invite preview
 * @route   GET /api/play/team/:teamCode/info
 * @access  Public
 */
const getTeamInfo = asyncHandler(async (req, res) => {
  const { teamCode } = req.params

  try {
    const teamInfo = await playSessionService.getPublicTeamInfo({ teamCode })
    res.status(200).json({ team: teamInfo })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

/**
 * @desc    Convert session to full user account
 * @route   POST /api/play/convert
 * @access  Public (requires session)
 */
const convertToUser = asyncHandler(async (req, res) => {
  const { sessionId, name, email, password, pic } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    const { user, token } = await playSessionService.convertToUser({
      sessionId,
      userData: { name, email, password, pic },
    })

    // Set user auth cookie
    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
    })

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        inGameName: user.inGameName,
        pic: user.pic,
        quickClashTrophies: user.quickClashTrophies,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Convert session to full user account via Google OAuth
 * @route   POST /api/play/convert/google
 * @access  Public (requires session)
 */
const convertWithGoogle = asyncHandler(async (req, res) => {
  const { sessionId, credential, googleUserInfo: directUserInfo, code } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  // Accept either credential (ID token), direct googleUserInfo, or authorization code
  if (!credential && !directUserInfo && !code) {
    return res.status(400).json({ error: 'Google credential, user info, or authorization code is required' })
  }

  try {
    let googleUserInfo

    if (code) {
      // Authorization code flow - exchange code for tokens server-side
      const axios = require('axios')

      // Exchange authorization code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: 'postmessage', // Required for popup/JS flows
        grant_type: 'authorization_code',
      })

      const { access_token } = tokenResponse.data

      // Fetch user info using the access token
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      googleUserInfo = {
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        sub: userInfoResponse.data.sub,
      }
    } else if (credential) {
      // ID token flow - decode JWT
      const jwt = require('jsonwebtoken')
      const decoded = jwt.decode(credential)

      if (!decoded || !decoded.email) {
        return res.status(400).json({ error: 'Invalid Google credential' })
      }

      googleUserInfo = {
        email: decoded.email,
        name: decoded.name,
        sub: decoded.sub,
      }
    } else {
      // Access token flow - user info passed directly (legacy)
      if (!directUserInfo.email || !directUserInfo.sub) {
        return res.status(400).json({ error: 'Invalid Google user info' })
      }

      googleUserInfo = {
        email: directUserInfo.email,
        name: directUserInfo.name,
        sub: directUserInfo.sub,
      }
    }

    const { user, token, isNewUser } = await playSessionService.convertWithGoogle({
      sessionId,
      googleUserInfo,
    })

    // Set user auth cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    })

    res.status(201).json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Session linked to existing account',
      isNewUser,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        inGameName: user.inGameName,
        pic: user.pic,
        role: user.role,
        quickClashTrophies: user.quickClashTrophies,
        quickClashStats: user.quickClashStats,
      },
      token,
    })
  } catch (error) {
    console.error('Convert with Google error:', error.response?.data || error)
    res.status(400).json({ error: error.response?.data?.error_description || error.message })
  }
})

/**
 * @desc    Generate invite URL for a team
 * @route   POST /api/play/invite
 * @access  Private (requires auth or session)
 */
const generateInviteUrl = asyncHandler(async (req, res) => {
  const { teamId } = req.body

  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' })
  }

  try {
    const inviteUrl = await playSessionService.generateInviteUrl({ teamId })
    res.status(200).json({ inviteUrl })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Create a new team for session player
 * @route   POST /api/play/team/create
 * @access  Public (requires session)
 */
const createTeam = asyncHandler(async (req, res) => {
  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    const team = await playSessionService.createTeamForSession({ sessionId })

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        _id: team._id,
        teamCode: team.teamCode,
        name: team.name,
        memberCount: team.members.length,
        maxMembers: team.maxMembers,
        avgTrophies: team.avgTrophies,
        members: team.members.map(m => ({
          sessionPlayer: m.sessionPlayer,
          role: m.role,
        })),
      },
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Join matchmaking queue with session team
 * @route   POST /api/play/matchmaking/join
 * @access  Public (requires session)
 */
const joinMatchmaking = asyncHandler(async (req, res) => {
  const { sessionId, teamId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' })
  }

  try {
    const result = await playSessionService.joinMatchmakingQueue({
      sessionId,
      teamId,
    })

    res.status(200).json({
      message: 'Joined matchmaking queue',
      matchmaking: result,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Get battle data for session player
 * @route   GET /api/play/battle/:battleId
 * @access  Public (requires X-Session-Id header)
 */
const getBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const sessionId = req.headers['x-session-id']

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required', message: 'X-Session-Id header missing' })
  }

  if (!battleId) {
    return res.status(400).json({ error: 'Battle ID is required' })
  }

  try {
    // Verify session exists
    const session = await playSessionService.getSession({ sessionId })
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' })
    }

    // Get battle from database
    const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')
    // Ensure PlaySession schema is registered before populate
    require('../model/quickClashSchemas/playSessionSchema')

    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA', 'teamCode name')
      .populate('teamB', 'teamCode name')
      .populate('challenges')
      .populate({
        path: 'teamAMembers.user',
        select: 'name inGameName pic quickClashTrophies',
      })
      .populate({
        path: 'teamBMembers.user',
        select: 'name inGameName pic quickClashTrophies',
      })
      .populate({
        path: 'teamAMembers.sessionPlayer',
        select: 'sessionId inGameName trophies',
      })
      .populate({
        path: 'teamBMembers.sessionPlayer',
        select: 'sessionId inGameName trophies',
      })
      .lean()

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' })
    }

    res.status(200).json({
      battle,
    })
  } catch (error) {
    console.error('Get battle error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * @desc    Select category for battle (session-aware)
 * @route   POST /api/play/battle/:battleId/select-category
 * @access  Requires flexAuth
 */
const selectCategory = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { category } = req.body
  const player = req.player

  if (!player) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { selectCategoryForUser } = require('../services/quickClashServices/quickClashTeamBattleService')

    // For session players, use session ID; for users, use user ID
    const playerId = player.isSession ? player._id : player._id

    const result = await selectCategoryForUser({
      battleId,
      userId: playerId,
      category,
      isSessionPlayer: player.isSession,
    })

    res.status(200).json({
      success: true,
      message: 'Category selected successfully',
      battle: result,
    })
  } catch (error) {
    console.error('Select category error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to select category',
    })
  }
})

/**
 * @desc    Deselect category for battle (session-aware)
 * @route   POST /api/play/battle/:battleId/deselect-category
 * @access  Requires flexAuth
 */
const deselectCategory = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const player = req.player

  if (!player) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { deselectCategoryForUser } = require('../services/quickClashServices/quickClashTeamBattleService')

    const playerId = player.isSession ? player._id : player._id

    const result = await deselectCategoryForUser({
      battleId,
      userId: playerId,
      isSessionPlayer: player.isSession,
    })

    res.status(200).json({
      success: true,
      message: 'Category deselected successfully',
      battle: result,
    })
  } catch (error) {
    console.error('Deselect category error:', error)

    if (error.message.includes('No category selected')) {
      return res.status(200).json({
        success: true,
        message: 'No category was selected',
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to deselect category',
    })
  }
})

/**
 * @desc    Begin challenge for battle (session-aware)
 * @route   POST /api/play/battle/:battleId/begin-challenge
 * @access  Requires flexAuth
 */
const beginChallenge = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const player = req.player

  if (!player) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { beginCategoryChallenge } = require('../services/quickClashServices/quickClashTeamBattleService')

    const playerId = player.isSession ? player._id : player._id

    const result = await beginCategoryChallenge({
      battleId,
      userId: playerId,
      isSessionPlayer: player.isSession,
    })

    res.status(200).json({
      success: true,
      message: 'Challenge started successfully',
      battle: result.battle,
      sessionInfo: result.sessionInfo,
    })
  } catch (error) {
    console.error('Begin challenge error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start challenge',
    })
  }
})

/**
 * @desc    Submit quiz answers for battle (session-aware)
 * @route   POST /api/play/battle/:battleId/quiz/submit
 * @access  Requires flexAuth
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { answers, challengeId, sessionId: quizSessionId } = req.body
  const player = req.player

  if (!player) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { submitQuizAnswers } = require('../services/quickClashServices/quickClashTeamBattleService')

    const playerId = player.isSession ? player._id : player._id

    const result = await submitQuizAnswers({
      battleId,
      challengeId,
      sessionId: quizSessionId,
      userId: playerId,
      answers,
      isSessionPlayer: player.isSession,
    })

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      result,
    })
  } catch (error) {
    console.error('Submit quiz error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit quiz',
    })
  }
})

/**
 * @desc    Get challenge details (session-aware)
 * @route   GET /api/play/challenge/:challengeId
 * @access  Requires flexAuth
 */
const getChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params

  try {
    const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')

    const challenge = await QuickClashChallenge.findById(challengeId)
      .populate('article')
      .populate('forgeArticle')
      .lean()

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    res.status(200).json({ challenge })
  } catch (error) {
    console.error('Get challenge error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * @desc    Start a Quick Clash session (session-aware)
 * @route   POST /api/play/session/start
 * @access  Requires flexAuth
 */
const startQCSession = asyncHandler(async (req, res) => {
  const { challengeId } = req.body
  const playerId = req.player?._id || req.user?._id

  if (!challengeId) {
    return res.status(400).json({ error: 'Challenge ID is required' })
  }

  try {
    const quickClashSessionService = require('../services/quickClashServices/quickClashSessionService')

    // Start session for the player (works for both users and session players)
    const session = await quickClashSessionService.createSession({
      challengeId,
      userId: playerId,
      language: 'en', // Session players default to English
    })

    res.status(200).json({ session })
  } catch (error) {
    console.error('Start QC session error:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Start reading phase (session-aware)
 * @route   POST /api/play/session/:sessionId/reading/start
 * @access  Requires flexAuth
 */
const startReading = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const userId = req.player?._id || req.user?._id

  try {
    const quickClashSessionService = require('../services/quickClashServices/quickClashSessionService')

    await quickClashSessionService.startReading({ sessionId, userId })

    res.status(200).json({ message: 'Reading phase started' })
  } catch (error) {
    console.error('Start reading error:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Complete reading phase (session-aware)
 * @route   POST /api/play/session/:sessionId/reading/complete
 * @access  Requires flexAuth
 */
const completeReading = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  try {
    const quickClashSessionService = require('../services/quickClashServices/quickClashSessionService')

    await quickClashSessionService.completeReading({ sessionId })

    res.status(200).json({ message: 'Reading phase completed' })
  } catch (error) {
    console.error('Complete reading error:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Get session player's team battles
 * @route   GET /api/play/team-battles
 * @access  Private (requires flexAuth - works with session token)
 */
const getTeamBattles = asyncHandler(async (req, res) => {
  // Support both authenticated users and session players via flexAuth
  const userId = req.user?._id
  const sessionPlayerId = req.player?._id

  const { status = 'active', page = 1, limit = 10 } = req.query

  if (!userId && !sessionPlayerId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  try {
    // Import the service
    const { getUserTeamBattles } = require('../services/quickClashServices/quickClashTeamBattleService')

    const result = await getUserTeamBattles({
      userId,
      sessionPlayerId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    })

    res.status(200).json({
      success: true,
      battles: result.battles,
      pagination: result.pagination,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get team battles',
    })
  }
})

/**
 * @desc    Get current session player info (uses flexAuth)
 * @route   GET /api/play/me
 * @access  Private (requires flexAuth - session token)
 */
const getSessionInfo = asyncHandler(async (req, res) => {
  // This endpoint is specifically for session players
  const player = req.player

  if (!player || !player.isSession) {
    return res.status(401).json({
      success: false,
      message: 'Session authentication required',
    })
  }

  try {
    // Get fresh session data from database
    const session = await playSessionService.getSession({ sessionId: player.sessionId })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired',
      })
    }

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        inGameName: session.inGameName,
        trophies: session.trophies,
        stats: session.stats,
        currentTeamId: session.currentTeamId,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
      },
    })
  } catch (error) {
    console.error('Get session info error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get session info',
    })
  }
})

/**
 * @desc    Get session player's current team (view-only mode)
 * @route   GET /api/play/my-team
 * @access  Private (requires flexAuth - session token)
 */
const getMyTeam = asyncHandler(async (req, res) => {
  const player = req.player

  if (!player || !player.isSession) {
    return res.status(401).json({
      success: false,
      message: 'Session authentication required',
    })
  }

  try {
    // Get session to find currentTeamId
    const session = await playSessionService.getSession({ sessionId: player.sessionId })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired',
      })
    }

    // If no team, return null team
    if (!session.currentTeamId) {
      return res.status(200).json({
        success: true,
        team: null,
        message: 'No team found',
      })
    }

    // Get team with populated members
    const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
    const PlaySession = require('../model/quickClashSchemas/playSessionSchema')

    const team = await QuickClashTeam.findById(session.currentTeamId)
      .populate('members.user', 'name inGameName pic quickClashTrophies')
      .populate('members.sessionPlayer', 'sessionId inGameName trophies')
      .lean()

    if (!team) {
      // Team was deleted, clear reference
      return res.status(200).json({
        success: true,
        team: null,
        message: 'Team no longer exists',
      })
    }

    // Determine session player's role in the team
    const memberEntry = team.members.find(
      m => m.sessionPlayer?._id?.toString() === session._id.toString()
    )
    const isLeader = memberEntry?.role === 'leader'

    // Check if team is in matchmaking
    const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
    const matchmakingEntry = await QuickClashTeamMatchmaking.findOne({
      team: team._id,
      status: 'available',
    }).lean()

    const isInMatchmaking = !!matchmakingEntry

    // Format response with view-only flags
    res.status(200).json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        teamCode: team.teamCode,
        avgTrophies: team.avgTrophies,
        maxMembers: team.maxMembers,
        isInMatch: team.isInMatch,
        isInMatchmaking,
        members: team.members.map(m => ({
          _id: m._id,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
          // Normalize user/sessionPlayer data
          user: m.user ? {
            _id: m.user._id,
            name: m.user.name,
            inGameName: m.user.inGameName,
            pic: m.user.pic,
            trophies: m.user.quickClashTrophies,
          } : null,
          sessionPlayer: m.sessionPlayer ? {
            _id: m.sessionPlayer._id,
            sessionId: m.sessionPlayer.sessionId,
            inGameName: m.sessionPlayer.inGameName,
            trophies: m.sessionPlayer.trophies,
          } : null,
          // Is this member the current session player?
          isCurrentPlayer: m.sessionPlayer?._id?.toString() === session._id.toString(),
        })),
      },
      // View-only permissions for session players
      permissions: {
        canModify: false, // Session players cannot modify team
        canMatchmake: isLeader && !team.isInMatch && !isInMatchmaking, // Only leader can start matchmaking
        canInvite: false, // Cannot invite - needs signup
        canLeave: false, // Cannot leave - needs signup
        canRemoveMembers: false, // Cannot remove - needs signup
        canTransferLeadership: false, // Cannot transfer - needs signup
      },
      playerRole: memberEntry?.role || 'member',
    })
  } catch (error) {
    console.error('Get my team error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get team',
    })
  }
})

/**
 * @desc    Get matchmaking status for session player
 * @route   GET /api/play/matchmaking/status
 * @access  Private (requires flexAuth - session token)
 */
const getMatchmakingStatus = asyncHandler(async (req, res) => {
  // Support both authenticated users (req.user) and session players (req.sessionPlayer)
  const playerId = req.user?._id || req.sessionPlayer?._id
  const isSessionPlayer = !!req.sessionPlayer && !req.user

  if (!playerId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  try {
    const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
    const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
    const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')

    // Find player's team(s)
    let playerTeams
    if (isSessionPlayer) {
      playerTeams = await QuickClashTeam.find({
        'members.sessionPlayer': playerId
      }).populate('members.user', 'name inGameName')
        .populate('members.sessionPlayer', 'inGameName trophies')
    } else {
      playerTeams = await QuickClashTeam.find({
        'members.user': playerId
      }).populate('members.user', 'name inGameName')
        .populate('members.sessionPlayer', 'inGameName trophies')
    }

    if (!playerTeams || playerTeams.length === 0) {
      return res.status(200).json({
        success: true,
        inMatchmaking: false,
        status: null,
        matchmaking: null,
      })
    }

    // Check if any team is in matchmaking
    const teamIds = playerTeams.map(t => t._id)
    const matchmakingEntry = await QuickClashTeamMatchmaking.findOne({
      team: { $in: teamIds },
      status: { $in: ['available', 'matching'] }
    }).populate('team')

    if (matchmakingEntry) {
      // Check if there's a ready battle for this team
      const readyBattle = await QuickClashTeamBattle.findOne({
        $or: [{ teamA: matchmakingEntry.team._id }, { teamB: matchmakingEntry.team._id }],
        status: 'active',
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      }).populate([
        { path: 'teamA', select: '_id name' },
        { path: 'teamB', select: '_id name' },
      ])

      if (readyBattle) {
        return res.status(200).json({
          success: true,
          inMatchmaking: true,
          status: 'battleReady',
          matchmaking: matchmakingEntry,
          teamId: matchmakingEntry.team._id,
          teamName: matchmakingEntry.team.name,
          battleId: readyBattle._id,
          teamA: readyBattle.teamA,
          teamB: readyBattle.teamB,
          winProbability: readyBattle.winProbability,
        })
      }

      return res.status(200).json({
        success: true,
        inMatchmaking: true,
        status: 'searching',
        matchmaking: matchmakingEntry,
        teamId: matchmakingEntry.team._id,
        teamName: matchmakingEntry.team.name,
        memberCount: matchmakingEntry.memberCount,
        avgTrophies: matchmakingEntry.avgTrophies,
      })
    }

    // Check if user is in global (solo) matchmaking
    const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
    const globalMatchmaking = await QuickClashGlobalMatchmaking.findOne({
      user: playerId,
      status: { $in: ['available', 'processing', 'matched'] }
    })

    if (globalMatchmaking) {
      // Player is in global solo matchmaking
      return res.status(200).json({
        success: true,
        inMatchmaking: true,
        status: globalMatchmaking.status === 'matched' ? 'matched' : 'searching',
        matchmaking: {
          type: 'solo',
          _id: globalMatchmaking._id,
          team: globalMatchmaking.team, // May be assigned to a team during matchmaking
        },
        matchmakingType: 'solo',
      })
    }

    return res.status(200).json({
      success: true,
      inMatchmaking: false,
      status: null,
      matchmaking: null,
    })
  } catch (error) {
    console.error('Get matchmaking status error:', error)
    res.status(500).json({
      message: error.message || 'Failed to get matchmaking status',
    })
  }
})

const fixBattleHistory = asyncHandler(async (req, res) => {
  const { inGameName } = req.body
  const userId = req.user._id

  if (!inGameName) {
    return res.status(400).json({ error: 'In-game name required' })
  }

  // Find the session (even if converted)
  const PlaySession = require('../model/quickClashSchemas/playSessionSchema')
  const playSessionService = require('../services/playSessionService') // Assuming this service exists
  const session = await PlaySession.findOne({
    inGameName: { $regex: new RegExp(`^${inGameName}$`, 'i') }
  })

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  // Security check: Only allow if session is converted to THIS user
  if (session.convertedToUser && session.convertedToUser.toString() !== userId.toString()) {
     return res.status(403).json({ error: 'Session belongs to another user' })
  }

  await playSessionService.migrateSessionBattles(session._id, userId)

  res.json({ success: true, message: 'History migrated successfully' })
})

/**
 * @desc    Remove a team member (leader only)
 * @route   POST /api/play/team/:teamId/remove
 * @access  Requires X-Session-Id header
 */
const removeTeamMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { memberSessionPlayerId } = req.body
  const sessionId = req.headers['x-session-id']

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required in X-Session-Id header' })
  }

  if (!memberSessionPlayerId) {
    return res.status(400).json({ error: 'Member session player ID is required' })
  }

  try {
    const team = await playSessionService.removeMemberAsSession({
      teamId,
      leaderSessionId: sessionId,
      memberSessionPlayerId,
    })

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team,
    })
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove member',
    })
  }
})

module.exports = {
  createSession,
  createTeam,
  getSession,
  restoreSession,
  joinTeam,
  joinMatchmaking,
  getTeamInfo,
  getBattle,
  selectCategory,
  deselectCategory,
  beginChallenge,
  submitQuiz,
  convertToUser,
  convertWithGoogle,
  generateInviteUrl,
  // New session-aware challenge/session endpoints
  getChallenge,
  startQCSession,
  startReading,
  completeReading,
  // Team battles for session players
  getTeamBattles,
  // Session player info endpoint
  getSessionInfo,
  // Session player's team (view-only)
  getMyTeam,
  // Matchmaking status for session players
  getMatchmakingStatus,
  fixBattleHistory,
  // Team member management
  removeTeamMember,
}

