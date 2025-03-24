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
    // No categories needed, they'll be selected automatically in the backend
    const matchmakingEntry = await joinMatchmaking({
      userId,
    })

    res.status(200).json({
      success: true,
      message: 'Joined matchmaking successfully',
      matchmaking: matchmakingEntry,
    })
  } catch (error) {
    console.error('Error joining matchmaking:', error)
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
    const success = await leaveMatchmaking({ userId })

    res.status(200).json({
      success,
      message: success
        ? 'Left matchmaking successfully'
        : 'User not in matchmaking',
    })
  } catch (error) {
    console.error('Error leaving matchmaking:', error)
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
    // Get user's current matchmaking entry if exists
    const matchmakingEntry = await QuickClashMatchmaking.findOne({
      user: userId,
    }).select('-__v')

    res.status(200).json({
      success: true,
      inMatchmaking: !!matchmakingEntry,
      status: matchmakingEntry ? matchmakingEntry.status : null,
      matchmaking: matchmakingEntry,
    })
  } catch (error) {
    console.error('Error getting matchmaking status:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get matchmaking status',
    })
  }
})

// Socket event handlers for matchmaking
const handleMatchmakingEvents = (io, socket) => {
  // User joins matchmaking
  socket.on('quickClash:joinMatchmaking', async () => {
    try {
      // Ensure socket is authenticated
      if (!socket.user || !socket.user._id) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      const userId = socket.user._id.toString()

      // Join matchmaking
      await joinMatchmaking({
        userId,
      })

      // Join matchmaking room for updates
      socket.join(`quickClash:matchmaking`)

      socket.emit('quickClash:joinedMatchmaking')
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to join matchmaking',
      })
    }
  })

  // Cleanup on disconnect
  socket.on('disconnect', async () => {
    if (socket.user) {
      try {
        // Update status to offline
        await updateMatchmakingStatus({
          userId: socket.user._id.toString(),
          status: 'offline',
        })
      } catch (error) {
        console.error('Error handling disconnect for matchmaking:', error)
      }
    }
  })
}

module.exports = {
  joinMatchmakingRoom,
  leaveMatchmakingRoom,
  getMatchmakingStatus,
  handleMatchmakingEvents,
}
