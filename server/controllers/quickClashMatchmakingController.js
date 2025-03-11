// controllers/quickClashMatchmakingController.js
const asyncHandler = require('express-async-handler')
const {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
  getAvailableUsers,
  acceptMatchmakingChallengeService,
} = require('../services/quickClashServices/quickClashMatchmakingService')
const QuickClashMatchmaking = require('../model/quickClashSchemas/quickClashMatchmakingSchema')
const { sendNotification } = require('../services/notificationService')

/**
 * @desc    Join the matchmaking room
 * @route   POST /api/quickClash/matchmaking/join
 * @access  Private
 */
const joinMatchmakingRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { categories } = req.body

  try {
    if (!categories || !Array.isArray(categories) || categories.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 2 categories must be selected',
      })
    }

    const matchmakingEntry = await joinMatchmaking({
      userId,
      categories,
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
 * @desc    Get users available for matchmaking
 * @route   GET /api/quickClash/matchmaking/users
 * @access  Private
 */
const getMatchmakingUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const MAX_DISPLAYED_USERS = 6
    const availableUsers = await getAvailableUsers({
      userId,
      limit: MAX_DISPLAYED_USERS, // Limit to 6 users max
    })

    res.status(200).json({
      success: true,
      users: availableUsers.map(user => ({
        user: user.user,
        status: user.status,
        preferredCategories: user.preferredCategories,
        lastActive: user.lastActive,
      })),
    })
  } catch (error) {
    console.error('Error getting matchmaking users:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get matchmaking users',
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
  socket.on('quickClash:joinMatchmaking', async data => {
    try {
      const { userId, preferredCategories } = data

      // Ensure socket is authenticated
      if (!socket.user || socket.user._id.toString() !== userId) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      // Join matchmaking
      await joinMatchmaking({
        userId,
        preferredCategories,
      })

      // Join matchmaking room for updates
      socket.join(`quickClash:matchmaking`)

      // Notify others in matchmaking
      io.to(`quickClash:matchmaking`).emit('quickClash:userJoined', {
        userId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          inGameName: socket.user.inGameName,
          pic: socket.user.pic,
        },
        preferredCategories,
      })

      socket.emit('quickClash:joinedMatchmaking')
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to join matchmaking',
      })
    }
  })

  // User leaves matchmaking
  socket.on('quickClash:leaveMatchmaking', async data => {
    try {
      const { userId } = data
      // Ensure socket is authenticated
      if (!socket.user || socket.user._id.toString() !== userId) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      // Leave matchmaking
      await leaveMatchmaking({ userId })

      // Leave matchmaking room
      socket.leave(`quickClash:matchmaking`)

      // Notify others in matchmaking
      io.to(`quickClash:matchmaking`).emit('quickClash:userLeft', {
        userId,
      })

      socket.emit('quickClash:leftMatchmaking')
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to leave matchmaking',
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

        // Notify others in matchmaking
        io.to(`quickClash:matchmaking`).emit('quickClash:userLeft', {
          userId: socket.user._id.toString(),
        })
      } catch (error) {
        console.error('Error handling disconnect for matchmaking:', error)
      }
    }
  })
}

/**
 * @desc    Accept a matchmaking challenge
 * @route   POST /api/quickClash/matchmaking/accept
 * @access  Private
 */
const acceptMatchmakingChallenge = asyncHandler(async (req, res) => {
  const accepterId = req.user._id
  const { creatorId, categories } = req.body

  if (
    !creatorId ||
    !categories ||
    !Array.isArray(categories) ||
    categories.length !== 2
  ) {
    return res.status(400).json({
      success: false,
      message: 'Creator ID and exactly 2 categories are required',
    })
  }

  try {
    // Attempt to accept the challenge
    const result = await acceptMatchmakingChallengeService({
      accepterId,
      creatorId,
      categories,
    })

    // Send notifications to both users
    await sendNotification({
      title: 'Quick Clash Challenge Started',
      body: 'Your challenge is being prepared...',
      url: '/quickclash',
      userId: creatorId,
    })

    await sendNotification({
      title: 'Quick Clash Challenge Started',
      body: 'Your challenge is being prepared...',
      url: '/quickclash',
      userId: accepterId,
    })

    res.status(201).json({
      success: true,
      message: 'Challenge accepted successfully',
      challenge: result.challenge,
    })
  } catch (error) {
    if (error.message === 'This user is no longer available for challenges') {
      return res.status(409).json({
        // 409 Conflict - indicates race condition
        success: false,
        message: 'This user is no longer available for challenges',
      })
    }

    console.error('Error accepting challenge:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept challenge',
    })
  }
})

module.exports = {
  joinMatchmakingRoom,
  leaveMatchmakingRoom,
  getMatchmakingUsers,
  getMatchmakingStatus,
  handleMatchmakingEvents,
  acceptMatchmakingChallenge,
}
