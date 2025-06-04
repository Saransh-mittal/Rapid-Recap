// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const { sendNotification } = require('../services/notificationService')
const {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
} = require('../services/quickClashServices/quickClashMatchmakingService')
const QuickClashMatchmaking = require('../model/quickClashSchemas/quickClashMatchmakingSchema')

/**
 * Team room membership tracking (separate from device tracking)
 * Maps userId to team room membership status
 */
const teamRoomMembers = new Map() // userId -> boolean (in teams room)

/**
 * 1v1 Matchmaking room membership tracking
 * Maps userId to matchmaking room membership status
 */
const matchmakingRoomMembers = new Map() // userId -> boolean (in matchmaking room)

/**
 * Send push notification for offline users
 * @param {Object} options - Notification options
 */
async function sendTeamRemovalPushNotification({
  userId,
  teamName,
  removerName,
}) {
  try {
    await sendNotification({
      title: 'Removed from Team',
      body: `You have been removed from team "${teamName}"`,
      icon: '/images/rrlogo.webp',
      url: '/quickclash',
      userId: userId,
      type: 'quickClash',
      importance: 'important',
    })
    console.log(`[QC_PUSH] Push notification sent to offline user ${userId}`)
  } catch (error) {
    console.error(
      `[QC_PUSH] Failed to send push notification to user ${userId}:`,
      error,
    )
  }
}

/**
 * Send push notification for team invitations
 * @param {Object} options - Notification options
 */
async function sendTeamInvitationPushNotification({
  userId,
  teamName,
  inviterName,
}) {
  try {
    await sendNotification({
      title: 'Team Invitation',
      body: `${inviterName} invited you to join "${teamName}"`,
      icon: '/images/rrlogo.webp',
      url: '/quickclash',
      userId: userId,
      type: 'quickClash',
      importance: 'important',
    })
    console.log(
      `[QC_PUSH] Team invitation push notification sent to offline user ${userId}`,
    )
  } catch (error) {
    console.error(
      `[QC_PUSH] Failed to send team invitation push notification to user ${userId}:`,
      error,
    )
  }
}

/**
 * Send push notification for Quick Clash challenges
 * @param {Object} options - Notification options
 */
async function sendQuickClashChallengePushNotification({
  userId,
  challengerName,
  category,
}) {
  try {
    await sendNotification({
      title: 'Quick Clash Challenge',
      body: `${challengerName} challenged you to a ${category} Quick Clash!`,
      icon: '/images/rrlogo.webp',
      url: '/quickclash',
      userId: userId,
      type: 'quickClash',
      importance: 'important',
    })
    console.log(
      `[QC_PUSH] Challenge push notification sent to offline user ${userId}`,
    )
  } catch (error) {
    console.error(
      `[QC_PUSH] Failed to send challenge push notification to user ${userId}:`,
      error,
    )
  }
}

/**
 * Handle 1v1 matchmaking socket events with device awareness
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Client socket connection
 */
