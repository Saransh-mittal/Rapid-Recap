// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')

/**
 * Improved socket connection tracking using Maps
 * - userSocketMap: Maps user IDs to a Set of their socket IDs
 * - socketUserMap: Maps socket IDs to their user ID for reverse lookup
 * - teamRoomMembers: Maps user IDs to a boolean indicating if they're in the teams room
 */
const userSocketMap = new Map() // userId -> Set of socketIds
const socketUserMap = new Map() // socketId -> userId
const teamRoomMembers = new Map() // userId -> boolean (in teams room)

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
  const socketId = socket.id
  const quickClashRoom = `quickClash:${userId}`

  // Initialize user's socket set if not exists
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set())
  }

  // Add this socket to user's set if not already there
  if (!userSocketMap.get(userId).has(socketId)) {
    userSocketMap.get(userId).add(socketId)
    socketUserMap.set(socketId, userId)

    // Join the user's Quick Clash room
    socket.join(quickClashRoom)

    // Log connection (only for new connections)
    if (userSocketMap.get(userId).size === 1) {
      console.log(
        `User ${userId} joined QuickClash socket room (first connection)`,
      )
    } else {
      console.log(
        `User ${userId} added new connection to QuickClash room (total: ${
          userSocketMap.get(userId).size
        })`,
      )
    }
  }

  // Handle socket disconnection
  socket.on('disconnect', () => {
    cleanupSocketConnection(socketId, userId)
    console.log(
      `User ${userId} socket ${socketId} disconnected from QuickClash`,
    )
  })

  // Listen for explicit join requests
  socket.on('quickClash:join', () => {
    console.log(`User ${userId} explicitly joined QuickClash socket channel`)
  })

  // Listen for explicit request to join the teams room
  socket.on('quickClash:joinTeamsRoom', () => {
    if (!teamRoomMembers.get(userId)) {
      // Only join if not already in room
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(`User ${userId} joined QuickClash teams room`)
    } else {
      console.log(`User ${userId} already in QuickClash teams room`)
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
    // The actual joining is handled via API, this is just for tracking
  })

  socket.on('quickClash:leaveGlobalMatchmaking', () => {
    console.log(
      `Socket event: User ${userId} requested to leave global matchmaking`,
    )
    // The actual leaving is handled via API, this is just for tracking
  })

  socket.on('quickClash:joinTeamMatchmaking', data => {
    const teamId = data?.teamId
    console.log(
      `Socket event: User ${userId} requested to join team matchmaking with team ${teamId}`,
    )

    // Automatically join the teams room when joining team matchmaking
    if (!teamRoomMembers.get(userId)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(
        `User ${userId} joined QuickClash teams room (via team matchmaking)`,
      )
    }
  })

  // Handle viewing team battles - also join the teams room
  socket.on('quickClash:viewTeamBattles', () => {
    if (!teamRoomMembers.get(userId)) {
      socket.join('quickClash:teams')
      teamRoomMembers.set(userId, true)
      console.log(
        `User ${userId} joined QuickClash teams room (via team battles view)`,
      )
    }
  })
}

/**
 * Clean up socket connection when a socket disconnects
 * @param {string} socketId - The ID of the disconnected socket
 * @param {string} userId - The ID of the user associated with the socket
 */
const cleanupSocketConnection = (socketId, userId) => {
  // Remove this socket ID from the user's set
  if (userSocketMap.has(userId)) {
    userSocketMap.get(userId).delete(socketId)

    // If this was the user's last socket, clean up user entry
    if (userSocketMap.get(userId).size === 0) {
      userSocketMap.delete(userId)
      teamRoomMembers.delete(userId)
      console.log(
        `User ${userId} completely disconnected from QuickClash (no active sockets)`,
      )
    }
  }

  // Remove from socket->user map
  socketUserMap.delete(socketId)
}

/**
 * Utility to get all connected users for debugging
 * @returns {Array} Array of objects containing userId and their socket count
 */
