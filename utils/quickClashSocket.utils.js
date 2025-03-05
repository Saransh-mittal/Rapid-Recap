// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')

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
    console.log(
      `User ${userId} automatically joined quick clash notification room: ${quickClashRoom}`,
    )

    // Remove from tracking when socket disconnects
    socket.on('disconnect', () => {
      console.log(`User ${user?._id} disconnected from quick clash rooms`)
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

  // // Handle challenge creation
  // socket.on(
  //   'quickClash:createChallenge',
  //   async ({ opponentId, categories, challenge }) => {
  //     try {
  //       // Add a small delay to avoid race conditions
  //       setTimeout(() => {
  //         // Emit to opponent's room
  //         const opponentRoom = `quickClash:${opponentId}`
  //         io.to(opponentRoom).emit('quickClash:newChallenge', {
  //           challenge,
  //           challenger: {
  //             _id: user._id,
  //             name: user.name,
  //             inGameName: user.inGameName,
  //           },
  //         })

  //         console.log(
  //           `Quick clash challenge notification sent to user ${opponentId} in room ${opponentRoom}`,
  //         )
  //       }, 100)
  //     } catch (error) {
  //       console.error('Socket error in quickClash:createChallenge:', error)
  //     }
  //   },
  // )

  // // Handle challenge rejection
  // socket.on(
  //   'quickClash:rejectChallenge',
  //   async ({ challengerId, challengeId, category }) => {
  //     try {
  //       // Add a small delay to avoid race conditions
  //       setTimeout(() => {
  //         // Emit to challenger's room
  //         const challengerRoom = `quickClash:${challengerId}`
  //         io.to(challengerRoom).emit('quickClash:challengeRejected', {
  //           challengeId,
  //           category,
  //           opponent: {
  //             _id: user._id,
  //             name: user.name,
  //             inGameName: user.inGameName,
  //           },
  //         })

  //         console.log(
  //           `Quick clash rejection notification sent to user ${challengerId} in room ${challengerRoom}`,
  //         )
  //       }, 100)
  //     } catch (error) {
  //       console.error('Socket error in quickClash:rejectChallenge:', error)
  //     }
  //   },
  // )

  // // Handle challenge completion
  // socket.on(
  //   'quickClash:completeChallenge',
  //   async ({ opponentId, challengeId, score }) => {
  //     try {
  //       // Add a small delay to avoid race conditions
  //       setTimeout(() => {
  //         // Emit to opponent's room
  //         const opponentRoom = `quickClash:${opponentId}`
  //         io.to(opponentRoom).emit('quickClash:challengeCompleted', {
  //           challengeId,
  //           completedByUserId: user._id,
  //           score,
  //         })

  //         console.log(
  //           `Quick clash completion notification sent to user ${opponentId} in room ${opponentRoom}`,
  //         )
  //       }, 100)
  //     } catch (error) {
  //       console.error('Socket error in quickClash:completeChallenge:', error)
  //     }
  //   },
  // )

  // // Handle analysis ready notification
  // socket.on(
  //   'quickClash:analysisReady',
  //   async ({ recipientId, challengeId }) => {
  //     try {
  //       // Add a small delay to avoid race conditions
  //       setTimeout(() => {
  //         // Emit to recipient's room
  //         const recipientRoom = `quickClash:${recipientId}`
  //         io.to(recipientRoom).emit('quickClash:analysisReady', {
  //           challengeId,
  //         })

  //         console.log(
  //           `Quick clash analysis ready notification sent to user ${recipientId} in room ${recipientRoom}`,
  //         )
  //       }, 100)
  //     } catch (error) {
  //       console.error('Socket error in quickClash:analysisReady:', error)
  //     }
  //   },
  // )
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

        console.log(
          `[Global] Quick clash challenge notification sent to user ${opponent._id} in room ${opponentRoom}`,
        )
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

        console.log(
          `[Global] Quick clash creation notification sent to challenger ${challenger._id} in room ${challengerRoom} (Success: ${success})`,
        )
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

        console.log(
          `[Global] Quick clash acceptance notification sent to user ${challenger._id} in room ${challengerRoom}`,
        )
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

        console.log(
          `[Global] Quick clash rejection notification sent to user ${challenger._id} in room ${challengerRoom}`,
        )
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

        console.log(
          `[Global] Quick clash completion notification sent to user ${recipientId} in room ${recipientRoom}`,
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

        console.log(
          `[Global] Quick clash completion notification sent to user ${recipientId} in room ${recipientRoom}`,
        )
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

      console.log(
        `[Global] Quick clash analysis ready notification sent to user ${userId} in room ${userRoom}`,
      )
    }, 100)
  })
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
}
