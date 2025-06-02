// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')

/**
 * Enhanced socket connection tracking using device fingerprinting
 * - userDeviceMap: Maps user IDs to a Map of their device fingerprints and socket sets
 * - socketUserDeviceMap: Maps socket IDs to their user ID and device fingerprint
 * - teamRoomMembers: Maps user device combinations to team room membership
 */
const userDeviceMap = new Map() // userId -> Map(deviceFingerprint -> Set of socketIds)
const socketUserDeviceMap = new Map() // socketId -> { userId, deviceFingerprint, connectedAt }
const teamRoomMembers = new Map() // userId_deviceFingerprint -> boolean (in teams room)

/**
 * Setup socket event handlers for Quick Clash feature with device fingerprinting
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

  // Listen for device fingerprint from client
  socket.on('quickClash:registerDevice', ({ deviceFingerprint }) => {
    if (!deviceFingerprint) {
      console.error('No device fingerprint provided for socket registration')
      return
    }

    registerSocketWithDevice(io, socket, userId, deviceFingerprint)
  })

  // Handle socket disconnection
  socket.on('disconnect', () => {
    cleanupSocketConnection(socketId)
    console.log(`Socket ${socketId} disconnected from QuickClash`)
  })

  // Listen for explicit join requests
  socket.on('quickClash:join', ({ deviceFingerprint }) => {
    if (deviceFingerprint) {
      registerSocketWithDevice(io, socket, userId, deviceFingerprint)
    }
    console.log(`User ${userId} explicitly joined QuickClash socket channel`)
  })

  // Listen for explicit request to join the teams room
  socket.on('quickClash:joinTeamsRoom', ({ deviceFingerprint }) => {
    if (!deviceFingerprint) {
      console.warn('No device fingerprint provided for teams room join')
      return
    }

    const userDeviceKey = `${userId}_${deviceFingerprint}`

    if (!teamRoomMembers.get(userDeviceKey)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userDeviceKey, true)
      console.log(
        `User ${userId} (device: ${deviceFingerprint.substring(
          0,
          8,
        )}...) joined QuickClash teams room`,
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
      console.log(
        `User ${userId} (device: ${deviceFingerprint.substring(
          0,
          8,
        )}...) already in QuickClash teams room`,
      )
    }
  })

  socket.on('join', room => {
    socket.join(room)
    console.log(`User ${userId} joined room: ${room}`)
  })

  // Set up matchmaking event handlers
  handleMatchmakingEvents(io, socket)

  // Add listeners for team matchmaking
  socket.on('quickClash:joinGlobalMatchmaking', data => {
    console.log(
      `Socket event: User ${userId} requested to join global matchmaking`,
    )
  })

  socket.on('quickClash:leaveGlobalMatchmaking', () => {
    console.log(
      `Socket event: User ${userId} requested to leave global matchmaking`,
    )
  })

  socket.on('quickClash:joinTeamMatchmaking', data => {
    const teamId = data?.teamId
    const deviceFingerprint = data?.deviceFingerprint

    console.log(
      `Socket event: User ${userId} requested to join team matchmaking with team ${teamId}`,
    )

    // Automatically join the teams room when joining team matchmaking
    if (deviceFingerprint) {
      const userDeviceKey = `${userId}_${deviceFingerprint}`

      if (!teamRoomMembers.get(userDeviceKey)) {
        socket.join('quickClash:teams')
        teamRoomMembers.set(userDeviceKey, true)
        console.log(
          `User ${userId} (device: ${deviceFingerprint.substring(
            0,
            8,
          )}...) joined QuickClash teams room (via team matchmaking)`,
        )
      }
    }
  })

  // Handle viewing team battles - also join the teams room
  socket.on('quickClash:viewTeamBattles', ({ deviceFingerprint }) => {
    if (!deviceFingerprint) {
      console.warn('No device fingerprint provided for team battles view')
      return
    }

    const userDeviceKey = `${userId}_${deviceFingerprint}`

    if (!teamRoomMembers.get(userDeviceKey)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userDeviceKey, true)
      console.log(
        `User ${userId} (device: ${deviceFingerprint.substring(
          0,
          8,
        )}...) joined QuickClash teams room (via team battles view)`,
      )
    }
  })
}

/**
 * Register a socket with its device fingerprint
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {string} userId - User ID
 * @param {string} deviceFingerprint - Device fingerprint
 */
