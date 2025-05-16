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
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')

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
  const userId = req.user._id

  try {
    // Verify user is team leader
    const team = await QuickClashTeam.findById(teamId)

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      })
    }

    // Check if the user is a leader of this team
    const isLeader = team.members.some(
      member =>
        member.user.toString() === userId.toString() &&
        member.role === 'leader',
    )

    if (!isLeader) {
      return res.status(403).json({
        success: false,
        message: 'Only team leaders can start matchmaking',
        code: 'NOT_LEADER',
      })
    }

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
  const userId = req.user._id

  try {
    // Pass the user ID to the service for better notifications
    const success = await leaveTeamMatchmaking({
      teamId,
      userId, // Pass the user ID who initiated the leave action
    })

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

/**
 * @desc    Get team info for matchmaking
 * @route   GET /api/quickClash/team/:teamId/matchmaking-info
 * @access  Private
 */
const getTeamMatchmakingInfo = asyncHandler(async (req, res) => {
  const { teamId } = req.params
  const userId = req.user._id

  try {
    // Find the team
    let team = await QuickClashTeam.findById(teamId)
      .populate('members.user', '_id name inGameName pic')
      .populate('formationInfo.sourceTeams', 'name members')

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      })
    }

    // Check if user is a member of the team
    const isMember = team.members.some(
      member => member.user._id.toString() === userId.toString(),
    )

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
      // Check if the user was originally a solo player
      if (
        team.formationInfo.soloPlayers &&
        team.formationInfo.soloPlayers.length > 0 &&
        team.formationInfo.soloPlayers.some(
          playerId => playerId.toString() === userId.toString(),
        )
      ) {
        joinType = 'solo'
      }
      // Check if the user was originally from a source team
      else if (
        team.formationInfo.sourceTeams &&
        team.formationInfo.sourceTeams.length > 0
      ) {
        // Find the member in the current team to get their sourceTeam info
        const teamMember = team.members.find(
          member => member.user._id.toString() === userId.toString(),
        )

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
          _id: member.user._id,
          name: member.user.name || member.user.inGameName,
          pic: member.user.pic,
          role: member.role,
        })),
        isInMatch: team.isInMatch,
      },
      matchmaking: matchmakingStatus,
      joinType: joinType,
      originalTeam: originalTeam,
    })
  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: 'Failed to get matchmaking status',
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
  getTeamMatchmakingInfo,
  getTeamMatchmakingStatusDetailed,
}
