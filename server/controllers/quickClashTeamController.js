// controllers/quickClashTeamController.js
// MODIFY: Add enhanced error handling for write conflicts in team operations

const asyncHandler = require('express-async-handler')
const {
  createTeam,
  getTeamById,
  getTeamByCode,
  joinTeamByCode,
  inviteToTeam,
  respondToInvitation,
  leaveTeam,
  updateMemberStatus,
  getUserTeams,
  removeMember,
  transferLeadership,
} = require('../services/quickClashServices/quickClashTeamService')

const {
  getCertaintyInfo,
  getTrendIndicator,
} = require('../utils/quickClashWinProbabilityHelpers')

const {
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus,
} = require('../services/quickClashServices/quickClashTeamMatchmakingService')

// ADD: Import the notification service
const {
  notifyTeamMatchmakingStarted,
} = require('../services/quickClashServices/quickClashNotificationService')

const {
  selectCategoryForUser,
  getUserTeamBattles,
  getTeamBattleDetails,
  deselectCategoryForUser,
  beginCategoryChallenge,
} = require('../services/quickClashServices/quickClashTeamBattleService')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')

const {
  acceptTeamInvitation,
  rejectTeamInvitation,
  getUserPendingInvitations,
} = require('../services/quickClashServices/quickClashTeamInvitationService')

// ADD: Helper function to handle write conflict errors
const handleWriteConflictError = (error, operation) => {
  console.log(`Write conflict in ${operation}:`, error.message)

  if (error.isRetryExhausted) {
    return {
      success: false,
      message: `Unable to ${operation.toLowerCase()} right now. Please try again in a moment.`,
      code: 'OPERATION_BUSY',
      reason: `The system is busy processing multiple requests. Please wait a moment and try again.`,
      retryAfter: 3,
    }
  }

  if (
    error.codeName === 'WriteConflict' ||
    error.message.includes('Write conflict') ||
    error.message.includes('yielding is disabled')
  ) {
    return {
      success: false,
      message: `Unable to ${operation.toLowerCase()} right now. Please try again.`,
      code: 'OPERATION_CONFLICT',
      reason: `Multiple ${operation.toLowerCase()} operations are happening simultaneously. Please try again in a moment.`,
      retryAfter: 2,
    }
  }

  if (
    error.message.includes('TransientTransactionError') ||
    error.message.includes('transaction')
  ) {
    return {
      success: false,
      message: `Unable to ${operation.toLowerCase()}. Please try again.`,
      code: 'TRANSACTION_ERROR',
      reason: `A temporary database issue occurred. Please try again in a moment.`,
      retryAfter: 2,
    }
  }

  if (
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError' ||
    error.message.includes('network') ||
    error.message.includes('timeout')
  ) {
    return {
      success: false,
      message: 'Connection issue. Please check your internet and try again.',
      code: 'NETWORK_ERROR',
      reason:
        'Unable to connect to the service. Please check your internet connection.',
      retryAfter: 5,
    }
  }

  return null // Not a write conflict error
}

/**
 * @desc    Create a new team
 * @route   POST /api/quickClash/team
 * @access  Private
 */
const createNewTeam = asyncHandler(async (req, res) => {
  const { name } = req.body
  const creatorId = req.user._id

  try {
    const team = await createTeam({ name, creatorId })

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team,
    })
  } catch (error) {
    console.log('Error creating team:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'create team')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create team',
    })
  }
})

/**
 * @desc    Get a team by ID
 * @route   GET /api/quickClash/team/:teamId
 * @access  Private
 */
const getTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  try {
    const team = await getTeamById({ teamId })

    res.status(200).json({
      success: true,
      team,
    })
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Team not found',
    })
  }
})

/**
 * @desc    Get a team by code
 * @route   GET /api/quickClash/team/code/:teamCode
 * @access  Private
 */
const getTeamByCodeController = asyncHandler(async (req, res) => {
  const { teamCode } = req.params

  try {
    const team = await getTeamByCode({ teamCode })

    res.status(200).json({
      success: true,
      team,
    })
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Team not found',
    })
  }
})

/**
 * @desc    Join a team using team code
 * @route   POST /api/quickClash/team/join
 * @access  Private
 */