const registerSocketWithDevice = (io, socket, userId, deviceFingerprint) => {
  const socketId = socket.id
  const quickClashRoom = `quickClash:${userId}`

  // Initialize user's device map if not exists
  if (!userDeviceMap.has(userId)) {
    userDeviceMap.set(userId, new Map())
  }

  const userDevices = userDeviceMap.get(userId)

  // Check if this device already has an active socket
  if (userDevices.has(deviceFingerprint)) {
    const existingSockets = userDevices.get(deviceFingerprint)

    if (existingSockets.size > 0) {
      // Close existing sockets for this device to maintain one per device
      const socketsToClose = Array.from(existingSockets)
      console.log(
        `Closing ${
          socketsToClose.length
        } existing socket(s) for user ${userId} device ${deviceFingerprint.substring(
          0,
          8,
        )}...`,
      )

      socketsToClose.forEach(existingSocketId => {
        const existingSocket = io.sockets.sockets.get(existingSocketId)
        if (existingSocket) {
          existingSocket.emit('quickClash:deviceConflict', {
            message: 'Another connection from this device has been established',
            newSocketId: socketId,
          })
          existingSocket.disconnect(true)
        }

        // Clean up tracking
        existingSockets.delete(existingSocketId)
        socketUserDeviceMap.delete(existingSocketId)
      })

      // Clear the existing set but keep the device entry
      existingSockets.clear()
    }
  }

  // Ensure socket set exists for this device (create if not exists or recreate if cleared)
  if (
    !userDevices.has(deviceFingerprint) ||
    !userDevices.get(deviceFingerprint)
  ) {
    userDevices.set(deviceFingerprint, new Set())
  }

  // Add new socket to device set
  const deviceSockets = userDevices.get(deviceFingerprint)
  if (deviceSockets) {
    deviceSockets.add(socketId)
  } else {
    // Defensive programming - create new Set if somehow it's null/undefined
    const newSet = new Set([socketId])
    userDevices.set(deviceFingerprint, newSet)
    console.warn(
      `Had to recreate socket set for device ${deviceFingerprint.substring(
        0,
        8,
      )}...`,
    )
  }

  // Track socket metadata
  socketUserDeviceMap.set(socketId, {
    userId,
    deviceFingerprint,
    connectedAt: new Date(),
  })

  // Join the user's Quick Clash room
  socket.join(quickClashRoom)

  console.log(
    `User ${userId} registered socket ${socketId} with device ${deviceFingerprint.substring(
      0,
      8,
    )}... (unique connection established)`,
  )

  // Emit confirmation to client
  socket.emit('quickClash:deviceRegistered', {
    deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
    socketId,
    isUnique: true,
  })
}

/**
 * Clean up socket connection when a socket disconnects
 * @param {string} socketId - The ID of the disconnected socket
 */
const cleanupSocketConnection = socketId => {
  const socketInfo = socketUserDeviceMap.get(socketId)

  if (!socketInfo) {
    console.warn(`No tracking info found for disconnected socket ${socketId}`)
    return
  }

  const { userId, deviceFingerprint } = socketInfo

  // Remove socket from user's device map
  if (userDeviceMap.has(userId)) {
    const userDevices = userDeviceMap.get(userId)

    if (userDevices.has(deviceFingerprint)) {
      const deviceSockets = userDevices.get(deviceFingerprint)

      if (deviceSockets) {
        deviceSockets.delete(socketId)

        // Only clean up device entry if no more sockets AND wait to avoid race conditions
        if (deviceSockets.size === 0) {
          // Use a small delay to avoid race condition with new connections
          setTimeout(() => {
            // Double-check that the Set is still empty and exists
            const currentDeviceSockets = userDevices.get(deviceFingerprint)
            if (currentDeviceSockets && currentDeviceSockets.size === 0) {
              userDevices.delete(deviceFingerprint)

              // Clean up team room membership for this device
              const userDeviceKey = `${userId}_${deviceFingerprint}`
              teamRoomMembers.delete(userDeviceKey)

              console.log(
                `Device ${deviceFingerprint.substring(
                  0,
                  8,
                )}... for user ${userId} completely disconnected`,
              )

              // If user has no more devices connected, clean up user entry
              if (userDevices.size === 0) {
                userDeviceMap.delete(userId)
                console.log(
                  `User ${userId} completely disconnected from QuickClash (no active devices)`,
                )
              }
            }
          }, 200) // Increased delay to 200ms
        }
      }
    }
  }

  // Remove from socket tracking map immediately
  socketUserDeviceMap.delete(socketId)
}