const handle1v1MatchmakingEvents = (io, socket) => {
  // User joins 1v1 matchmaking - FIXED: Handle undefined data
  socket.on('quickClash:joinMatchmaking', async (data = {}) => {
    try {
      // Ensure socket is authenticated
      if (!socket.user || !socket.user._id) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      const userId = socket.user._id.toString()
      const { deviceFingerprint } = data

      console.log(
        `[QC_1V1] Socket event: User ${userId} joining 1v1 matchmaking${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      // Join 1v1 matchmaking
      await joinMatchmaking({
        userId,
      })

      // Join matchmaking room for updates with device context
      socket.join(`quickClash:matchmaking`)
      socket.join(`quickClash:matchmaking:${userId}`)
      matchmakingRoomMembers.set(userId, true)
      console.log(`[QC_1V1] User ${userId} joined 1v1 matchmaking room`)

      // Emit confirmation with device context
      socket.emit('quickClash:joinedMatchmaking', {
        userId,
        status: 'joined',
        deviceFingerprint: deviceFingerprint
          ? deviceFingerprint.substring(0, 8) + '...'
          : null,
      })

      console.log(
        `[QC_1V1] 1v1 matchmaking join confirmation sent to user ${userId}`,
      )
    } catch (error) {
      console.error(`[QC_1V1] Error in joinMatchmaking socket event:`, error)
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to join matchmaking',
      })
    }
  })

  // User leaves 1v1 matchmaking - FIXED: Handle undefined data
  socket.on('quickClash:leaveMatchmaking', async (data = {}) => {
    try {
      if (!socket.user || !socket.user._id) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      const userId = socket.user._id.toString()
      const { deviceFingerprint } = data

      console.log(
        `[QC_1V1] Socket event: User ${userId} leaving 1v1 matchmaking${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      // Leave 1v1 matchmaking
      await leaveMatchmaking({ userId })

      // Leave matchmaking room
      socket.leave(`quickClash:matchmaking`)
      socket.leave(`quickClash:matchmaking:${userId}`)
      matchmakingRoomMembers.delete(userId)
      console.log(`[QC_1V1] User ${userId} left 1v1 matchmaking room`)

      // Emit confirmation
      socket.emit('quickClash:leftMatchmaking', {
        userId,
        status: 'left',
        deviceFingerprint: deviceFingerprint
          ? deviceFingerprint.substring(0, 8) + '...'
          : null,
      })

      console.log(
        `[QC_1V1] 1v1 matchmaking leave confirmation sent to user ${userId}`,
      )
    } catch (error) {
      console.error(`[QC_1V1] Error in leaveMatchmaking socket event:`, error)
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to leave matchmaking',
      })
    }
  })

  // Enhanced join matchmaking room - FIXED: Handle undefined data
  socket.on('quickClash:joinMatchmakingRoom', async (data = {}) => {
    try {
      if (!socket.user || !socket.user._id) {
        socket.emit('quickClash:error', {
          message: 'Authentication required',
        })
        return
      }

      const userId = socket.user._id.toString()
      const { deviceFingerprint } = data

      console.log(
        `[QC_1V1] Socket event: User ${userId} joining 1v1 matchmaking room${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      // Join the general quickClash matchmaking room
      socket.join('quickClash:matchmaking')

      // Also join user-specific matchmaking room
      socket.join(`quickClash:matchmaking:${userId}`)
      matchmakingRoomMembers.set(userId, true)

      console.log(`[QC_1V1] User ${userId} joined 1v1 matchmaking rooms`)

      // Emit confirmation
      socket.emit('quickClash:matchmakingRoomJoined', {
        userId,
        rooms: ['quickClash:matchmaking', `quickClash:matchmaking:${userId}`],
        deviceFingerprint: deviceFingerprint
          ? deviceFingerprint.substring(0, 8) + '...'
          : null,
      })
    } catch (error) {
      console.error(
        `[QC_1V1] Error in joinMatchmakingRoom socket event:`,
        error,
      )
      socket.emit('quickClash:error', {
        message: error.message || 'Failed to join matchmaking room',
      })
    }
  })

  // Enhanced disconnect handling for 1v1 matchmaking
  socket.on('disconnect', async () => {
    if (socket.user && socket.user._id) {
      try {
        const userId = socket.user._id.toString()
        console.log(`[QC_1V1] Socket disconnected for user ${userId}`)

        // Update status to offline
        await updateMatchmakingStatus({
          userId,
          status: 'offline',
        })

        // Clean up room membership
        matchmakingRoomMembers.delete(userId)

        console.log(
          `[QC_1V1] Updated 1v1 matchmaking status to offline for user ${userId}`,
        )
      } catch (error) {
        console.error(
          '[QC_1V1] Error handling disconnect for 1v1 matchmaking:',
          error,
        )
      }
    }
  })

  // Enhanced reconnect handling for 1v1 matchmaking
  socket.on('reconnect', async () => {
    if (socket.user && socket.user._id) {
      try {
        const userId = socket.user._id.toString()
        console.log(`[QC_1V1] Socket reconnected for user ${userId}`)

        // Update status to online
        await updateMatchmakingStatus({
          userId,
          status: 'online',
        })

        // Re-join matchmaking room if user was in matchmaking
        const matchmakingEntry = await QuickClashMatchmaking.findOne({
          user: userId,
        })

        if (matchmakingEntry) {
          socket.join('quickClash:matchmaking')
          socket.join(`quickClash:matchmaking:${userId}`)
          matchmakingRoomMembers.set(userId, true)
          console.log(
            `[QC_1V1] Re-joined 1v1 matchmaking rooms for user ${userId}`,
          )
        }
      } catch (error) {
        console.error(
          '[QC_1V1] Error handling reconnect for 1v1 matchmaking:',
          error,
        )
      }
    }
  })
}

/**
 * Setup socket event handlers for Quick Clash feature
 * Uses the main socket.js device tracking system instead of maintaining separate tracking
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
  const socketId = socket.id
  const quickClashRoom = `quickClash:${userId}`

  console.log(
    `[QC_SETUP] Setting up QuickClash handlers for user ${userId} socket ${socketId}`,
  )

  // Listen for device fingerprint from client (but don't track separately)
  socket.on('quickClash:registerDevice', ({ deviceFingerprint }) => {
    if (!deviceFingerprint) {
      console.error(
        'No device fingerprint provided for QuickClash socket registration',
      )
      return
    }

    console.log(
      `[QC_DEVICE] QuickClash device registered for user ${userId} device ${deviceFingerprint.substring(
        0,
        8,
      )}...`,
    )

    // Emit confirmation (device tracking is handled by main socket.js)
    socket.emit('quickClash:deviceRegistered', {
      deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
      socketId,
      isUnique: true,
    })
  })

  // Handle socket disconnection
  socket.on('disconnect', () => {
    // Clean up team room membership
    teamRoomMembers.delete(userId)
    // Clean up 1v1 matchmaking room membership
    matchmakingRoomMembers.delete(userId)
    console.log(
      `[QC_DISCONNECT] Socket ${socketId} disconnected from QuickClash for user ${userId}`,
    )
  })

  // Listen for explicit join requests
  socket.on('quickClash:join', (data = {}) => {
    const { deviceFingerprint } = data
    console.log(
      `[QC_JOIN] User ${userId} explicitly joined QuickClash socket channel${
        deviceFingerprint
          ? ` with device ${deviceFingerprint.substring(0, 8)}...`
          : ''
      }`,
    )
  })

  // FIXED: Listen for explicit request to join the teams room with proper undefined handling
  socket.on('quickClash:joinTeamsRoom', (data = {}) => {
    const { deviceFingerprint } = data

    if (!teamRoomMembers.get(userId)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(
        `[QC_TEAMS] User ${userId} joined QuickClash teams room${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      // DEBUG: Verify teams room joining
      setTimeout(() => {
        const teamsRoom = io.sockets.adapter.rooms.get('quickClash:teams')
        console.log(
          `DEBUG: quickClash:teams room now has ${
            teamsRoom ? teamsRoom.size : 0
          } sockets`,
        )
      }, 100)
    } else {
      console.log(`[QC_TEAMS] User ${userId} already in QuickClash teams room`)
    }
  })

  socket.on('join', room => {
    socket.join(room)
    console.log(`[QC_ROOM] User ${userId} joined room: ${room}`)
  })

  // Set up 1v1 matchmaking event handlers
  handle1v1MatchmakingEvents(io, socket)

  // Add listeners for team matchmaking
  socket.on('quickClash:joinGlobalMatchmaking', data => {
    console.log(
      `[QC_MM] Socket event: User ${userId} requested to join global matchmaking`,
    )
  })

  socket.on('quickClash:leaveGlobalMatchmaking', () => {
    console.log(
      `[QC_MM] Socket event: User ${userId} requested to leave global matchmaking`,
    )
  })

  // FIXED: Handle team matchmaking join with proper undefined handling
  socket.on('quickClash:joinTeamMatchmaking', (data = {}) => {
    const { teamId, deviceFingerprint } = data

    console.log(
      `[QC_MM] Socket event: User ${userId} requested to join team matchmaking with team ${teamId}${
        deviceFingerprint
          ? ` with device ${deviceFingerprint.substring(0, 8)}...`
          : ''
      }`,
    )

    // Automatically join the teams room when joining team matchmaking
    if (!teamRoomMembers.get(userId)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(
        `[QC_TEAMS] User ${userId} joined QuickClash teams room (via team matchmaking)`,
      )
    }
  })

  // FIXED: Handle viewing team battles with proper undefined handling
  socket.on('quickClash:viewTeamBattles', (data = {}) => {
    const { deviceFingerprint } = data

    if (!teamRoomMembers.get(userId)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(
        `[QC_TEAMS] User ${userId} joined QuickClash teams room (via team battles view)${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )
    }
  })
}

/**
 * Setup global emitter event handlers for Quick Clash
 * Enhanced to use the unified device tracking system
 * @param {Object} io - Socket.io instance
 * @param {Object} utils - Utility functions from main socket.js
 */
const setupQuickClashGlobalEvents = (io, utils = {}) => {
  const { notifyUserAllDevices, getUserActiveDevices } = utils

  // Helper function to notify user with fallback
  const notifyUser = (userId, event, data) => {
    if (notifyUserAllDevices) {
      return notifyUserAllDevices(userId, event, data)
    } else {
      // Fallback to room-based notification
      const userRoom = `quickClash:${userId}`
      io.to(userRoom).emit(event, data)
      console.log(`[QC_NOTIFY] Fallback notification sent to room ${userRoom}`)
      return true
    }
  }

  // ==========================================
  // 1V1 MATCHMAKING AND CHALLENGE EVENTS
  // ==========================================

  // Listen for user joined 1v1 matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, userData, preferredCategories }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userJoinedMatchmaking event',
        )
        return
      }

      console.log(
        `[QC_1V1] SOCKET: User ${userId} (${userData?.name}) joined 1v1 matchmaking`,
      )

      // Emit to the user's room to confirm joining
      const success = notifyUser(userId, 'quickClash:joinedMatchmaking', {
        userId,
        preferredCategories,
        status: 'joined',
      })
      console.log(
        `[QC_1V1] Joined 1v1 matchmaking notification sent to ${userId}: ${success}`,
      )
    },
  )

  // Listen for user left 1v1 matchmaking
  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:userLeftMatchmaking event')
      return
    }

    console.log(`[QC_1V1] SOCKET: User ${userId} left 1v1 matchmaking`)

    // Emit to the user's room to confirm leaving
    const success = notifyUser(userId, 'quickClash:leftMatchmaking', {
      userId,
      status: 'left',
    })
    console.log(
      `[QC_1V1] Left 1v1 matchmaking notification sent to ${userId}: ${success}`,
    )
  })

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
        const success = notifyUser(opponent._id, 'quickClash:newChallenge', {
          challenge,
          challenger,
        })
        console.log(
          `[QC_EVENT] Challenge created notification sent to ${opponent._id}: ${success}`,
        )

        // If opponent is offline, send push notification
        if (!success) {
          console.log(
            `[QC_EVENT] Opponent ${opponent._id} offline, sending push notification`,
          )
          sendQuickClashChallengePushNotification({
            userId: opponent._id,
            challengerName: challenger.name || challenger.inGameName,
            category: challenge.category,
          })
        }
      }, 100)
    },
  )

  // Listen for challenge progress updates and relay to clients
  globalEmitter.on(
    'quickClash:challengeProgress',
    ({ userId, step, progress }) => {
      if (!userId) {
        console.error('Invalid userId in quickClash:challengeProgress event')
        return
      }

      // Emit to the user with a small delay to avoid race conditions
      setTimeout(() => {
        const success = notifyUser(userId, 'quickClash:challengeProgress', {
          step,
          progress,
        })
        console.log(
          `[QC_EVENT] Challenge progress sent to ${userId}: ${success}`,
        )
      }, 50)
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
        const notifySuccess = notifyUser(
          challenger._id,
          'quickClash:challengerNotified',
          {
            challenge,
            opponent,
            success,
            errorMessage,
          },
        )
        console.log(
          `[QC_EVENT] Challenger notified sent to ${challenger._id}: ${notifySuccess}`,
        )
      }, 100)
    },
  )

  // New events for 1v1 matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, trophies, userName }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userJoinedMatchmaking event',
        )
        return
      }

      console.log(
        `[QC_1V1] SOCKET: User ${userId} (${userName}) joined 1v1 matchmaking with ${trophies} trophies`,
      )

      // Emit to the user's room to confirm joining
      const success = notifyUser(userId, 'quickClash:joinedMatchmaking', {
        userId,
        trophies,
        status: 'joined',
      })
      console.log(
        `[QC_1V1] Joined 1v1 matchmaking notification sent to ${userId}: ${success}`,
      )
    },
  )

  // New event for 1v1 match preparation notification
  globalEmitter.on(
    'quickClash:matchFound',
    ({ challenger, opponent, tempChallengeId }) => {
      // Send match found notification to both users
      if (challenger && challenger._id) {
        const challengerSuccess = notifyUser(
          challenger._id,
          'quickClash:matchFound',
          {
            opponent: {
              name: opponent.name,
              inGameName: opponent.inGameName,
              pic: opponent.pic,
              _id: opponent._id,
              quickClashTrophies: opponent.quickClashTrophies,
            },
            tempChallengeId,
            isChallenger: true,
          },
        )
        console.log(
          `[QC_EVENT] Match found sent to challenger ${challenger._id}: ${challengerSuccess}`,
        )
      }

      if (opponent && opponent._id) {
        const opponentSuccess = notifyUser(
          opponent._id,
          'quickClash:matchFound',
          {
            opponent: {
              name: challenger.name,
              inGameName: challenger.inGameName,
              pic: challenger.pic,
              _id: challenger._id,
              quickClashTrophies: challenger.quickClashTrophies,
            },
            tempChallengeId,
            isChallenger: false,
          },
        )
        console.log(
          `[QC_EVENT] Match found sent to opponent ${opponent._id}: ${opponentSuccess}`,
        )
      }
    },
  )

  globalEmitter.on('quickClash:challengeRaceCondition', ({ accepterId }) => {
    // Notify user who tried to accept a challenge that was already taken
    const success = notifyUser(accepterId, 'quickClash:acceptFailed', {
      message: 'This user is no longer available for challenges',
    })
    console.log(
      `[QC_EVENT] Challenge race condition sent to ${accepterId}: ${success}`,
    )
  })

  globalEmitter.on(
    'quickClash:matchReady',
    ({ challengeId, challengerData, opponentData, oldChallengeId }) => {
      // Send the real challenge ID to both users
      const challengerSuccess = notifyUser(
        challengerData._id,
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        },
      )
      console.log(
        `[QC_EVENT] Match challenge ready sent to challenger ${challengerData._id}: ${challengerSuccess}`,
      )

      const opponentSuccess = notifyUser(
        opponentData._id,
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        },
      )
      console.log(
        `[QC_EVENT] Match challenge ready sent to opponent ${opponentData._id}: ${opponentSuccess}`,
      )
    },
  )

  globalEmitter.on(
    'quickClash:matchCreationFailed',
    ({ challengerId, opponentId, tempChallengeId, error }) => {
      if (!challengerId || !opponentId) {
        console.error(
          'Invalid user IDs in quickClash:matchCreationFailed event',
        )
        return
      }

      console.log(
        `[QC_EVENT] Match creation failed between ${challengerId} and ${opponentId}: ${error}`,
      )

      // Notify both users about the failure
      const challengerSuccess = notifyUser(
        challengerId,
        'quickClash:matchCreationFailed',
        {
          error,
          tempChallengeId,
          opponentId,
        },
      )
      console.log(
        `[QC_EVENT] Match creation failed notification sent to challenger ${challengerId}: ${challengerSuccess}`,
      )

      const opponentSuccess = notifyUser(
        opponentId,
        'quickClash:matchCreationFailed',
        {
          error,
          tempChallengeId,
          challengerId,
        },
      )
      console.log(
        `[QC_EVENT] Match creation failed notification sent to opponent ${opponentId}: ${opponentSuccess}`,
      )
    },
  )

  // NEW: Enhanced error handling for general challenge creation failures
  globalEmitter.on(
    'quickClash:challengeCreationFailed',
    ({ challengerId, opponentId, error }) => {
      if (!challengerId || !opponentId) {
        console.error(
          'Invalid user IDs in quickClash:challengeCreationFailed event',
        )
        return
      }

      console.log(
        `[QC_EVENT] Challenge creation failed between ${challengerId} and ${opponentId}: ${error}`,
      )

      // Notify both users about the failure
      const challengerSuccess = notifyUser(
        challengerId,
        'quickClash:challengeCreationFailed',
        {
          error,
          opponentId,
        },
      )
      console.log(
        `[QC_EVENT] Challenge creation failed notification sent to challenger ${challengerId}: ${challengerSuccess}`,
      )

      const opponentSuccess = notifyUser(
        opponentId,
        'quickClash:challengeCreationFailed',
        {
          error,
          challengerId,
        },
      )
      console.log(
        `[QC_EVENT] Challenge creation failed notification sent to opponent ${opponentId}: ${opponentSuccess}`,
      )
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
        const success = notifyUser(
          challenger._id,
          'quickClash:challengeAccepted',
          {
            challengeId,
            category,
            opponent,
          },
        )
        console.log(
          `[QC_EVENT] Challenge accepted sent to ${challenger._id}: ${success}`,
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
        const success = notifyUser(
          challenger._id,
          'quickClash:challengeRejected',
          {
            challengeId,
            category,
            opponent,
          },
        )
        console.log(
          `[QC_EVENT] Challenge rejected sent to ${challenger._id}: ${success}`,
        )
      }, 100)
    },
  )

  globalEmitter.on(
    'quickClash:challengeCompletedByBothPlayers',
    ({
      challenge,
      trackWinnerOutcomeResult,
      completedByUserId,
      teamBattleParticipantIds,
    }) => {
      if (!challenge) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompletedByBothPlayers event',
        )
        return
      }
      if (teamBattleParticipantIds && teamBattleParticipantIds.length > 0) {
        setTimeout(() => {
          // make a new socket event for team battle refetch
          let notifiedCount = 0
          for (let id of teamBattleParticipantIds) {
            const success = notifyUser(
              id.toString(),
              'quickClash:teamBattleRefetch',
              {
                battleId: challenge.teamBattle.toString(),
              },
            )
            if (success) notifiedCount++
          }
          console.log(
            `[QC_EVENT] Team battle refetch sent to ${notifiedCount}/${teamBattleParticipantIds.length} participants`,
          )
        }, 300)
      } else {
        if (!challenge || !challenge.challenger || !challenge.opponent) {
          console.error(
            'Invalid challenge object in quickClash:challengeCompleted event',
          )
          return
        }

        // Create detailed data objects for both players
        const challengerData = {
          userId: challenge.challenger._id,
          user: {
            _id: challenge.challenger._id,
            name: challenge.challenger.name,
            inGameName: challenge.challenger.inGameName,
            pic: challenge.challenger.pic,
          },
          opponent: {
            _id: challenge.opponent._id,
            name: challenge.opponent.name,
            inGameName: challenge.opponent.inGameName,
            pic: challenge.opponent.pic,
          },
          userScore: challenge.challengerScore,
          opponentScore: challenge.opponentScore,
          category: challenge.category,
          challengeId: challenge._id.toString(),
          trackWinnerOutcomeResult,
          completedByUserId,
        }

        const opponentData = {
          userId: challenge.opponent._id,
          user: {
            _id: challenge.opponent._id,
            name: challenge.opponent.name,
            inGameName: challenge.opponent.inGameName,
            pic: challenge.opponent.pic,
          },
          opponent: {
            _id: challenge.challenger._id,
            name: challenge.challenger.name,
            inGameName: challenge.challenger.inGameName,
            pic: challenge.challenger.pic,
          },
          userScore: challenge.opponentScore,
          opponentScore: challenge.challengerScore,
          category: challenge.category,
          challengeId: challenge._id.toString(),
          trackWinnerOutcomeResult,
          completedByUserId,
        }

        // Add a small delay to avoid race conditions
        setTimeout(() => {
          const challengerSuccess = notifyUser(
            challenge.challenger._id.toString(),
            'quickClash:challengeCompletedByBothPlayers',
            challengerData,
          )
          console.log(
            `[QC_EVENT] Challenge completed sent to challenger ${challenge.challenger._id}: ${challengerSuccess}`,
          )
        }, 100)

        setTimeout(() => {
          const opponentSuccess = notifyUser(
            challenge.opponent._id.toString(),
            'quickClash:challengeCompletedByBothPlayers',
            opponentData,
          )
          console.log(
            `[QC_EVENT] Challenge completed sent to opponent ${challenge.opponent._id}: ${opponentSuccess}`,
          )
        }, 200)
      }
    },
  )

  // Listen for challenge completed event from controller
  globalEmitter.on(
    'quickClash:challengeCompleted',
    ({ challenge, completedByUserId, teamBattleParticipantIds }) => {
      if (!challenge) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompleted event',
        )
        return
      }
      if (teamBattleParticipantIds && teamBattleParticipantIds.length > 0) {
        setTimeout(() => {
          // make a new socket event for team battle refetch
          let notifiedCount = 0
          for (let id of teamBattleParticipantIds) {
            const success = notifyUser(
              id.toString(),
              'quickClash:teamBattleRefetch',
              {
                battleId: challenge.teamBattle.toString(),
              },
            )
            if (success) notifiedCount++
          }
          console.log(
            `[QC_EVENT] Team battle refetch sent to ${notifiedCount}/${teamBattleParticipantIds.length} participants`,
          )
        }, 300)
      } else {
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
          const success = notifyUser(
            recipientId,
            'quickClash:challengeCompleted',
            {
              challengeId: challenge._id,
              completedByUserId,
            },
          )
          console.log(
            `[QC_EVENT] Challenge completed sent to ${recipientId}: ${success}`,
          )
        }, 100)
      }
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
      const success = notifyUser(userId, 'quickClash:analysisReady', {
        challengeId,
      })
      console.log(`[QC_EVENT] Analysis ready sent to ${userId}: ${success}`)
    }, 100)
  })

  // ==========================================
  // TEAM MATCHMAKING SOCKET EVENT HANDLERS
  // ==========================================

  // Enhanced helper function to notify all members of a specific team
  // Also sends push notifications to offline members
  async function notifyTeamMembers(teamId, event, data, excludeUserIds = []) {
    try {
      if (!teamId) {
        console.error('notifyTeamMembers: teamId is required')
        return
      }

      // Fetch team members from the database
      const team = await QuickClashTeam.findById(teamId)
        .select('members name')
        .lean()

      if (!team || !team.members || !Array.isArray(team.members)) {
        console.error(
          `Cannot notify team members: Team ${teamId} not found or has no members`,
        )
        return
      }

      let notifiedCount = 0
      let offlineCount = 0
      const excludeSet = new Set(excludeUserIds.map(id => id.toString()))

      // Send event to each team member (excluding any specified exclusions)
      for (const member of team.members) {
        const userId = member.user.toString()

        // Skip if user is in exclude list
        if (excludeSet.has(userId)) {
          continue
        }

        // Use enhanced notification system
        const success = notifyUser(userId, event, {
          ...data,
          teamName: team.name, // Include team name for context
        })

        if (success) {
          notifiedCount++
        } else {
          offlineCount++
          // Send push notification for certain events to offline users
          if (event === 'quickClash:teamMemberJoined') {
            try {
              await sendNotification({
                title: 'Team Member Joined',
                body: `${data.userName} joined your team "${team.name}"`,
                icon: '/images/rrlogo.webp',
                url: '/quickclash',
                userId: userId,
                type: 'quickClash',
                importance: 'normal',
              })
              console.log(
                `[QC_PUSH] Team member joined push notification sent to offline user ${userId}`,
              )
            } catch (error) {
              console.error(
                `[QC_PUSH] Failed to send team member joined push notification:`,
                error,
              )
            }
          } else if (event === 'quickClash:teamMemberLeft') {
            try {
              await sendNotification({
                title: 'Team Member Left',
                body: `${data.userName} left your team "${team.name}"`,
                icon: '/images/rrlogo.webp',
                url: '/quickclash',
                userId: userId,
                type: 'quickClash',
                importance: 'normal',
              })
              console.log(
                `[QC_PUSH] Team member left push notification sent to offline user ${userId}`,
              )
            } catch (error) {
              console.error(
                `[QC_PUSH] Failed to send team member left push notification:`,
                error,
              )
            }
          }
        }
      }

      console.log(
        `[QC_TEAM] notifyTeamMembers: Sent ${event} to ${notifiedCount}/${team.members.length} members of team ${teamId} (${team.name}). ${offlineCount} offline members.`,
      )
    } catch (error) {
      console.error(`Error notifying team members for team ${teamId}:`, error)
    }
  }

  // Listen for user joined global matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, trophies, userName }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userJoinedMatchmaking event',
        )
        return
      }

      console.log(
        `[QC_MM] SOCKET: User ${userId} (${userName}) joined global matchmaking with ${trophies} trophies`,
      )

      // Emit to the user's room to confirm joining
      const success = notifyUser(userId, 'quickClash:joinedGlobalMatchmaking', {
        userId,
        trophies,
      })
      console.log(
        `[QC_MM] Joined global matchmaking notification sent to ${userId}: ${success}`,
      )
    },
  )

  // Listen for user left global matchmaking
  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:userLeftMatchmaking event')
      return
    }

    console.log(`[QC_MM] SOCKET: User ${userId} left global matchmaking`)

    // Emit to the user's room to confirm leaving
    const success = notifyUser(userId, 'quickClash:leftGlobalMatchmaking', {
      userId,
    })
    console.log(
      `[QC_MM] Left global matchmaking notification sent to ${userId}: ${success}`,
    )
  })

  // Listen for team joined matchmaking
  globalEmitter.on('quickClash:teamJoinedMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamJoinedMatchmaking event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data?.teamId} (${data?.teamName}) joined matchmaking with ${data?.avgTrophies} avg trophies`,
    )

    notifyTeamMembers(data?.teamId, 'quickClash:teamJoinedMatchmaking', data)
  })

  globalEmitter.on('quickClash:teamLeftMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamLeftMatchmaking event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data.teamId} left matchmaking` +
        (data.reason ? ` (Reason: ${data.reason})` : '') +
        (data.initiator ? ` (Initiated by: ${data.initiator})` : ''),
    )

    // If there's a specific userId target, send directly to that user ONLY
    if (data.userId) {
      const success = notifyUser(
        data.userId,
        'quickClash:teamLeftMatchmaking',
        data,
      )
      console.log(
        `[QC_MM] Team left matchmaking notification sent to specific user ${data.userId}: ${success}`,
      )
      return
    }

    notifyTeamMembers(data.teamId, 'quickClash:teamLeftMatchmaking', data)
  })

  // Fixed handler for team returned to matchmaking - only notify team members
  globalEmitter.on('quickClash:teamReturnedToMatchmaking', data => {
    if (!data.teamId) {
      console.error(
        'Invalid teamId in quickClash:teamReturnedToMatchmaking event',
      )
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data.teamId} returned to matchmaking` +
        (data.reason ? ` (Reason: ${data.reason})` : ''),
    )

    // Only notify members of this specific team
    notifyTeamMembers(data.teamId, 'quickClash:teamReturnedToMatchmaking', data)
  })

  // Listen for team battle ready
  globalEmitter.on(
    'quickClash:teamBattleReady',
    ({
      battleId,
      teamId,
      teamA,
      teamB,
      categories,
      teamAMembers,
      teamBMembers,
      userId,
    }) => {
      console.log(
        `[QC_BATTLE] SOCKET: Team battle ${battleId} ready between teams ${
          teamA || 'auto-formed'
        } and ${teamB || 'auto-formed'}`,
      )

      // If there's a specific userId, send to just that user (this happens for solo players)
      if (userId) {
        console.log(
          `[QC_BATTLE] SOCKET: Sending battle ready notification to solo player ${userId}`,
        )
        const success = notifyUser(userId, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamId || teamA,
          teamA,
          teamB,
          isSoloPlayer: true,
        })
        console.log(
          `[QC_BATTLE] Team battle ready sent to solo player ${userId}: ${success}`,
        )
        return
      }

      // For regular teams, use notifyTeamMembers to send to all team members
      if (teamA) {
        console.log(
          `[QC_BATTLE] SOCKET: Notifying Team A members about battle ready`,
        )
        notifyTeamMembers(teamA, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamA,
          teamA,
          teamB,
        })
      }

      if (teamB) {
        console.log(
          `[QC_BATTLE] SOCKET: Notifying Team B members about battle ready`,
        )
        notifyTeamMembers(teamB, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamB,
          teamA,
          teamB,
        })
      }
    },
  )

  // Listen for team battle completed
  globalEmitter.on(
    'quickClash:teamBattleCompleted',
    ({ battleId, winner, teamA, teamB }) => {
      console.log(
        `[QC_BATTLE] SOCKET: Team battle ${battleId} completed. Winner: ${winner}`,
      )

      // FIXED: Notify only the team members involved in this battle
      if (teamA) {
        notifyTeamMembers(teamA, 'quickClash:teamBattleCompleted', {
          battleId,
          winner,
          teamA,
          teamB,
          isTeamA: true,
        })
      }

      if (teamB) {
        notifyTeamMembers(teamB, 'quickClash:teamBattleCompleted', {
          battleId,
          winner,
          teamA,
          teamB,
          isTeamA: false,
        })
      }
    },
  )

  // FIXED: Team invitation accepted event - notify only team members
  globalEmitter.on(
    'quickClash:teamInvitationAccepted',
    ({ teamId, userId, inviterName, userName, userInGameName }) => {
      if (!teamId || !userId) {
        console.error('Invalid data in quickClash:teamInvitationAccepted event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${userId} accepted team invitation for team ${teamId} from ${inviterName}`,
      )

      // FIXED: Only notify the specific team members, EXCLUDING the user who accepted to prevent duplicates
      notifyTeamMembers(
        teamId,
        'quickClash:teamInvitationAccepted',
        {
          teamId,
          userId,
          inviterName,
          userName,
          userInGameName,
        },
        [userId],
      ) // Exclude the user who accepted

      // Notify the user who accepted the invitation separately
      const success = notifyUser(userId, 'quickClash:teamInvitationAccepted', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
      console.log(
        `[QC_TEAM] Team invitation accepted notification sent to user ${userId}: ${success}`,
      )
    },
  )

  // FIXED: Team invitation rejected event - notify only team members
  globalEmitter.on(
    'quickClash:teamInvitationRejected',
    ({ teamId, userId, inviterName, userName, userInGameName }) => {
      if (!teamId || !userId) {
        console.error('Invalid data in quickClash:teamInvitationRejected event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${userId} rejected team invitation for team ${teamId} from ${inviterName}`,
      )

      // FIXED: Only notify the specific team members, EXCLUDING the user who rejected to prevent duplicates
      notifyTeamMembers(
        teamId,
        'quickClash:teamInvitationRejected',
        {
          teamId,
          userId,
          inviterName,
          userName,
          userInGameName,
        },
        [userId],
      ) // Exclude the user who rejected

      // Notify the user who rejected the invitation separately
      const success = notifyUser(userId, 'quickClash:teamInvitationRejected', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
      console.log(
        `[QC_TEAM] Team invitation rejected notification sent to user ${userId}: ${success}`,
      )
    },
  )

  // FIXED: Team invitation received event - notify only the invitee
  globalEmitter.on(
    'quickClash:teamInvitationReceived',
    ({ inviteeId, invitationId, teamName, inviterName }) => {
      if (!inviteeId) {
        console.error('Invalid data in quickClash:teamInvitationReceived event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${inviteeId} received team invitation from ${inviterName} for team ${teamName}`,
      )

      // FIXED: Only notify the specific invitee, not all teams
      const success = notifyUser(
        inviteeId,
        'quickClash:teamInvitationReceived',
        {
          invitationId,
          teamName,
          inviterName,
        },
      )
      console.log(
        `[QC_TEAM] Team invitation received notification sent to ${inviteeId}: ${success}`,
      )

      // If invitee is offline, send push notification
      if (!success) {
        console.log(
          `[QC_TEAM] Invitee ${inviteeId} offline, sending push notification`,
        )
        sendTeamInvitationPushNotification({
          userId: inviteeId,
          teamName,
          inviterName,
        })
      }
    },
  )

  // FIXED: Team member joined event - notify only team members
  globalEmitter.on(
    'quickClash:teamMemberJoined',
    ({ team, user, userName, userInGameName }) => {
      if (!team || !user) {
        console.error('Invalid data in quickClash:teamMemberJoined event')
        return
      }

      console.log(`[QC_TEAM] SOCKET: User ${user} joined team ${team}`)

      // FIXED: Only notify the specific team members, not all teams
      notifyTeamMembers(team, 'quickClash:teamMemberJoined', {
        teamId: team,
        userId: user,
        userName,
        userInGameName,
      })
    },
  )

  // FIXED: Team member left event - notify only team members
  globalEmitter.on(
    'quickClash:teamMemberLeft',
    ({ team, user, userName, userInGameName }) => {
      if (!team || !user) {
        console.error('Invalid data in quickClash:teamMemberLeft event')
        return
      }

      console.log(`[QC_TEAM] SOCKET: User ${user} left team ${team}`)

      // FIXED: Only notify the specific team members, not all teams
      notifyTeamMembers(team, 'quickClash:teamMemberLeft', {
        teamId: team,
        userId: user,
        userName,
        userInGameName,
      })
    },
  )

  // FIXED: Team member removed event - notify only team members
  globalEmitter.on(
    'quickClash:teamMemberRemoved',
    ({
      team,
      leader,
      removedMember,
      teamName,
      removedMemberName,
      removedMemberInGameName,
    }) => {
      if (!team || !leader || !removedMember) {
        console.error('Invalid data in quickClash:teamMemberRemoved event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${removedMember} was removed from team ${team} by ${leader}`,
      )

      // FIXED: Notify team members EXCLUDING the removed member to prevent duplicates
      notifyTeamMembers(
        team,
        'quickClash:teamMemberRemoved',
        {
          teamId: team,
          leaderId: leader,
          removedMemberId: removedMember,
          teamName,
          removedMemberName,
          removedMemberInGameName,
          isCurrentUser: false,
          isLeader: leader === removedMember,
        },
        [removedMember],
      ) // Exclude the removed member from team notifications

      // Notify the removed member separately with different data
      const success = notifyUser(
        removedMember,
        'quickClash:teamMemberRemoved',
        {
          teamId: team,
          leaderId: leader,
          removedMemberId: removedMember,
          isCurrentUser: true,
          teamName,
          removedMemberName,
          removedMemberInGameName,
        },
      )
      console.log(
        `[QC_TEAM] Team member removed notification sent to ${removedMember}: ${success}`,
      )

      // If removed user is offline, send push notification
      if (!success) {
        console.log(
          `[QC_TEAM] User ${removedMember} offline, sending push notification`,
        )
        // TODO: Add push notification service call here
        sendTeamRemovalPushNotification({
          userId: removedMember,
          teamName,
          removerName: removedMemberName,
        })
      }
    },
  )

  // Listen for team member selected category
  globalEmitter.on(
    'quickClash:teamMemberSelectedCategory',
    ({ battleId, userId, category, team, opponentTeam }) => {
      if (!battleId || !userId || !category) {
        console.error(
          'Invalid data in quickClash:teamMemberSelectedCategory event',
        )
        return
      }

      console.log(
        `[QC_BATTLE] SOCKET: User ${userId} selected category ${category} for team ${team} in battle ${battleId}`,
      )

      // FIXED: Only notify members of both teams involved in this battle
      if (team) {
        notifyTeamMembers(team, 'quickClash:teamMemberSelectedCategory', {
          battleId,
          userId,
          category,
          team,
          isOwnTeam: true,
        })
      }

      if (opponentTeam) {
        notifyTeamMembers(
          opponentTeam,
          'quickClash:teamMemberSelectedCategory',
          {
            battleId,
            userId,
            category,
            team,
            isOwnTeam: false,
          },
        )
      }
    },
  )

  globalEmitter.on(
    'quickClash:teamMemberDeselectedCategory',
    ({ battleId, userId, category, team, opponentTeam }) => {
      if (!battleId || !userId || !category) {
        console.error(
          'Invalid data in quickClash:teamMemberDeselectedCategory event',
        )
        return
      }

      console.log(
        `[QC_BATTLE] SOCKET: User ${userId} deselected category ${category} for team ${team} in battle ${battleId}`,
      )

      // FIXED: Only notify members of both teams involved in this battle
      if (team) {
        notifyTeamMembers(team, 'quickClash:teamMemberDeselectedCategory', {
          battleId,
          userId,
          category,
          team,
          isOwnTeam: true,
        })
      }

      if (opponentTeam) {
        notifyTeamMembers(
          opponentTeam,
          'quickClash:teamMemberDeselectedCategory',
          {
            battleId,
            userId,
            category,
            team,
            isOwnTeam: false,
          },
        )
      }
    },
  )

  // Enhanced matchmaking lock/unlock events with better member notification
  globalEmitter.on('quickClash:matchmakingLocked', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:matchmakingLocked event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Teams ${data.teamA} and ${data.teamB} locked in matchmaking`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const teamName = data.teamAMembers.includes(userId)
          ? data.teamAName
          : data.teamBName

        // Use enhanced notification system
        const success = notifyUser(userId, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: userTeamId,
          teamName: teamName,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_MM] Matchmaking locked notification sent to ${notifiedCount}/${data.allMembers.length} members`,
      )
    } else {
      // Fallback to team-based notification if no member IDs provided
      try {
        notifyTeamMembers(data.teamA, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: data.teamA,
        })

        notifyTeamMembers(data.teamB, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: data.teamB,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about matchmaking lock:',
          err,
        )
      }
    }
  })

  // Listen for matchmaking unlocked event - use direct member notification
  globalEmitter.on('quickClash:matchmakingUnlocked', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:matchmakingUnlocked event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Teams ${data.teamA} and ${data.teamB} unlocked from matchmaking`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        // Use enhanced notification system
        const success = notifyUser(userId, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: userTeamId,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_MM] Matchmaking unlocked notification sent to ${notifiedCount}/${data.allMembers.length} members`,
      )
    } else {
      // Fallback to team-based notification if no member IDs provided
      try {
        notifyTeamMembers(data.teamA, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: data.teamA,
        })

        notifyTeamMembers(data.teamB, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: data.teamB,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about matchmaking unlock:',
          err,
        )
      }
    }
  })

  // Listen for battle creation started event - use direct member notification
  globalEmitter.on('quickClash:battleCreationStarted', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:battleCreationStarted event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Battle creation started for teams ${data.teamA} and ${data.teamB}`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const opponentTeamId = data.teamAMembers.includes(userId)
          ? data.teamB
          : data.teamA

        // Use enhanced notification system
        const success = notifyUser(userId, 'quickClash:battleCreationStarted', {
          teamId: userTeamId,
          opponentTeam: opponentTeamId,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation started notification sent to ${notifiedCount}/${data.allMembers.length} members`,
      )
    } else {
      // Fallback to team-based notification if no member IDs provided
      try {
        notifyTeamMembers(data.teamA, 'quickClash:battleCreationStarted', {
          teamId: data.teamA,
          opponentTeam: data.teamB,
        })

        notifyTeamMembers(data.teamB, 'quickClash:battleCreationStarted', {
          teamId: data.teamB,
          opponentTeam: data.teamA,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about battle creation:',
          err,
        )
      }
    }
  })

  // Listen for battle creation failed event - use direct member notification
  globalEmitter.on('quickClash:battleCreationFailed', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:battleCreationFailed event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Battle creation failed for teams ${data.teamA} and ${data.teamB}`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        // Use enhanced notification system
        const success = notifyUser(userId, 'quickClash:battleCreationFailed', {
          teamId: userTeamId,
          error: data.error,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation failed notification sent to ${notifiedCount}/${data.allMembers.length} members`,
      )
    } else {
      // Fallback to team-based notification if no member IDs provided
      try {
        notifyTeamMembers(data.teamA, 'quickClash:battleCreationFailed', {
          teamId: data.teamA,
          error: data.error,
        })

        notifyTeamMembers(data.teamB, 'quickClash:battleCreationFailed', {
          teamId: data.teamB,
          error: data.error,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about battle creation failure:',
          err,
        )
      }
    }
  })

  globalEmitter.on('quickClash:battleCreationCleanedUp', data => {
    console.log(
      `[QC_BATTLE] SOCKET: Battle creation cleaned up for teams ${data.teamA} and ${data.teamB}`,
    )

    // Send notification to all affected members using enhanced notification system
    if (data.memberIds && data.memberIds.length > 0) {
      let notifiedCount = 0
      data.memberIds.forEach(memberId => {
        const success = notifyUser(
          memberId,
          'quickClash:battleCreationCleanedUp',
          {
            message: data.message,
            teamA: data.teamA,
            teamB: data.teamB,
          },
        )
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation cleanup notification sent to ${notifiedCount}/${data.memberIds.length} members`,
      )
    }

    // Also send to the battle creation room if it exists
    if (data.teamA && data.teamB) {
      const roomId = `battle_creation_${data.teamA}_${data.teamB}`
      io.to(roomId).emit('quickClash:battleCreationCleanedUp', {
        message: data.message,
        teamA: data.teamA,
        teamB: data.teamB,
      })
    }
  })
}

/**
 * Get connection statistics for debugging (includes both team and 1v1 matchmaking)
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  return {
    teamRoomMembers: teamRoomMembers.size,
    teamRoomMemberList: Array.from(teamRoomMembers.keys()),
    matchmakingRoomMembers: matchmakingRoomMembers.size,
    matchmakingRoomMemberList: Array.from(matchmakingRoomMembers.keys()),
  }
}

/**
 * Check if user is in teams room
 * @param {string} userId - User ID
 * @returns {boolean} True if user is in teams room
 */
const isUserInTeamsRoom = userId => {
  return teamRoomMembers.get(userId) === true
}

/**
 * Check if user is in 1v1 matchmaking room
 * @param {string} userId - User ID
 * @returns {boolean} True if user is in 1v1 matchmaking room
 */
const isUserInMatchmakingRoom = userId => {
  return matchmakingRoomMembers.get(userId) === true
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
  handle1v1MatchmakingEvents,
  getConnectionStats,
  isUserInTeamsRoom,
  isUserInMatchmakingRoom,
}