const joinTeam = asyncHandler(async (req, res) => {
  const { teamCode } = req.body
  const userId = req.user._id

  try {
    const team = await joinTeamByCode({ teamCode, userId })

    res.status(200).json({
      success: true,
      message: 'Team joined successfully',
      team,
    })
  } catch (error) {
    console.log('Error joining team:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'join team')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join team',
    })
  }
})

/**
 * @desc    Invite a user to team
 * @route   POST /api/quickClash/team/:teamId/invite
 * @access  Private
 */
const inviteUserToTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { inviteeId } = req.body
  const inviterId = req.user._id

  try {
    const team = await inviteToTeam({ teamId, inviterId, inviteeId })

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      team,
    })
  } catch (error) {
    console.log('Error inviting to team:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'send invitation')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send invitation',
    })
  }
})

/**
 * @desc    Respond to team invitation
 * @route   POST /api/quickClash/team/:teamId/respond
 * @access  Private
 */
const respondToTeamInvitation = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { accept } = req.body
  const userId = req.user._id

  try {
    const team = await respondToInvitation({ teamId, userId, accept })

    if (accept) {
      res.status(200).json({
        success: true,
        message: 'Invitation accepted',
        team,
      })
    } else {
      res.status(200).json({
        success: true,
        message: 'Invitation rejected',
      })
    }
  } catch (error) {
    console.log('Error responding to team invitation:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'respond to invitation',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to respond to invitation',
    })
  }
})

/**
 * @desc    Leave a team
 * @route   POST /api/quickClash/team/:teamId/leave
 * @access  Private (supports both authenticated users and session players via flexAuth)
 */
const leaveTeamController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

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
    const team = await leaveTeam({ teamId, playerId, isSessionPlayer })

    res.status(200).json({
      success: true,
      message: team ? 'You have left the team' : 'Team has been dissolved',
      team,
    })
  } catch (error) {
    console.log('Error leaving team:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'leave team')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave team',
    })
  }
})

/**
 * @desc    Update member status
 * @route   POST /api/quickClash/team/:teamId/status
 * @access  Private
 */
const updateTeamMemberStatus = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { status } = req.body
  const userId = req.user._id

  try {
    const team = await updateMemberStatus({ teamId, userId, status })

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      team,
    })
  } catch (error) {
    console.log('Error updating team member status:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'update status')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update status',
    })
  }
})

/**
 * @desc    Get user's teams
 * @route   GET /api/quickClash/teams
 * @access  Private
 */
const getMyTeams = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const teams = await getUserTeams({ userId })

    res.status(200).json({
      success: true,
      teams,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get teams',
    })
  }
})

/**
 * @desc    Remove a member from team
 * @route   POST /api/quickClash/team/:teamId/remove
 * @access  Private
 */
const removeMemberFromTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { memberId } = req.body
  const leaderId = req.user._id

  try {
    const team = await removeMember({ teamId, leaderId, memberId })

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team,
    })
  } catch (error) {
    console.log('Error removing team member:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'remove member')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove member',
    })
  }
})

/**
 * @desc    Transfer team leadership to another member
 * @route   POST /api/quickClash/team/:teamId/transfer-leadership
 * @access  Private
 */
const transferLeadershipController = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const { newLeaderId } = req.body
  const currentLeaderId = req.user._id

  try {
    const team = await transferLeadership({ teamId, currentLeaderId, newLeaderId })

    res.status(200).json({
      success: true,
      message: 'Leadership transferred successfully',
      team,
    })
  } catch (error) {
    console.log('Error transferring leadership:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'transfer leadership')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to transfer leadership',
    })
  }
})

/**
 * @desc    Join team matchmaking
 * @route   POST /api/quickClash/team/:teamId/matchmaking/join
 * @access  Private (supports both authenticated users and session players via flexAuth)
 */
