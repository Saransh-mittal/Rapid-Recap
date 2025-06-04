// controllers/quickClashMatchmakingController.js
const asyncHandler = require('express-async-handler')
const {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
} = require('../services/quickClashServices/quickClashMatchmakingService')
const QuickClashMatchmaking = require('../model/quickClashSchemas/quickClashMatchmakingSchema')
const { sendNotification } = require('../services/notificationService')

/**
 * @desc    Join the matchmaking room - now with automatic category selection
 * @route   POST /api/quickClash/matchmaking/join
 * @access  Private
 */
const joinMatchmakingRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    console.log(`[MM_CONTROLLER] User ${userId} joining 1v1 matchmaking`)

    // No categories needed, they'll be selected automatically in the backend
    const matchmakingEntry = await joinMatchmaking({
      userId,
    })

    console.log(
      `[MM_CONTROLLER] User ${userId} successfully joined 1v1 matchmaking`,
    )

    res.status(200).json({
      success: true,
      message: 'Joined matchmaking successfully',
      matchmaking: matchmakingEntry,
    })
  } catch (error) {
    console.error(
      `[MM_CONTROLLER] Error joining matchmaking for user ${userId}:`,
      error,
    )
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join matchmaking',
    })
  }
})

/**
 * @desc    Leave the matchmaking room
 * @route   POST /api/quickClash/matchmaking/leave
 * @access  Private
 */
const leaveMatchmakingRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    console.log(`[MM_CONTROLLER] User ${userId} leaving 1v1 matchmaking`)

    const success = await leaveMatchmaking({ userId })

    console.log(
      `[MM_CONTROLLER] User ${userId} ${
        success ? 'successfully left' : 'was not in'
      } 1v1 matchmaking`,
    )

    res.status(200).json({
      success,
      message: success
        ? 'Left matchmaking successfully'
        : 'User not in matchmaking',
    })
  } catch (error) {
    console.error(
      `[MM_CONTROLLER] Error leaving matchmaking for user ${userId}:`,
      error,
    )
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to leave matchmaking',
    })
  }
})

/**
 * @desc    Get current matchmaking status
 * @route   GET /api/quickClash/matchmaking/status
 * @access  Private
 */
const getMatchmakingStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    console.log(`[MM_CONTROLLER] Getting matchmaking status for user ${userId}`)

    // Get user's current matchmaking entry if exists
    const matchmakingEntry = await QuickClashMatchmaking.findOne({
      user: userId,
    }).select('-__v')

    console.log(
      `[MM_CONTROLLER] User ${userId} matchmaking status: ${
        matchmakingEntry ? 'in matchmaking' : 'not in matchmaking'
      }`,
    )

    res.status(200).json({
      success: true,
      inMatchmaking: !!matchmakingEntry,
      status: matchmakingEntry ? matchmakingEntry.status : null,
      matchmaking: matchmakingEntry,
    })
  } catch (error) {
    console.error(
      `[MM_CONTROLLER] Error getting matchmaking status for user ${userId}:`,
      error,
    )
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get matchmaking status',
    })
  }
})

// NOTE: The handleMatchmakingEvents function has been removed and consolidated into
// quickClashSocket.utils.js as part of the unified socket handling system.
// All 1v1 matchmaking socket events are now handled in the setupQuickClashSocketHandlers function.

module.exports = {
  joinMatchmakingRoom,
  leaveMatchmakingRoom,
  getMatchmakingStatus,
}
