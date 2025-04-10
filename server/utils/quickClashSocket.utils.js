// utils/quickClashSocket.utils.js
const globalEmitter = require('../eventEmitter')
const {
  handleMatchmakingEvents,
} = require('../controllers/quickClashMatchmakingController')

const joinedUsers = new Set()
const joinedTeamsRoom = new Set()

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
      `User ${userId} joined QuickClash socket room ${quickClashRoom}`,
    )

    // Remove from tracking when socket disconnects
    socket.on('disconnect', () => {
      joinedUsers.delete(joinKey)
      joinedTeamsRoom.delete(joinKey)
      console.log(`User ${userId} left QuickClash socket room (disconnected)`)
    })
  }

  // Listen for explicit join requests (redundant but kept for backward compatibility)
  socket.on('quickClash:join', () => {
    // No need to join again if already joined
    if (!socket.explicitlyJoinedQuickClash) {
      socket.explicitlyJoinedQuickClash = true
      console.log(`User ${userId} explicitly joined QuickClash socket channel`)
    }
  })

  // NEW: Listen for explicit request to join the teams room
  socket.on('quickClash:joinTeamsRoom', () => {
    if (!joinedTeamsRoom.has(joinKey)) {
      socket.join('quickClash:teams')
      joinedTeamsRoom.add(joinKey)
      console.log(`User ${userId} joined QuickClash teams room`)
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
    if (!joinedTeamsRoom.has(joinKey)) {
      socket.join('quickClash:teams')
      joinedTeamsRoom.add(joinKey)
      console.log(
        `User ${userId} joined QuickClash teams room (via team matchmaking)`,
      )
    }

    // The actual joining is handled via API, this is just for tracking
  })

  // Handle viewing team battles - also join the teams room
  socket.on('quickClash:viewTeamBattles', () => {
    if (!joinedTeamsRoom.has(joinKey)) {
      socket.join('quickClash:teams')
      joinedTeamsRoom.add(joinKey)
      console.log(
        `User ${userId} joined QuickClash teams room (via team battles view)`,
      )
    }
  })
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
      if (teamBattleParticipantIds.length > 0) {
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
      if (teamBattleParticipantIds.length > 0) {
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
  // NEW TEAM MATCHMAKING SOCKET EVENT HANDLERS
  // ==========================================

  // Listen for user matchmaking progress updates
  globalEmitter.on(
    'quickClash:userMatchmakingProgress',
    ({ userId, step, progress }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userMatchmakingProgress event',
        )
        return
      }

      console.log(
        `SOCKET: Sending progress update to user ${userId}: ${step} (${progress}%)`,
      )

      // Emit to the user's room with a small delay to avoid race conditions
      setTimeout(() => {
        const userRoom = `quickClash:${userId}`
        io.to(userRoom).emit('quickClash:userMatchmakingProgress', {
          step,
          progress,
        })
      }, 50)
    },
  )

  // Listen for team matchmaking progress updates
  globalEmitter.on(
    'quickClash:teamMatchmakingProgress',
    ({ teamId, step, progress }) => {
      if (!teamId) {
        console.error(
          'Invalid teamId in quickClash:teamMatchmakingProgress event',
        )
        return
      }

      console.log(
        `SOCKET: Sending team progress update for team ${teamId}: ${step} (${progress}%)`,
      )

      // We need to emit to all team members' rooms
      // This is handled by the client listening to the teamMatchmakingProgress event
      io.to('quickClash:teams').emit('quickClash:teamMatchmakingProgress', {
        teamId,
        step,
        progress,
      })
    },
  )

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
  globalEmitter.on(
    'quickClash:teamJoinedMatchmaking',
    ({ teamId, avgTrophies, teamName }) => {
      if (!teamId) {
        console.error(
          'Invalid teamId in quickClash:teamJoinedMatchmaking event',
        )
        return
      }

      console.log(
        `SOCKET: Team ${teamId} (${teamName}) joined matchmaking with ${avgTrophies} avg trophies`,
      )

      // Emit to all clients in the teams room
      io.to('quickClash:teams').emit('quickClash:teamJoinedMatchmaking', {
        teamId,
        avgTrophies,
        teamName,
      })
    },
  )

  // Listen for team left matchmaking
  globalEmitter.on('quickClash:teamLeftMatchmaking', ({ teamId }) => {
    if (!teamId) {
      console.error('Invalid teamId in quickClash:teamLeftMatchmaking event')
      return
    }

    console.log(`SOCKET: Team ${teamId} left matchmaking`)

    // Emit to all clients in the teams room
    io.to('quickClash:teams').emit('quickClash:teamLeftMatchmaking', {
      teamId,
    })
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
          teamId: teamA, // For solo players, we set the teamId to teamA by default
          teamA, // Include these for consistent payload format
          teamB,
          isSoloPlayer: true, // Add flag to indicate this is a solo player
        })
        return
      }

      // Otherwise, send to all team members
      if (teamAMembers) {
        teamAMembers.forEach(member => {
          if (member.userId) {
            console.log(
              `SOCKET: Sending battle ready notification to team A member ${member.userId}`,
            )
            io.to(`quickClash:${member.userId}`).emit(
              'quickClash:teamBattleReady',
              {
                battleId,
                teamId: teamA,
                teamA,
                teamB,
              },
            )
          }
        })
      }

      if (teamBMembers) {
        teamBMembers.forEach(member => {
          if (member.userId) {
            console.log(
              `SOCKET: Sending battle ready notification to team B member ${member.userId}`,
            )
            io.to(`quickClash:${member.userId}`).emit(
              'quickClash:teamBattleReady',
              {
                battleId,
                teamId: teamB,
                teamA,
                teamB,
              },
            )
          }
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

  // Listen for bot added to team
  globalEmitter.on('quickClash:botAddedToTeam', ({ team, bot }) => {
    console.log(`SOCKET: Bot ${bot} added to team ${team}`)

    // Emit to all clients in the teams room
    io.to('quickClash:teams').emit('quickClash:teamUpdated', {
      teamId: team,
      action: 'botAdded',
      botId: bot,
    })
  })

  // Listen for team filled with bots
  globalEmitter.on('quickClash:teamFilledWithBots', ({ team, botsAdded }) => {
    console.log(`SOCKET: Team ${team} filled with ${botsAdded} bots`)

    // Emit to all clients in the teams room
    io.to('quickClash:teams').emit('quickClash:teamUpdated', {
      teamId: team,
      action: 'filledWithBots',
      botsAdded,
    })
  })
}

module.exports = {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
}