const joinTeamMatchmakingController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

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
    // Verify user/session is team leader and get team details for notifications
    const team = await QuickClashTeam.findById(teamId)
      .populate('members.user', '_id name inGameName')
      .populate('members.sessionPlayer', '_id inGameName trophies')

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      })
    }

    // Check if the player is a leader of this team (supports both user and session player)
    const isLeader = team.members.some(member => {
      if (isSessionPlayer && member.sessionPlayer) {
        return member.sessionPlayer._id.toString() === playerId.toString() && member.role === 'leader'
      }
      if (!isSessionPlayer && member.user) {
        return member.user._id.toString() === playerId.toString() && member.role === 'leader'
      }
      return false
    })

    if (!isLeader) {
      return res.status(403).json({
        success: false,
        message: 'Only team leaders can start matchmaking',
        code: 'NOT_LEADER',
      })
    }

    // For session player teams, auto-set all members to ready (they don't have ready UI)
    if (isSessionPlayer) {
      const hasSessionMembers = team.members.some(m => m.sessionPlayer)
      if (hasSessionMembers) {
        for (const member of team.members) {
          member.status = 'ready'
        }
        await team.save()
      }
    }

    const matchmaking = await joinTeamMatchmaking({ teamId })

    // Send notifications to offline teammates (only for real users, not session players)
    try {
      // Filter to only user members (session players don't have push notifications)
      const userMembers = team.members.filter(m => m.user && !m.sessionPlayer)

      if (userMembers.length > 0) {
        // Get leader's name for notification
        let leaderName = 'Team Leader'
        if (isSessionPlayer) {
          const leaderMember = team.members.find(m =>
            m.sessionPlayer?._id.toString() === playerId.toString()
          )
          leaderName = leaderMember?.sessionPlayer?.inGameName || 'Team Leader'
        } else {
          const leaderMember = team.members.find(m =>
            m.user?._id.toString() === playerId.toString()
          )
          leaderName = leaderMember?.user?.inGameName || leaderMember?.user?.name || 'Team Leader'
        }

        // Send notifications only to user members
        const notificationResult = await notifyTeamMatchmakingStarted({
          teamId: team._id.toString(),
          teamName: team.name || 'Your Squad',
          leaderName,
          teamMembers: userMembers,
          leaderId: playerId.toString(),
        })

        console.log(
          `[TEAM_MATCHMAKING] Notification result for team "${team.name}":`,
          notificationResult,
        )
      }
    } catch (notificationError) {
      // Don't fail the matchmaking join if notifications fail
      console.error(
        '[TEAM_MATCHMAKING] Error sending notifications:',
        notificationError,
      )
    }

    res.status(200).json({
      success: true,
      message: 'Joined team matchmaking successfully',
      matchmaking,
    })
  } catch (error) {
    console.log('Error joining team matchmaking:', error.message)

    // Handle retry exhausted errors from team matchmaking
    if (error.isRetryExhausted) {
      return res.status(503).json({
        success: false,
        message:
          'Team matchmaking is currently busy. Please try again in a moment.',
        code: 'TEAM_MATCHMAKING_BUSY',
        reason:
          'The team matchmaking system is experiencing high load. Please wait a moment and try again.',
        retryAfter: 3,
      })
    }

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'join team matchmaking',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    // Check if the error is related to users already being in matchmaking
    if (
      error.message.includes('already in matchmaking') ||
      error.message.includes('already in global matchmaking') ||
      error.message.includes('already in another team')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'ALREADY_IN_MATCHMAKING',
        reason: error.message, // Include full error message for display
        memberName: error.message.match(/Team member (.+?) is already/)
          ? error.message.match(/Team member (.+?) is already/)[1]
          : null, // Extract member name if present
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join team matchmaking',
      reason:
        error.message ||
        'Unknown error occurred while joining team matchmaking', // Include reason
    })
  }
})

/**
 * @desc    Leave team matchmaking
 * @route   POST /api/quickClash/team/:teamId/matchmaking/leave
 * @access  Private (supports both authenticated users and session players via flexAuth)
 */
const leaveTeamMatchmakingController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  // Support both authenticated users (req.user) and session players (req.sessionPlayer)
  const playerId = req.user?._id || req.sessionPlayer?._id

  if (!playerId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  try {
    // Pass the player ID to the service for better notifications
    const success = await leaveTeamMatchmaking({
      teamId,
      userId: playerId, // Pass the player ID who initiated the leave action
    })

    res.status(200).json({
      success,
      message: success
        ? 'Left team matchmaking successfully'
        : 'Team not in matchmaking',
    })
  } catch (error) {
    console.log('Error leaving team matchmaking:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'leave team matchmaking',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave team matchmaking',
    })
  }
})

/**
 * @desc    Get team matchmaking status
 * @route   GET /api/quickClash/team/:teamId/matchmaking/status
 * @access  Private
 */
