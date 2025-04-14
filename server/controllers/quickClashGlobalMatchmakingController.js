// controllers/quickClashGlobalMatchmakingController.js
const asyncHandler = require('express-async-handler')
const {
  joinGlobalMatchmaking,
  leaveGlobalMatchmaking,
  getGlobalMatchmakingStatus,
  processGlobalMatchmaking,
} = require('../services/quickClashServices/quickClashTeamMatchmakingService')

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

module.exports = {
  joinGlobalMatchmakingQueue,
  leaveGlobalMatchmakingQueue,
  getGlobalMatchmakingStatusController,
  processGlobalMatchmakingController,
}
