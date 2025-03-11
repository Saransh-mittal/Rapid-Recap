// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')
const {
  acceptChallenge,
  rejectChallenge,
} = require('../services/quickClashServices/quickClashChallengeService')

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
  globalEmitter.on(
    'quickClash:botResponse',
    async ({ challengeId, botId, accepted }) => {
      try {
        if (accepted) {
          // Bot accepts the challenge
          await acceptChallenge({
            challengeId,
            userId: botId,
          })

          // Emit to challenger
          const challenge = await getBasicChallengeInfo(challengeId)
          if (challenge && challenge.challenger) {
            io.to(`quickClash:${challenge.challenger}`).emit(
              'quickClash:botAcceptedChallenge',
              {
                challengeId,
                botId,
              },
            )
          }
        } else {
          // Bot rejects the challenge
          await rejectChallenge({
            challengeId,
            userId: botId,
          })

          // Emit to challenger
          const challenge = await getBasicChallengeInfo(challengeId)
          if (challenge && challenge.challenger) {
            io.to(`quickClash:${challenge.challenger}`).emit(
              'quickClash:botRejectedChallenge',
              {
                challengeId,
                botId,
              },
            )
          }
        }
      } catch (error) {
        console.error('Error handling bot response:', error)
      }
    },
  )
}

/**
 * Helper to get basic challenge info
 * @param {string} challengeId - Challenge ID
 * @returns {Promise<Object>} Basic challenge info
 */
const getBasicChallengeInfo = async challengeId => {
  try {
    // Import mongoose and model here to avoid circular dependency
    const mongoose = require('mongoose')
    const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')

    return await QuickClashChallenge.findById(challengeId)
      .select('challenger opponent category')
      .lean()
  } catch (error) {
    console.error('Error getting challenge info:', error)
    return null
  }
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
        io.to(recipientRoom).emit(
          'quickClash:challengeCompletedByBothPlayers',
          {
            challengeId: challenge._id,
            completedByUserId,
          },
        )
      }, 100)
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

  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    // Broadcast to all users in matchmaking room
    io.to('quickClash:matchmaking').emit('quickClash:userLeft', {
      userId,
    })
  })

  globalEmitter.on(
    'quickClash:matchmakingStatusUpdated',
    ({ userId, status }) => {
      // Broadcast to all users in matchmaking room
      io.to('quickClash:matchmaking').emit('quickClash:statusUpdated', {
        userId,
        status,
      })
    },
  )

  // Event for when a bot completes a challenge
  globalEmitter.on(
    'quickClash:botCompletedChallenge',
    ({ challengeId, botId, score }) => {
      try {
        // Find the challenge to get the challenger ID
        getBasicChallengeInfo(challengeId).then(challenge => {
          if (challenge && challenge.challenger) {
            // Emit to challenger
            io.to(`quickClash:${challenge.challenger}`).emit(
              'quickClash:botCompletedChallenge',
              {
                challengeId,
                botId,
                score,
              },
            )
          }
        })
      } catch (error) {
        console.error('Error handling bot completed challenge event:', error)
      }
    },
  )

  // Add these event handlers to setupQuickClashGlobalEvents function
  globalEmitter.on(
    'quickClash:challengeStarted',
    ({ challengerId, opponentId, challengeId, category }) => {
      // Emit to both challenger and opponent
      io.to(`quickClash:${challengerId}`).emit(
        'quickClash:preparingChallenge',
        {
          challengeId,
          category,
        },
      )

      io.to(`quickClash:${opponentId}`).emit('quickClash:preparingChallenge', {
        challengeId,
        category,
      })
    },
  )

  globalEmitter.on('quickClash:challengeRaceCondition', ({ accepterId }) => {
    // Notify user who tried to accept a challenge that was already taken
    io.to(`quickClash:${accepterId}`).emit('quickClash:acceptFailed', {
      message: 'This user is no longer available for challenges',
    })
  })

  // Add these events to the setupQuickClashGlobalEvents function
  globalEmitter.on('quickClash:userLocked', ({ userId }) => {
    // Broadcast to all users in matchmaking room that this user is locked
    io.to('quickClash:matchmaking').emit('quickClash:userUnavailable', {
      userId,
    })
  })

  globalEmitter.on('quickClash:userRemoved', ({ userId }) => {
    // Broadcast to all users in matchmaking room that this user is removed
    io.to('quickClash:matchmaking').emit('quickClash:userRemoved', {
      userId,
    })
  })

  // Use unique event names to avoid conflicts
  globalEmitter.on(
    'quickClash:matchChallenge',
    ({
      challengerId,
      opponentId,
      challengeId,
      categories,
      challengerData,
      opponentData,
    }) => {
      // Emit to both users to show the creation modal
      io.to(`quickClash:${challengerId}`).emit(
        'quickClash:matchCreationStarted',
        {
          tempChallengeId: challengeId, // This is a temporary ID
          categories,
          opponent: opponentData,
          isChallenger: true,
        },
      )

      io.to(`quickClash:${opponentId}`).emit(
        'quickClash:matchCreationStarted',
        {
          tempChallengeId: challengeId, // This is a temporary ID
          categories,
          opponent: challengerData,
          isChallenger: false,
        },
      )
    },
  )

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

  globalEmitter.on(
    'quickClash:matchFailed',
    ({ challengerId, opponentId, error, oldChallengeId }) => {
      // Notify both users of the failure
      io.to(`quickClash:${challengerId}`).emit(
        'quickClash:matchCreationFailed',
        {
          error,
          oldChallengeId,
        },
      )

      io.to(`quickClash:${opponentId}`).emit('quickClash:matchCreationFailed', {
        error,
        oldChallengeId,
      })
    },
  )
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
}