const getTeamMatchmakingStatusController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  try {
    const status = await getTeamMatchmakingStatus({ teamId })

    res.status(200).json({
      success: true,
      ...status,
    })
  } catch (error) {
    console.log('Error getting team matchmaking status:', error.message)

    // For status checks, handle gracefully
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.codeName === 'WriteConflict'
    ) {
      return res.status(200).json({
        success: true,
        inMatchmaking: false,
        status: null,
        matchmaking: null,
        note: 'Status check temporarily unavailable',
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get team matchmaking status',
    })
  }
})

/**
 * @desc    Select a category for a team battle
 * @route   POST /api/quickClash/team-battle/:battleId/select-category
 * @access  Private
 */
const selectCategoryForBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { category } = req.body
  const userId = req.user._id

  try {
    const result = await selectCategoryForUser({ battleId, userId, category })

    res.status(200).json({
      success: true,
      message: 'Category selected successfully',
      battle: result,
    })
  } catch (error) {
    console.log('Error selecting category for battle:', error.message)

    // Handle write conflicts and retry exhausted errors
    if (error.isRetryExhausted) {
      return res.status(503).json({
        success: false,
        message: 'Unable to select category right now. Please try again.',
        code: 'CATEGORY_SELECTION_BUSY',
        reason:
          'Multiple players are selecting categories simultaneously. Please try again in a moment.',
        retryAfter: 2,
      })
    }

    const conflictResponse = handleWriteConflictError(error, 'select category')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to select category',
    })
  }
})

/**
 * @desc    Deselect a category for a team battle
 * @route   POST /api/quickClash/team-battle/:battleId/deselect-category
 * @access  Private
 */
const deselectCategoryForBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  try {
    const result = await deselectCategoryForUser({ battleId, userId })

    res.status(200).json({
      success: true,
      message: 'Category deselected successfully',
      battle: result,
    })
  } catch (error) {
    console.log('Error deselecting category for battle:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'deselect category',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    // Handle "No category selected to deselect" as a non-error case
    if (error.message.includes('No category selected to deselect')) {
      return res.status(200).json({
        success: true,
        message: 'No category was selected',
        note: 'Category deselection not needed',
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to deselect category',
    })
  }
})

/**
 * @desc    Begin challenge for selected category
 * @route   POST /api/quickClash/team-battle/:battleId/begin-challenge
 * @access  Private
 */
const beginChallengeForBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  try {
    const result = await beginCategoryChallenge({ battleId, userId })

    res.status(200).json({
      success: true,
      message: 'Challenge started successfully',
      battle: result.battle,
      sessionInfo: result.sessionInfo,
    })
  } catch (error) {
    console.log('Error beginning challenge for battle:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(error, 'begin challenge')
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start challenge',
    })
  }
})

/**
 * @desc    Get user's team battles
 * @route   GET /api/quickClash/team-battles
 * @access  Private
 */
const getMyTeamBattles = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { status = 'active', page = 1, limit = 10 } = req.query

  try {
    const result = await getUserTeamBattles({
      userId,
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
 * @desc    Get team battle details
 * @route   GET /api/quickClash/team-battle/:battleId
 * @access  Private
 */
const getTeamBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params

  try {
    const battle = await getTeamBattleDetails({ battleId })

    res.status(200).json({
      success: true,
      battle,
    })
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Team battle not found',
    })
  }
})

/**
 * @desc    Get team info for matchmaking
 * @route   GET /api/quickClash/team/:teamId/matchmaking-info
 * @access  Private (supports both authenticated users and session players via flexAuth)
 */