const getConnectedUserStats = () => {
  const stats = []
  for (const [userId, socketSet] of userSocketMap.entries()) {
    stats.push({
      userId,
      socketCount: socketSet.size,
      inTeamsRoom: teamRoomMembers.has(userId),
    })
  }
  return stats
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

    // Emit to all clients in the teams room
    // io.to('quickClash:teams').emit('quickClash:teamJoinedMatchmaking', {
    //   teamId,
    //   avgTrophies,
    //   teamName,
    // })
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

    // Do NOT broadcast to all teams - this would be a serious mistake!
    // Instead, we need to find all sockets for members of this specific team
    // and notify only them
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

  // Listen for team battle created
  globalEmitter.on(
    'quickClash:teamBattleCreated',
    ({ teamBattle, teamA, teamB, categories }) => {
      console.log(
        `SOCKET: Team battle created between teams ${teamA} and ${teamB}`,
      )

      // Emit to all clients in the teams room
      io.to('quickClash:teams').emit('quickClash:teamBattleCreated', {
        teamBattle,
        teamA,
        teamB,
        categories,
      })
    },
  )

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

      // Emit to all clients in the teams room
      io.to('quickClash:teams').emit('quickClash:teamBattleCompleted', {
        battleId,
        winner,
        teamA,
        teamB,
      })
    },
  )

  // Listen for team member selected category
  globalEmitter.on(
    'quickClash:teamMemberSelectedCategory',
    ({ battleId, userId, category, team }) => {
      if (!battleId || !userId || !category) {
        console.error(
          'Invalid data in quickClash:teamMemberSelectedCategory event',
        )
        return
      }

      console.log(
        `SOCKET: User ${userId} selected category ${category} for team ${team} in battle ${battleId}`,
      )

      // Emit to all clients in the teams room
      io.to('quickClash:teams').emit('quickClash:teamMemberSelectedCategory', {
        battleId,
        userId,
        category,
        team,
      })
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

        // Get the user's socket(s)
        if (userSocketMap.has(userId)) {
          const userSocketIds = userSocketMap.get(userId)
          userSocketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId)
            if (socket) {
              socket.emit('quickClash:matchmakingLocked', {
                status: data.status,
                teamId: userTeamId,
                teamName: teamName,
              })
            }
          })
        } else {
          // Fallback: Try to use the room
          io.to(`quickClash:${userId}`).emit('quickClash:matchmakingLocked', {
            status: data.status,
            teamId: userTeamId,
            teamName: teamName,
          })
        }
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

        // Get the user's socket(s)
        if (userSocketMap.has(userId)) {
          const userSocketIds = userSocketMap.get(userId)
          userSocketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId)
            if (socket) {
              socket.emit('quickClash:matchmakingUnlocked', {
                status: data.status,
                teamId: userTeamId,
              })
            }
          })
        } else {
          // Fallback: Try to use the room
          io.to(`quickClash:${userId}`).emit('quickClash:matchmakingUnlocked', {
            status: data.status,
            teamId: userTeamId,
          })
        }
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

        // Get the user's socket(s)
        if (userSocketMap.has(userId)) {
          const userSocketIds = userSocketMap.get(userId)
          userSocketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId)
            if (socket) {
              socket.emit('quickClash:battleCreationStarted', {
                teamId: userTeamId,
                opponentTeam: opponentTeamId,
              })
            }
          })
        } else {
          // Fallback: Try to use the room
          io.to(`quickClash:${userId}`).emit(
            'quickClash:battleCreationStarted',
            {
              teamId: userTeamId,
              opponentTeam: opponentTeamId,
            },
          )
        }
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

        // Get the user's socket(s)
        if (userSocketMap.has(userId)) {
          const userSocketIds = userSocketMap.get(userId)
          userSocketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId)
            if (socket) {
              socket.emit('quickClash:battleCreationFailed', {
                teamId: userTeamId,
                error: data.error,
              })
            }
          })
        } else {
          // Fallback: Try to use the room
          io.to(`quickClash:${userId}`).emit(
            'quickClash:battleCreationFailed',
            {
              teamId: userTeamId,
              error: data.error,
            },
          )
        }
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

    // Send notification to all affected members
    if (data.memberIds && data.memberIds.length > 0) {
      data.memberIds.forEach(memberId => {
        io.to(memberId).emit('quickClash:battleCreationCleanedUp', {
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
   * Helper function to notify all members of a specific team
   * @param {string} teamId - Team ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  async function notifyTeamMembers(teamId, event, data) {
    try {
      // Fetch team members from the database
      const team = await QuickClashTeam.findById(teamId)
        .select('members')
        .lean()

      if (!team || !team.members || !Array.isArray(team.members)) {
        console.error(
          `Cannot notify team members: Team ${teamId} not found or has no members`,
        )
        return
      }

      // Send event to each team member
      team.members.forEach(member => {
        const userId = member.user.toString()
        const userSocket = getUserSocket(userId)
        if (userSocket) {
          userSocket.emit(event, data)
        }
      })
    } catch (error) {
      console.error(`Error notifying team members for team ${teamId}:`, error)
    }
  }

  // Helper function to get a user's socket (implement this if not already available)
  function getUserSocket(userId) {
    // This implementation depends on how you're tracking user sockets
    // Example implementation:
    const userSocketId = userSocketMap.get(userId)?.values().next().value
    if (userSocketId) {
      return io.sockets.sockets.get(userSocketId)
    }
    return null
  }
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
  getConnectedUserStats,
}
