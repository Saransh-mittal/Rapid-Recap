// controllers/quickClashTeamController.js
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
  toggleTeamPersistence,
  updateMemberCategory,
  removeMember,
} = require('../services/quickClashServices/quickClashTeamService')

const {
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus,
} = require('../services/quickClashServices/quickClashTeamMatchmakingService')

const {
  selectCategoryForUser,
  getUserTeamBattles,
  getTeamBattleDetails,
} = require('../services/quickClashServices/quickClashTeamBattleService')

/**
 * @desc    Create a new team
 * @route   POST /api/quickClash/team
 * @access  Private
 */
const createNewTeam = asyncHandler(async (req, res) => {
  const { name, isPersistent } = req.body
  const creatorId = req.user._id

  try {
    const team = await createTeam({ name, creatorId, isPersistent })

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team,
    })
  } catch (error) {
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
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to respond to invitation',
    })
  }
})

/**
 * @desc    Leave a team
 * @route   POST /api/quickClash/team/:teamId/leave
 * @access  Private
 */
const leaveTeamController = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const userId = req.user._id

  try {
    const team = await leaveTeam({ teamId, userId })

    res.status(200).json({
      success: true,
      message: team ? 'You have left the team' : 'Team has been dissolved',
      team,
    })
  } catch (error) {
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
 * @desc    Toggle team persistence
 * @route   POST /api/quickClash/team/:teamId/persistence
 * @access  Private
 */
const toggleTeamPersistenceController = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const userId = req.user._id

  try {
    const team = await toggleTeamPersistence({ teamId, userId })

    res.status(200).json({
      success: true,
      message: `Team is now ${team.isPersistent ? 'persistent' : 'temporary'}`,
      team,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update team persistence',
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
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove member',
    })
  }
})

/**
 * @desc    Join team matchmaking
 * @route   POST /api/quickClash/team/:teamId/matchmaking/join
 * @access  Private
 */
const joinTeamMatchmakingController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  try {
    // Verify user is member of the team - this will be handled by service

    const matchmaking = await joinTeamMatchmaking({ teamId })

    res.status(200).json({
      success: true,
      message: 'Joined team matchmaking successfully',
      matchmaking,
    })
  } catch (error) {
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
 * @access  Private
 */
const leaveTeamMatchmakingController = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  try {
    const success = await leaveTeamMatchmaking({ teamId })

    res.status(200).json({
      success,
      message: success
        ? 'Left team matchmaking successfully'
        : 'Team not in matchmaking',
    })
  } catch (error) {
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
      battle: result.battle,
      sessionInfo: result.sessionInfo,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to select category',
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
  toggleTeamPersistenceController,
  removeMemberFromTeam,
  joinTeamMatchmakingController,
  leaveTeamMatchmakingController,
  getTeamMatchmakingStatusController,
  selectCategoryForBattle,
  getMyTeamBattles,
  getTeamBattle,
}