const getTeamMatchmakingInfo = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  // Support both authenticated users and session players
  const playerId = req.user?._id || req.sessionPlayer?._id
  const isSessionPlayer = !!req.sessionPlayer && !req.user

  if (!playerId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  try {
    // Find the team - populate both user and sessionPlayer
    let team = await QuickClashTeam.findById(teamId)
      .populate('members.user', '_id name inGameName pic')
      .populate('members.sessionPlayer', '_id inGameName trophies')
      .populate('formationInfo.sourceTeams', 'name members')

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      })
    }

    // Check if player is a member of the team (supports both user and session player)
    const isMember = team.members.some(member => {
      if (isSessionPlayer && member.sessionPlayer) {
        return member.sessionPlayer._id?.toString() === playerId.toString() ||
               member.sessionPlayer.toString() === playerId.toString()
      }
      if (!isSessionPlayer && member.user) {
        return member.user._id?.toString() === playerId.toString() ||
               member.user.toString() === playerId.toString()
      }
      return false
    })

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      })
    }

    // Get matchmaking status
    const matchmakingStatus = await getTeamMatchmakingStatus({ teamId })

    // Determine if this is an auto-formed team
    let joinType = 'regular'
    let originalTeam = null

    if (
      team.teamType === 'auto' &&
      team.formationInfo &&
      team.formationInfo.isAutoFormed
    ) {
      // Check if the player was originally a solo player
      if (
        team.formationInfo.soloPlayers &&
        team.formationInfo.soloPlayers.length > 0 &&
        team.formationInfo.soloPlayers.some(
          soloPlayerId => soloPlayerId.toString() === playerId.toString(),
        )
      ) {
        joinType = 'solo'
      }
      // Check if the player was originally from a source team
      else if (
        team.formationInfo.sourceTeams &&
        team.formationInfo.sourceTeams.length > 0
      ) {
        // Find the member in the current team to get their sourceTeam info
        const teamMember = team.members.find(member => {
          if (isSessionPlayer && member.sessionPlayer) {
            return member.sessionPlayer._id?.toString() === playerId.toString()
          }
          return member.user?._id?.toString() === playerId.toString()
        })

        if (teamMember && teamMember.sourceTeam) {
          joinType = 'sourceTeam'

          // Find the source team details
          const sourceTeamId = teamMember.sourceTeam.toString()
          const sourceTeam = team.formationInfo.sourceTeams.find(
            st => st._id.toString() === sourceTeamId,
          )

          if (sourceTeam) {
            originalTeam = {
              _id: sourceTeam._id,
              name: sourceTeam.name,
            }
          }
        }
      }
    }

    // Return team info with matchmaking status and join type
    res.status(200).json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        members: team.members.map(member => ({
          _id: member.user?._id || member.sessionPlayer?._id,
          name: member.user?.name || member.user?.inGameName || member.sessionPlayer?.inGameName || 'Player',
          pic: member.user?.pic || null,
          role: member.role,
          isSessionPlayer: !!member.sessionPlayer,
        })),
        isInMatch: team.isInMatch,
      },
      matchmaking: matchmakingStatus,
      joinType: joinType,
      originalTeam: originalTeam,
    })
  } catch (error) {
    console.log('Error getting team matchmaking info:', error.message)

    // Handle database errors gracefully
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.codeName === 'WriteConflict'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Unable to get team info right now. Please try again.',
        code: 'SERVICE_UNAVAILABLE',
        retryAfter: 3,
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get team matchmaking info',
    })
  }
})

/**
 * @desc    Get detailed team matchmaking status
 * @route   GET /api/quickClash/team/:teamId/matchmaking-status-detailed
 * @access  Private
 */
