// controllers/quickClashGlobalMatchmakingController.js
const asyncHandler = require('express-async-handler')
const {
  joinGlobalMatchmaking,
  leaveGlobalMatchmaking,
  getGlobalMatchmakingStatus,
  processGlobalMatchmaking,
} = require('../services/quickClashServices/quickClashTeamMatchmakingService')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')

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
      const team = await QuickClashTeam.findById(
        matchmakingEntry.team,
      ).populate('members.user', '_id name inGameName')

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

module.exports = {
  joinGlobalMatchmakingQueue,
  leaveGlobalMatchmakingQueue,
  getGlobalMatchmakingStatusController,
  processGlobalMatchmakingController,
  getGlobalMatchmakingStatusDetailed,
}
