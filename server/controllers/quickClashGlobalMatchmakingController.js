// controllers/quickClashGlobalMatchmakingController.js
// MODIFY: Add enhanced error handling for write conflicts and retry logic

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
    console.log('Error joining global matchmaking:', error.message)

    // ENHANCED: Handle specific error types with user-friendly messages

    // Handle retry exhausted errors (after all retries failed)
    if (error.isRetryExhausted) {
      console.log('Matchmaking retry exhausted for user:', userId)
      return res.status(503).json({
        success: false,
        message: 'Matchmaking is currently busy. Please try again in a moment.',
        code: 'MATCHMAKING_BUSY',
        reason:
          'The matchmaking system is experiencing high load. Please wait a moment and try again.',
        retryAfter: 3, // Suggest retry after 3 seconds
      })
    }

    // Handle write conflict errors (if they somehow escape retry logic)
    if (
      error.codeName === 'WriteConflict' ||
      error.message.includes('Write conflict') ||
      error.message.includes('yielding is disabled')
    ) {
      console.log('Write conflict in matchmaking for user:', userId)
      return res.status(503).json({
        success: false,
        message: 'Matchmaking is temporarily busy. Please try again.',
        code: 'MATCHMAKING_CONFLICT',
        reason:
          'Multiple players are joining matchmaking simultaneously. Please try again in a moment.',
        retryAfter: 2, // Suggest retry after 2 seconds
      })
    }

    // Handle transaction errors
    if (
      error.message.includes('TransientTransactionError') ||
      error.message.includes('transaction')
    ) {
      console.log('Transaction error in matchmaking for user:', userId)
      return res.status(503).json({
        success: false,
        message: 'Unable to join matchmaking right now. Please try again.',
        code: 'TRANSACTION_ERROR',
        reason:
          'A temporary database issue occurred. Please try again in a moment.',
        retryAfter: 2,
      })
    }

    // Handle user already in matchmaking errors
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

    // Handle network/database connectivity issues
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    ) {
      console.log('Network error in matchmaking for user:', userId)
      return res.status(503).json({
        success: false,
        message: 'Connection issue. Please check your internet and try again.',
        code: 'NETWORK_ERROR',
        reason:
          'Unable to connect to the matchmaking service. Please check your internet connection.',
        retryAfter: 5,
      })
    }

    // Handle validation errors (user not found, etc.)
    if (
      error.message.includes('not found') ||
      error.message.includes('invalid') ||
      error.message.includes('User not found')
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Unable to join matchmaking. Please try logging out and back in.',
        code: 'VALIDATION_ERROR',
        reason: error.message,
      })
    }

    // Generic fallback for unknown errors
    console.error('Unexpected error in global matchmaking:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to join matchmaking at this time. Please try again.',
      code: 'UNKNOWN_ERROR',
      reason:
        'An unexpected error occurred. Please try again or contact support if the issue persists.',
      retryAfter: 5,
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
    console.log('Error leaving global matchmaking:', error.message)

    // ENHANCED: Handle specific error types for leaving matchmaking

    // Handle retry exhausted errors
    if (error.isRetryExhausted) {
      return res.status(503).json({
        success: false,
        message: 'Unable to leave matchmaking right now. Please try again.',
        code: 'LEAVE_MATCHMAKING_BUSY',
        reason:
          'The system is busy processing your request. Please try again in a moment.',
        retryAfter: 3,
      })
    }

    // Handle write conflicts
    if (
      error.codeName === 'WriteConflict' ||
      error.message.includes('Write conflict')
    ) {
      return res.status(503).json({
        success: false,
        message: 'Unable to leave matchmaking right now. Please try again.',
        code: 'LEAVE_MATCHMAKING_CONFLICT',
        reason:
          'Multiple operations are happening simultaneously. Please try again in a moment.',
        retryAfter: 2,
      })
    }

    // Handle network errors
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Connection issue. Please check your internet and try again.',
        code: 'NETWORK_ERROR',
        reason: 'Unable to connect to the matchmaking service.',
        retryAfter: 5,
      })
    }

    // Generic fallback
    console.error('Unexpected error leaving global matchmaking:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to leave matchmaking. Please try again.',
      code: 'UNKNOWN_ERROR',
      reason: 'An unexpected error occurred while leaving matchmaking.',
      retryAfter: 5,
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
    console.log('Error getting global matchmaking status:', error.message)

    // Handle database errors gracefully for status checks
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.codeName === 'WriteConflict'
    ) {
      // For status checks, return a safe default state
      return res.status(200).json({
        success: true,
        inMatchmaking: false,
        status: null,
        matchmaking: null,
        type: null,
        note: 'Status check temporarily unavailable',
      })
    }

    res.status(400).json({
      success: false,
      message: 'Unable to get matchmaking status. Please try again.',
      code: 'STATUS_CHECK_ERROR',
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
    console.log('Error processing global matchmaking (admin):', error.message)

    // ENHANCED: Handle admin processing errors
    if (error.isRetryExhausted) {
      return res.status(503).json({
        success: false,
        message: 'Matchmaking processing is currently overloaded',
        code: 'PROCESSING_BUSY',
      })
    }

    if (
      error.codeName === 'WriteConflict' ||
      error.message.includes('Write conflict')
    ) {
      return res.status(503).json({
        success: false,
        message: 'Matchmaking is busy. Please try again.',
        code: 'PROCESSING_CONFLICT',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process global matchmaking',
      code: 'PROCESSING_ERROR',
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

    // ENHANCED: Handle database errors gracefully for detailed status
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.codeName === 'WriteConflict'
    ) {
      // Return a safe default response
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
      code: 'STATUS_ERROR',
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

    // ENHANCED: For leave-check errors, err on the side of allowing leave
    res.json({
      success: true,
      canLeave: true,
      reason: null,
      note: 'Status check temporarily unavailable, leaving is allowed',
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