const getTeamMatchmakingStatusDetailed = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const userId = req.user._id

  try {
    // Verify user is part of the team
    const team = await QuickClashTeam.findById(teamId)
      .populate('members.user', '_id name inGameName')
      .populate('formationInfo.sourceTeams', 'name members')

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      })
    }

    const isMember = team.members.some(
      member => member.user._id.toString() === userId.toString(),
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      })
    }

    // Check if user has an active battle ready for them
    const userTeamBattles = await QuickClashTeamBattle.find({
      $or: [{ 'teamAMembers.user': userId }, { 'teamBMembers.user': userId }],
      status: 'active',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Battle created in last 5 minutes
    }).populate([
      { path: 'teamA', select: '_id name' },
      { path: 'teamB', select: '_id name' },
    ])

    // Check if any battle is ready for this user
    for (const battle of userTeamBattles) {
      // Check if this battle has all challenges (battle is ready)
      if (
        battle.challenges &&
        battle.challenges.length === battle.categories.length
      ) {
        // Check if this user is part of this battle
        const isTeamAMember = battle.teamAMembers.some(
          m => m.user._id.toString() === userId.toString(),
        )
        const isTeamBMember = battle.teamBMembers.some(
          m => m.user._id.toString() === userId.toString(),
        )

        if (isTeamAMember || isTeamBMember) {
          return res.json({
            success: true,
            inMatchmaking: false,
            status: 'battleReady',
            battleId: battle._id,
            teamId: isTeamAMember ? battle.teamA._id : battle.teamB._id,
            teamA: battle.teamA._id,
            teamB: battle.teamB._id,
          })
        }
      }
    }

    // Get matchmaking entry
    const matchmakingEntry = await QuickClashTeamMatchmaking.findOne({
      team: teamId,
    })

    if (!matchmakingEntry) {
      return res.json({
        success: true,
        inMatchmaking: false,
        status: null,
      })
    }

    // Check if this team has been processed (used in auto-formation)
    if (matchmakingEntry.status === 'processed') {
      // This team has been incorporated into an auto-formed team
      // Find the auto-formed team that contains members from this source team
      const autoFormedTeam = await QuickClashTeam.findOne({
        'formationInfo.isAutoFormed': true,
        'formationInfo.sourceTeams': teamId,
        'members.user': { $in: team.members.map(m => m.user._id || m.user) },
      })
        .populate('members.user', '_id name inGameName')
        .populate('formationInfo.sourceTeams', 'name members')

      if (autoFormedTeam) {
        // Get the auto-formed team's matchmaking status
        const autoTeamMatchmaking = await QuickClashTeamMatchmaking.findOne({
          team: autoFormedTeam._id,
        })

        let statusData = {
          status: 'team_formation_in_progress',
          isAutoFormed: true,
          originalTeam: {
            _id: team._id,
            name: team.name,
          },
          autoFormedTeam: {
            _id: autoFormedTeam._id,
            name: autoFormedTeam.name || 'Auto-formed Team',
            members: autoFormedTeam.members.length,
            maxMembers: 4,
          },
          message:
            'Your team has been merged with other players to form a 4v4 battle team',
          timeInQueue: Math.floor(
            (Date.now() - matchmakingEntry.createdAt) / 1000,
          ),
        }

        // Check the status of the auto-formed team
        if (autoTeamMatchmaking) {
          if (autoTeamMatchmaking.status === 'available') {
            if (autoFormedTeam.members.length === 4) {
              statusData.status = 'team_completed'
              statusData.message =
                'Auto-team formation complete! Now searching for opponents...'

              // Count available opponents
              const availableTeams =
                await QuickClashTeamMatchmaking.countDocuments({
                  status: 'available',
                  memberCount: 4,
                  _id: { $ne: autoTeamMatchmaking._id },
                  avgTrophies: {
                    $gte: autoTeamMatchmaking.avgTrophies - 200,
                    $lte: autoTeamMatchmaking.avgTrophies + 200,
                  },
                })

              statusData.status = 'matching_teams'
              statusData.availableOpponents = availableTeams
            } else {
              statusData.status = 'forming_team'
              statusData.message =
                'Adding more players to complete your team...'
            }
          } else if (autoTeamMatchmaking.status === 'matching') {
            statusData.status = 'preparing_battle'
            statusData.message = 'Match found! Preparing your battle...'
          }
        }

        return res.json({
          success: true,
          inMatchmaking: true,
          ...statusData,
        })
      }
    }

    // Normal team matchmaking flow (not processed)
    if (matchmakingEntry.status !== 'available') {
      return res.json({
        success: true,
        inMatchmaking: false,
        status: null,
      })
    }

    // Get detailed status information for regular teams
    let statusData = {
      status: 'searching_teams',
      teamMembersCount: team.members.length,
      maxMembers: 4,
      avgTrophies: matchmakingEntry.avgTrophies,
      timeInQueue: Math.floor((Date.now() - matchmakingEntry.createdAt) / 1000),
    }

    // Check if team is partial (less than 4 members)
    if (team.members.length < 4) {
      // Count solo players available for team formation
      const soloPlayersInQueue =
        await QuickClashGlobalMatchmaking.countDocuments({
          status: 'available',
          team: null,
        })

      statusData.status = 'searching_players'
      statusData.soloPlayersInQueue = soloPlayersInQueue
      statusData.teamMembersCount = team.members.length
    } else {
      // Full team - looking for opponents
      const availableTeams = await QuickClashTeamMatchmaking.countDocuments({
        status: 'available',
        memberCount: 4,
        _id: { $ne: matchmakingEntry._id },
        avgTrophies: {
          $gte: matchmakingEntry.avgTrophies - 200,
          $lte: matchmakingEntry.avgTrophies + 200,
        },
      })

      statusData.status = 'matching_teams'
      statusData.availableOpponents = availableTeams
    }

    res.json({
      success: true,
      inMatchmaking: true,
      ...statusData,
    })
  } catch (error) {
    console.error('Error getting detailed team matchmaking status:', error)

    // Handle database errors gracefully for detailed status
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.codeName === 'WriteConflict'
    ) {
      return res.json({
        success: true,
        inMatchmaking: false,
        status: 'status_unavailable',
        message: 'Status temporarily unavailable. Please try again.',
        retryAfter: 3,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get matchmaking status',
    })
  }
})

