// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')

const joinedUsers = new Set()

/**
 * Setup socket event handlers for Quick Clash feature
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Client socket connection
 * @param {Object} user - Authenticated user object
 */
const setupQuickClashSocketHandlers = (io, socket, user) => {
  // Ensure user object is valid before proceeding
  if (!user || !user._id) {
    console.error('Invalid user object in setupQuickClashSocketHandlers')
    return
  }

  const userId = user._id.toString()
  const quickClashRoom = `quickClash:${userId}`

  // Use a composite key that includes socket ID to track this specific join
  const joinKey = `${userId}:${socket.id}`

  if (!joinedUsers.has(joinKey)) {
    socket.join(quickClashRoom)
    joinedUsers.add(joinKey)

    // Remove from tracking when socket disconnects
    socket.on('disconnect', () => {
      joinedUsers.delete(joinKey)
    })
  }

  // Listen for explicit join requests (redundant but kept for backward compatibility)
  socket.on('quickClash:join', () => {
    // No need to join again if already joined
    if (!socket.explicitlyJoinedQuickClash) {
      socket.explicitlyJoinedQuickClash = true
    }
  })

  socket.on('join', room => {
    socket.join(room)
  })
  // Set up matchmaking event handlers
  handleMatchmakingEvents(io, socket)

  // Listen for bot response events
}

/**
 * Setup global emitter event handlers for Quick Clash
 * @param {Object} io - Socket.io instance
 */
const setupQuickClashGlobalEvents = io => {
  // Listen for challenge created event from controller
  globalEmitter.on(
    'quickClash:challengeCreated',
    ({ challenge, challenger, opponent }) => {
      if (!opponent || !opponent._id) {
        console.error(
          'Invalid opponent object in quickClash:challengeCreated event',
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to opponent's room
        const opponentRoom = `quickClash:${opponent._id}`
        io.to(opponentRoom).emit('quickClash:newChallenge', {
          challenge,
          challenger,
        })
      }, 100)
    },
  )

  globalEmitter.on(
    'quickClash:challengerNotified',
    ({ challenge, challenger, opponent, success, errorMessage }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengerNotified event',
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to challenger's room
        const challengerRoom = `quickClash:${challenger._id}`
        io.to(challengerRoom).emit('quickClash:challengerNotified', {
          challenge,
          opponent,
          success,
          errorMessage,
        })
      }, 100)
    },
  )

  // Listen for challenge accepted event from controller
  globalEmitter.on(
    'quickClash:challengeAccepted',
    ({ challengeId, category, challenger, opponent }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengeAccepted event',
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to challenger's room
        const challengerRoom = `quickClash:${challenger._id}`
        io.to(challengerRoom).emit('quickClash:challengeAccepted', {
          challengeId,
          category,
          opponent,
        })
      }, 100)
    },
  )

  // Listen for challenge rejected event from controller
  globalEmitter.on(
    'quickClash:challengeRejected',
    ({ challengeId, category, challenger, opponent }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengeRejected event',
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to challenger's room
        const challengerRoom = `quickClash:${challenger._id}`
        io.to(challengerRoom).emit('quickClash:challengeRejected', {
          challengeId,
          category,
          opponent,
        })
      }, 100)
    },
  )

  globalEmitter.on(
    'quickClash:challengeCompletedByBothPlayers',
    ({ challenge, trackWinnerOutcomeResult, completedByUserId }) => {
      if (!challenge || !challenge.challenger || !challenge.opponent) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompleted event',
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to recipient's room
        const recipientRoom = `quickClash:${challenge.challenger._id.toString()}`
        io.to(recipientRoom).emit(
          'quickClash:challengeCompletedByBothPlayers',
          {
            challengeId: challenge._id,
            trackWinnerOutcomeResult,
            completedByUserId,
          },
        )
      }, 100)
      setTimeout(() => {
        // Emit to recipient's room
        const recipientRoom = `quickClash:${challenge.opponent._id.toString()}`
        io.to(recipientRoom).emit(
          'quickClash:challengeCompletedByBothPlayers',
          {
            challengeId: challenge._id,
            trackWinnerOutcomeResult,
            completedByUserId,
          },
        )
      }, 200)
    },
  )
  // Listen for challenge completed event from controller
  globalEmitter.on(
    'quickClash:challengeCompleted',
    ({ challenge, completedByUserId }) => {
      if (!challenge || !challenge.challenger || !challenge.opponent) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompleted event',
        )
        return
      }

      // Determine recipient
      const recipientId =
        completedByUserId.toString() === challenge.challenger._id.toString()
          ? challenge.opponent._id.toString()
          : challenge.challenger._id.toString()

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        // Emit to recipient's room
        const recipientRoom = `quickClash:${recipientId}`
        io.to(recipientRoom).emit('quickClash:challengeCompleted', {
          challengeId: challenge._id,
          completedByUserId,
        })
      }, 100)
    },
  )

  // Listen for analysis ready event from controller
  globalEmitter.on('quickClash:analysisReady', ({ challengeId, userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:analysisReady event')
      return
    }

    // Add a small delay to avoid race conditions
    setTimeout(() => {
      // Emit to user's room
      const userRoom = `quickClash:${userId}`
      io.to(userRoom).emit('quickClash:analysisReady', {
        challengeId,
      })
    }, 100)
  })

  // New events for matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, userData, preferredCategories }) => {
      io.to('quickClash:matchmaking').emit('quickClash:userJoined', {
        userId,
        user: userData, // Make sure this doesn't have a way to identify bots
        preferredCategories,
      })
    },
  )

  // Event for when a bot completes a challenge

  // Add these event handlers to setupQuickClashGlobalEvents function

  globalEmitter.on('quickClash:challengeRaceCondition', ({ accepterId }) => {
    // Notify user who tried to accept a challenge that was already taken
    io.to(`quickClash:${accepterId}`).emit('quickClash:acceptFailed', {
      message: 'This user is no longer available for challenges',
    })
  })

  globalEmitter.on(
    'quickClash:matchReady',
    ({ challengeId, challengerData, opponentData, oldChallengeId }) => {
      // Send the real challenge ID to both users
      io.to(`quickClash:${challengerData._id}`).emit(
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        },
      )

      io.to(`quickClash:${opponentData._id}`).emit(
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        },
      )
    },
  )
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
}
