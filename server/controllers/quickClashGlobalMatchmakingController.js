// controllers/quickClashGlobalMatchmakingController.js
const asyncHandler = require('express-async-handler')
const {
  joinGlobalMatchmaking,
  leaveGlobalMatchmaking,
  getGlobalMatchmakingStatus,
  processGlobalMatchmaking,
} = require('../services/quickClashServices/quickClashTeamMatchmakingService')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')

/**
 * @desc    Join global matchmaking queue
 * @route   POST /api/quickClash/global-matchmaking/join
 * @access  Private
 */
const joinGlobalMatchmakingQueue = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    console.log('Joining global matchmaking for user:', userId)
    const matchmaking = await joinGlobalMatchmaking({ userId })

    res.status(200).json({
      success: true,
      message: 'Joined global matchmaking successfully',
      matchmaking,
    })
  } catch (error) {
    // Specific error message when user is already in matchmaking
    if (
      error.message.includes('already in matchmaking') ||
      error.message.includes('already in team matchmaking')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'ALREADY_IN_MATCHMAKING',
        reason: error.message, // Include full error message for display
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join global matchmaking',
      reason:
        error.message || 'Unknown error occurred while joining matchmaking', // Include reason
    })
  }
})

/**
 * @desc    Leave global matchmaking queue
 * @route   POST /api/quickClash/global-matchmaking/leave
 * @access  Private
 */
const leaveGlobalMatchmakingQueue = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const success = await leaveGlobalMatchmaking({ userId })

    res.status(200).json({
      success,
      message: success
        ? 'Left global matchmaking successfully'
        : 'User not in global matchmaking',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave global matchmaking',
    })
  }
})

/**
 * @desc    Get global matchmaking status
 * @route   GET /api/quickClash/global-matchmaking/status
 * @access  Private
 */
const getGlobalMatchmakingStatusController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const status = await getGlobalMatchmakingStatus({ userId })

    res.status(200).json({
      success: true,
      ...status,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get global matchmaking status',
    })
  }
})

/**
 * @desc    Force process global matchmaking (admin only)
 * @route   POST /api/quickClash/global-matchmaking/process
 * @access  Private/Admin
 */
const processGlobalMatchmakingController = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to perform this action',
    })
  }

  try {
    await processGlobalMatchmaking()

    res.status(200).json({
      success: true,
      message: 'Global matchmaking processed successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process global matchmaking',
    })
  }
})

/**
 * @desc    Get detailed global matchmaking status for solo players
 * @route   GET /api/quickClash/global-matchmaking-status-detailed
 * @access  Private
 */
const getGlobalMatchmakingStatusDetailed = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
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

    // Check if user is in global matchmaking
    const matchmakingEntry = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
      status: { $ne: 'in_battle' },
    })

    if (!matchmakingEntry) {
      return res.json({
        success: true,
        inMatchmaking: false,
        status: null,
      })
    }

    let statusData = {
      status: 'searching_players',
      timeInQueue: Math.floor((Date.now() - matchmakingEntry.createdAt) / 1000),
      trophies: matchmakingEntry.trophies,
    }

    // Count solo players in queue
    const soloPlayersInQueue = await QuickClashGlobalMatchmaking.countDocuments(
      {
        status: 'available',
        team: null,
      },
    )

    statusData.soloPlayersInQueue = soloPlayersInQueue

    // Check if user has been assigned to a team
    if (matchmakingEntry.team) {
      const team = await QuickClashTeam.findById(matchmakingEntry.team)
        .populate('members.user', '_id name inGameName')
        .populate('formationInfo.sourceTeams', 'name members')

      if (team) {
        statusData.status = 'team_formed'
        statusData.teamName = team.name || 'Auto-formed Team'
        statusData.teamMembers = team.members.length
        statusData.maxMembers = 4

        // Check if team is looking for opponents
        const teamMatchmaking = await QuickClashTeamMatchmaking.findOne({
          team: team._id,
        })

        if (teamMatchmaking && teamMatchmaking.status === 'available') {
          const availableTeams = await QuickClashTeamMatchmaking.countDocuments(
            {
              status: 'available',
              memberCount: 4,
              _id: { $ne: teamMatchmaking._id },
              avgTrophies: {
                $gte: teamMatchmaking.avgTrophies - 200,
                $lte: teamMatchmaking.avgTrophies + 200,
              },
            },
          )

          statusData.status = 'matching_teams'
          statusData.availableOpponents = availableTeams
        }

        // Check if this is a first auto-formed team
        if (team.formationInfo && team.formationInfo.isAutoFormed) {
          if (team.members.length === 4) {
            statusData.status = 'team_completed'
          } else {
            statusData.status = 'forming_team'
          }
        }
      }
    }

    // Count partial teams that might need members
    const partialTeams = await QuickClashTeamMatchmaking.countDocuments({
      status: 'available',
      memberCount: { $lt: 4 },
    })

    statusData.partialTeams = partialTeams

    // Determine specific status based on conditions
    if (matchmakingEntry.status === 'processing') {
      statusData.status = 'forming_team'
      statusData.message = 'Being matched with other players to form a team'
    } else if (matchmakingEntry.status === 'matched' && matchmakingEntry.team) {
      statusData.status = 'team_formed'
    }

    res.json({
      success: true,
      inMatchmaking: true,
      ...statusData,
    })
  } catch (error) {
    console.error('Error getting detailed global matchmaking status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get matchmaking status',
    })
  }
})

/**
 * @desc    Check if a user can leave matchmaking
 * @route   GET /api/quickClash/can-leave-matchmaking
 * @access  Private
 */
const canLeaveMatchmakingController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Check if user is in global matchmaking
    const globalEntry = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
    })

    let canLeave = true
    let reason = null

    if (globalEntry) {
      // User can't leave if status is 'creating_battle'
      if (globalEntry.status === 'creating_battle') {
        canLeave = false
        reason = 'Battle is being created'
      }
    } else {
      // Check if user is in team matchmaking
      const userTeam = await QuickClashTeam.findOne({
        'members.user': userId,
      })

      if (userTeam) {
        const teamMatchmaking = await QuickClashTeamMatchmaking.findOne({
          team: userTeam._id,
        })

        if (teamMatchmaking && teamMatchmaking.status === 'creating_battle') {
          canLeave = false
          reason = 'Battle is being created'
        }
      }
    }

    res.json({
      success: true,
      canLeave,
      reason,
    })
  } catch (error) {
    console.error('Error checking if user can leave matchmaking:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check matchmaking status',
    })
  }
})

module.exports = {
  joinGlobalMatchmakingQueue,
  leaveGlobalMatchmakingQueue,
  getGlobalMatchmakingStatusController,
  processGlobalMatchmakingController,
  getGlobalMatchmakingStatusDetailed,
  canLeaveMatchmakingController,
}