/**
 * @desc    Accept a team invitation
 * @route   POST /api/quickClash/team/invitation/:invitationId/accept
 * @access  Private
 */
const acceptTeamInvitationController = asyncHandler(async (req, res) => {
  const { invitationId } = req.params
  const userId = req.user._id

  try {
    const team = await acceptTeamInvitation({ invitationId, userId })

    res.status(200).json({
      success: true,
      message: 'Team invitation accepted successfully',
      team,
    })
  } catch (error) {
    console.log('Error accepting team invitation:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'accept invitation',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to accept team invitation',
    })
  }
})

/**
 * @desc    Reject a team invitation
 * @route   POST /api/quickClash/team/invitation/:invitationId/reject
 * @access  Private
 */
const rejectTeamInvitationController = asyncHandler(async (req, res) => {
  const { invitationId } = req.params
  const userId = req.user._id

  try {
    await rejectTeamInvitation({ invitationId, userId })

    res.status(200).json({
      success: true,
      message: 'Team invitation rejected successfully',
    })
  } catch (error) {
    console.log('Error rejecting team invitation:', error.message)

    // Handle write conflicts
    const conflictResponse = handleWriteConflictError(
      error,
      'reject invitation',
    )
    if (conflictResponse) {
      return res.status(503).json(conflictResponse)
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject team invitation',
    })
  }
})

/**
 * @desc    Get user's pending team invitations
 * @route   GET /api/quickClash/team/invitations/pending
 * @access  Private
 */
const getPendingInvitationsController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const invitations = await getUserPendingInvitations({ userId })

    res.status(200).json({
      success: true,
      invitations,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get pending invitations',
    })
  }
})

/**
 * Get current win probability for a team battle
 *
 * @desc    Get live win probability data for a 4v4 team battle
 * @route   GET /api/quickClash/team-battle/:battleId/win-probability
 * @access  Private (must be participant)
 *
 * RETURNS:
 * - Current probabilities (updated live)
 * - Initial probabilities (at battle start)
 * - Certainty score
 * - Completed challenges count
 * - Trend indicator
 * - Team-specific view
 */
const getTeamBattleProbability = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  // Fetch battle with probability data
  const battle = await QuickClashTeamBattle.findById(battleId)
    .select('winProbability teamAMembers teamBMembers challenges')
    .populate('teamA teamB', 'name')

  if (!battle) {
    return res.status(404).json({
      success: false,
      message: 'Battle not found',
    })
  }

  // Verify user is part of this battle
  const isTeamA = battle.teamAMembers.some(
    m => m.user.toString() === userId.toString(),
  )
  const isTeamB = battle.teamBMembers.some(
    m => m.user.toString() === userId.toString(),
  )

  if (!isTeamA && !isTeamB) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this battle',
    })
  }

  // Check if probability data exists
  if (!battle.winProbability) {
    return res.status(200).json({
      success: true,
      available: false,
      message: 'Win probability not available for this battle',
    })
  }

  // Get user's team perspective
  const myTeamData = isTeamA
    ? battle.winProbability.teamA
    : battle.winProbability.teamB

  const opponentTeamData = isTeamA
    ? battle.winProbability.teamB
    : battle.winProbability.teamA

  const myTeam = isTeamA ? battle.teamA : battle.teamB
  const opponentTeam = isTeamA ? battle.teamB : battle.teamA

  // Calculate certainty and other metrics
  const completedChallenges = battle.challenges.filter(
    c => c.teamACompleted && c.teamBCompleted,
  ).length

  const certaintyScore = completedChallenges / 4 // 0.0 to 1.0
  const certaintyInfo = getCertaintyInfo(certaintyScore)

  // Determine trend
  const currentProb = myTeamData.current
  const initialProb = myTeamData.initial
  let trend = 'stable'
  if (currentProb > initialProb + 0.05) {
    trend = 'up'
  } else if (currentProb < initialProb - 0.05) {
    trend = 'down'
  }
  const trendInfo = getTrendIndicator(trend)

  // Format response
  res.status(200).json({
    success: true,
    available: true,
    probability: {
      myTeam: {
        name: myTeam.name,
        current: {
          percentage: formatProbability(currentProb),
          decimal: currentProb,
        },
        initial: {
          percentage: formatProbability(initialProb),
          decimal: initialProb,
        },
        change: {
          percentage: formatProbability(Math.abs(currentProb - initialProb)),
          direction: trend,
          ...trendInfo,
        },
        message: getProbabilityMessage(currentProb, myTeam.name),
      },
      opponentTeam: {
        name: opponentTeam.name,
        current: {
          percentage: formatProbability(opponentTeamData.current),
          decimal: opponentTeamData.current,
        },
      },
      certainty: {
        score: certaintyScore,
        ...certaintyInfo,
      },
      metadata: {
        completedChallenges: `${completedChallenges}/4`,
        totalUpdates: battle.winProbability.totalUpdates,
        lastUpdated: battle.winProbability.lastUpdatedAt,
      },
    },
    calculatedAt: battle.winProbability.calculatedAt,
  })
})