/**
 * Get connection statistics for debugging
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  const stats = {
    totalUsers: userDeviceMap.size,
    totalDevices: 0,
    totalSockets: socketUserDeviceMap.size,
    userDeviceBreakdown: {},
    teamRoomMembers: teamRoomMembers.size,
  }

  // Calculate device and socket breakdown
  for (const [userId, userDevices] of userDeviceMap.entries()) {
    stats.totalDevices += userDevices.size

    const userStats = {
      devices: userDevices.size,
      sockets: 0,
      deviceDetails: {},
    }

    for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
      userStats.sockets += socketSet.size
      userStats.deviceDetails[deviceFingerprint.substring(0, 8) + '...'] = {
        sockets: socketSet.size,
        socketsIds: Array.from(socketSet),
      }
    }

    stats.userDeviceBreakdown[userId] = userStats
  }

  return stats
}

/**
 * Get user's active devices
 * @param {string} userId - User ID
 * @returns {Array} Array of device fingerprints
 */
const getUserActiveDevices = userId => {
  const userDevices = userDeviceMap.get(userId)
  if (!userDevices) return []

  return Array.from(userDevices.keys())
}

/**
 * Check if user has active connection from specific device
 * @param {string} userId - User ID
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {boolean} True if user has active connection from device
 */
const hasActiveDeviceConnection = (userId, deviceFingerprint) => {
  const userDevices = userDeviceMap.get(userId)
  if (!userDevices) return false

  const deviceSockets = userDevices.get(deviceFingerprint)
  return deviceSockets && deviceSockets.size > 0
}

/**
 * Get socket IDs for a specific user device combination
 * @param {string} userId - User ID
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Set} Set of socket IDs
 */
const getUserDeviceSockets = (userId, deviceFingerprint) => {
  const userDevices = userDeviceMap.get(userId)
  if (!userDevices) return new Set()

  return userDevices.get(deviceFingerprint) || new Set()
}