/**
 * Get probability history for a team battle
 *
 * @desc    Get timeline of how probability changed throughout battle
 * @route   GET /api/quickClash/team-battle/:battleId/win-probability/history
 * @access  Private (must be participant)
 *
 * USEFUL FOR:
 * - Showing probability graph/chart
 * - Analyzing how battle unfolded
 * - Understanding key turning points
 */
const getTeamBattleProbabilityHistory = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  const battle = await QuickClashTeamBattle.findById(battleId)
    .select('winProbability teamAMembers teamBMembers')
    .populate('teamA teamB', 'name')
    .populate({
      path: 'winProbability.teamA.history.afterUserId',
      select: 'name inGameName',
    })

  if (!battle) {
    return res.status(404).json({
      success: false,
      message: 'Battle not found',
    })
  }

  // Verify user is participant
  const isTeamA = battle.teamAMembers.some(
    m => m.user.toString() === userId.toString(),
  )
  const isTeamB = battle.teamBMembers.some(
    m => m.user.toString() === userId.toString(),
  )

  if (!isTeamA && !isTeamB) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    })
  }

  if (!battle.winProbability) {
    return res.status(200).json({
      success: true,
      available: false,
      history: [],
    })
  }

  // Build timeline
  const myTeamData = isTeamA
    ? battle.winProbability.teamA
    : battle.winProbability.teamB

  const timeline = [
    // Start point
    {
      point: 0,
      label: 'Battle Start',
      probability: formatProbability(myTeamData.initial),
      decimal: myTeamData.initial,
      timestamp: battle.winProbability.calculatedAt,
      certainty: 0,
    },
    // Update points
    ...myTeamData.history.map((update, index) => ({
      point: index + 1,
      label: `After Challenge ${index + 1}`,
      probability: formatProbability(update.probability),
      decimal: update.probability,
      timestamp: update.timestamp,
      certainty: update.certaintyScore,
      projectedWins: update.projectedWins.toFixed(1),
      playerName: update.afterUserId?.inGameName || update.afterUserId?.name,
    })),
  ]

  res.status(200).json({
    success: true,
    available: true,
    battle: {
      id: battleId,
      myTeam: isTeamA ? battle.teamA.name : battle.teamB.name,
      opponentTeam: isTeamA ? battle.teamB.name : battle.teamA.name,
    },
    timeline,
    totalUpdates: myTeamData.history.length,
  })
})

module.exports = {
  createNewTeam,
  getTeam,
  getTeamByCodeController,
  joinTeam,
  inviteUserToTeam,
  respondToTeamInvitation,
  leaveTeamController,
  updateTeamMemberStatus,
  getMyTeams,
  removeMemberFromTeam,
  transferLeadershipController,
  joinTeamMatchmakingController,
  leaveTeamMatchmakingController,
  getTeamMatchmakingStatusController,
  selectCategoryForBattle,
  deselectCategoryForBattle,
  beginChallengeForBattle,
  getMyTeamBattles,
  getTeamBattle,
  getTeamMatchmakingInfo,
  getTeamMatchmakingStatusDetailed,
  acceptTeamInvitationController,
  rejectTeamInvitationController,
  getPendingInvitationsController,
  getTeamBattleProbability,
  getTeamBattleProbabilityHistory,
}