/**
 * Setup global emitter event handlers for Quick Clash (unchanged from original)
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

  // Listen for challenge progress updates and relay to clients
  globalEmitter.on(
    'quickClash:challengeProgress',
    ({ userId, step, progress }) => {
      if (!userId) {
        console.error('Invalid userId in quickClash:challengeProgress event')
        return
      }

      // Emit to the user's room with a small delay to avoid race conditions
      setTimeout(() => {
        const userRoom = `quickClash:${userId}`
        io.to(userRoom).emit('quickClash:challengeProgress', {
          step,
          progress,
        })
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
          for (let id of teamBattleParticipantIds) {
            const userRoom = `quickClash:${id.toString()}`
            io.to(userRoom).emit('quickClash:teamBattleRefetch', {
              battleId: challenge.teamBattle.toString(),
            })
          }
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
          // Emit to challenger's room with challenger-specific data
          const challengerRoom = `quickClash:${challenge.challenger._id.toString()}`
          io.to(challengerRoom).emit(
            'quickClash:challengeCompletedByBothPlayers',
            challengerData,
          )
        }, 100)

        setTimeout(() => {
          // Emit to opponent's room with opponent-specific data
          const opponentRoom = `quickClash:${challenge.opponent._id.toString()}`
          io.to(opponentRoom).emit(
            'quickClash:challengeCompletedByBothPlayers',
            opponentData,
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
          for (let id of teamBattleParticipantIds) {
            const userRoom = `quickClash:${id.toString()}`
            io.to(userRoom).emit('quickClash:teamBattleRefetch', {
              battleId: challenge.teamBattle.toString(),
            })
          }
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
          // Emit to recipient's room
          const recipientRoom = `quickClash:${recipientId}`
          io.to(recipientRoom).emit('quickClash:challengeCompleted', {
            challengeId: challenge._id,
            completedByUserId,
          })
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

  // New event for match preparation notification
  globalEmitter.on(
    'quickClash:matchFound',
    ({ challenger, opponent, tempChallengeId }) => {
      // Send match found notification to both users
      if (challenger && challenger._id) {
        io.to(`quickClash:${challenger._id}`).emit('quickClash:matchFound', {
          opponent: {
            name: opponent.name,
            inGameName: opponent.inGameName,
            pic: opponent.pic,
            _id: opponent._id,
            quickClashTrophies: opponent.quickClashTrophies,
          },
          tempChallengeId,
          isChallenger: true,
        })
      }

      if (opponent && opponent._id) {
        io.to(`quickClash:${opponent._id}`).emit('quickClash:matchFound', {
          opponent: {
            name: challenger.name,
            inGameName: challenger.inGameName,
            pic: challenger.pic,
            _id: challenger._id,
            quickClashTrophies: challenger.quickClashTrophies,
          },
          tempChallengeId,
          isChallenger: false,
        })
      }
    },
  )

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

  // ==========================================
  // TEAM MATCHMAKING SOCKET EVENT HANDLERS
  // ==========================================

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
        `SOCKET: User ${userId} (${userName}) joined global matchmaking with ${trophies} trophies`,
      )

      // Emit to the user's room to confirm joining
      const userRoom = `quickClash:${userId}`
      io.to(userRoom).emit('quickClash:joinedGlobalMatchmaking', {
        userId,
        trophies,
      })
    },
  )

  // Listen for user left global matchmaking
  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:userLeftMatchmaking event')
      return
    }

    console.log(`SOCKET: User ${userId} left global matchmaking`)

    // Emit to the user's room to confirm leaving
    const userRoom = `quickClash:${userId}`
    io.to(userRoom).emit('quickClash:leftGlobalMatchmaking', {
      userId,
    })
  })

  // Listen for team joined matchmaking
  globalEmitter.on('quickClash:teamJoinedMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamJoinedMatchmaking event')
      return
    }

    console.log(
      `SOCKET: Team ${data?.teamId} (${data?.teamName}) joined matchmaking with ${data?.avgTrophies} avg trophies`,
    )

    notifyTeamMembers(data?.teamId, 'quickClash:teamJoinedMatchmaking', data)
  })

  globalEmitter.on('quickClash:teamLeftMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamLeftMatchmaking event')
      return
    }

    console.log(
      `SOCKET: Team ${data.teamId} left matchmaking` +
        (data.reason ? ` (Reason: ${data.reason})` : '') +
        (data.initiator ? ` (Initiated by: ${data.initiator})` : ''),
    )

    // If there's a specific userId target, send directly to that user ONLY
    if (data.userId) {
      const userSocket = getUserSocket(data.userId)
      if (userSocket) {
        userSocket.emit('quickClash:teamLeftMatchmaking', data)
      }
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
      `SOCKET: Team ${data.teamId} returned to matchmaking` +
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
        `SOCKET: Team battle ${battleId} ready between teams ${
          teamA || 'auto-formed'
        } and ${teamB || 'auto-formed'}`,
      )

      // If there's a specific userId, send to just that user (this happens for solo players)
      if (userId) {
        console.log(
          `SOCKET: Sending battle ready notification to solo player ${userId}`,
        )
        io.to(`quickClash:${userId}`).emit('quickClash:teamBattleReady', {
          battleId,
          teamId: teamId || teamA,
          teamA,
          teamB,
          isSoloPlayer: true,
        })
        return
      }

      // For regular teams, use notifyTeamMembers to send to all team members
      if (teamA) {
        console.log(`SOCKET: Notifying Team A members about battle ready`)
        notifyTeamMembers(teamA, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamA,
          teamA,
          teamB,
        })
      }

      if (teamB) {
        console.log(`SOCKET: Notifying Team B members about battle ready`)
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
        `SOCKET: Team battle ${battleId} completed. Winner: ${winner}`,
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
        `SOCKET: User ${userId} accepted team invitation for team ${teamId} from ${inviterName}`,
      )

      // FIXED: Only notify the specific team members, not all teams
      notifyTeamMembers(teamId, 'quickClash:teamInvitationAccepted', {
        teamId,
        userId,
        inviterName,
        userName,
        userInGameName,
      })

      // Also notify the user who accepted the invitation directly
      io.to(`quickClash:${userId}`).emit('quickClash:teamInvitationAccepted', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
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
        `SOCKET: User ${userId} rejected team invitation for team ${teamId} from ${inviterName}`,
      )

      // FIXED: Only notify the specific team members, not all teams
      notifyTeamMembers(teamId, 'quickClash:teamInvitationRejected', {
        teamId,
        userId,
        inviterName,
        userName,
        userInGameName,
      })

      // Also notify the user who rejected the invitation directly
      io.to(`quickClash:${userId}`).emit('quickClash:teamInvitationRejected', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
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
        `SOCKET: User ${inviteeId} received team invitation from ${inviterName} for team ${teamName}`,
      )

      // DEBUG: Check if user has active sockets
      const userRoom = `quickClash:${inviteeId}`
      const socketsInRoom = io.sockets.adapter.rooms.get(userRoom)
      console.log(
        `DEBUG: Room ${userRoom} has ${
          socketsInRoom ? socketsInRoom.size : 0
        } sockets`,
      )

      if (socketsInRoom && socketsInRoom.size > 0) {
        console.log(
          `DEBUG: Emitting teamInvitationReceived to ${socketsInRoom.size} socket(s)`,
        )
      } else {
        console.log(
          `DEBUG: No sockets in room ${userRoom} - user might not be connected`,
        )
      }

      // FIXED: Only notify the specific invitee, not all teams
      io.to(userRoom).emit('quickClash:teamInvitationReceived', {
        invitationId,
        teamName,
        inviterName,
      })

      console.log(
        `DEBUG: teamInvitationReceived event emitted to room ${userRoom}`,
      )
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

      console.log(`SOCKET: User ${user} joined team ${team}`)

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

      console.log(`SOCKET: User ${user} left team ${team}`)

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
        `SOCKET: User ${removedMember} was removed from team ${team} by ${leader}`,
      )

      // FIXED: Only notify the specific team members, not all teams
      notifyTeamMembers(team, 'quickClash:teamMemberRemoved', {
        teamId: team,
        leaderId: leader,
        removedMemberId: removedMember,
        teamName,
        removedMemberName,
        removedMemberInGameName,
        isCurrentUser: false, // This will be set to true for the removed member
        isLeader: leader === removedMember,
      })

      // Also notify the removed member directly
      io.to(`quickClash:${removedMember}`).emit(
        'quickClash:teamMemberRemoved',
        {
          teamId: team,
          leaderId: leader,
          removedMemberId: removedMember,
          isCurrentUser: true,
          teamName,
        },
      )
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
        `SOCKET: User ${userId} selected category ${category} for team ${team} in battle ${battleId}`,
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
        `SOCKET: User ${userId} deselected category ${category} for team ${team} in battle ${battleId}`,
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

  globalEmitter.on('quickClash:matchmakingLocked', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:matchmakingLocked event')
      return
    }

    console.log(
      `SOCKET: Teams ${data.teamA} and ${data.teamB} locked in matchmaking`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const teamName = data.teamAMembers.includes(userId)
          ? data.teamAName
          : data.teamBName

        // Get the user's socket(s) - use device-aware notification
        notifyUserAllDevices(userId, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: userTeamId,
          teamName: teamName,
        })
      })
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
      `SOCKET: Teams ${data.teamA} and ${data.teamB} unlocked from matchmaking`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        // Use device-aware notification
        notifyUserAllDevices(userId, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: userTeamId,
        })
      })
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
      `SOCKET: Battle creation started for teams ${data.teamA} and ${data.teamB}`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const opponentTeamId = data.teamAMembers.includes(userId)
          ? data.teamB
          : data.teamA

        // Use device-aware notification
        notifyUserAllDevices(userId, 'quickClash:battleCreationStarted', {
          teamId: userTeamId,
          opponentTeam: opponentTeamId,
        })
      })
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
      `SOCKET: Battle creation failed for teams ${data.teamA} and ${data.teamB}`,
    )

    // If we have member IDs, use direct notification
    if (data.allMembers && data.allMembers.length > 0) {
      // Notify all members directly
      data.allMembers.forEach(userId => {
        // Get the team id this user belongs to
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        // Use device-aware notification
        notifyUserAllDevices(userId, 'quickClash:battleCreationFailed', {
          teamId: userTeamId,
          error: data.error,
        })
      })
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
      `SOCKET: Battle creation cleaned up for teams ${data.teamA} and ${data.teamB}`,
    )

    // Send notification to all affected members using device-aware notification
    if (data.memberIds && data.memberIds.length > 0) {
      data.memberIds.forEach(memberId => {
        notifyUserAllDevices(memberId, 'quickClash:battleCreationCleanedUp', {
          message: data.message,
          teamA: data.teamA,
          teamB: data.teamB,
        })
      })
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

  /**
   * Enhanced helper function to notify all members of a specific team using device-aware notifications
   * @param {string} teamId - Team ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @param {Array<string>} [excludeUserIds] - Optional array of user IDs to exclude from notification
   */
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
      const excludeSet = new Set(excludeUserIds.map(id => id.toString()))

      // Send event to each team member (excluding any specified exclusions)
      team.members.forEach(member => {
        const userId = member.user.toString()

        // Skip if user is in exclude list
        if (excludeSet.has(userId)) {
          return
        }

        // Use device-aware notification
        const notified = notifyUserAllDevices(userId, event, {
          ...data,
          teamName: team.name, // Include team name for context
        })

        if (notified) {
          notifiedCount++
        }
      })

      console.log(
        `notifyTeamMembers: Sent ${event} to ${notifiedCount}/${team.members.length} members of team ${teamId} (${team.name})`,
      )
    } catch (error) {
      console.error(`Error notifying team members for team ${teamId}:`, error)
    }
  }

  /**
   * Enhanced helper function to notify a user across all their active devices
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @returns {boolean} True if notification was sent to at least one device
   */
  function notifyUserAllDevices(userId, event, data) {
    const userDevices = userDeviceMap.get(userId)

    if (!userDevices || userDevices.size === 0) {
      console.warn(
        `notifyUserAllDevices: No active devices found for user ${userId}`,
      )
      // Fallback: Try to use the user's room (less reliable but better than nothing)
      io.to(`quickClash:${userId}`).emit(event, data)
      return true
    }

    let notifiedDevices = 0

    // Send to all active devices
    userDevices.forEach((socketSet, deviceFingerprint) => {
      if (socketSet.size > 0) {
        // Send to all sockets for this device (should be just one per device now)
        socketSet.forEach(socketId => {
          const socket = io.sockets.sockets.get(socketId)
          if (socket) {
            socket.emit(event, {
              ...data,
              deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
            })
          }
        })
        notifiedDevices++
      }
    })

    if (notifiedDevices > 0) {
      console.log(
        `notifyUserAllDevices: Sent ${event} to ${notifiedDevices} device(s) for user ${userId}`,
      )
      return true
    }

    return false
  }

  /**
   * Helper function to get a user's primary socket (first available socket)
   * @param {string} userId - User ID
   * @returns {Object|null} Socket object or null if not found
   */
  function getUserSocket(userId) {
    const userDevices = userDeviceMap.get(userId)

    if (!userDevices || userDevices.size === 0) {
      return null
    }

    // Get first available socket from any device
    for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
      if (socketSet.size > 0) {
        const firstSocketId = socketSet.values().next().value
        if (firstSocketId) {
          return io.sockets.sockets.get(firstSocketId)
        }
      }
    }

    return null
  }

  /**
   * Helper function to notify specific users directly using device-aware notifications
   * @param {Array<string>} userIds - Array of user IDs to notify
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  function notifySpecificUsers(userIds, event, data) {
    if (!Array.isArray(userIds)) {
      console.error('notifySpecificUsers: userIds must be an array')
      return
    }

    let notifiedCount = 0

    userIds.forEach(userId => {
      const notified = notifyUserAllDevices(userId, event, data)
      if (notified) {
        notifiedCount++
      }
    })

    console.log(
      `notifySpecificUsers: Sent ${event} to ${notifiedCount}/${userIds.length} users`,
    )
  }
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
  getConnectionStats,
  getUserActiveDevices,
  hasActiveDeviceConnection,
  getUserDeviceSockets,
}
