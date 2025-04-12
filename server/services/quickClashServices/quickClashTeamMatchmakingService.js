// services/quickClashServices/quickClashTeamMatchmakingService.js
const mongoose = require('mongoose')
const QuickClashTeamMatchmaking = require('../../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashGlobalMatchmaking = require('../../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')
const { getCategories } = require('../../data/categories')
const { createTeamBattle } = require('./quickClashTeamBattleService')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const { updateTeamMatchStatus } = require('./quickClashTeamService')

// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const TROPHY_RANGE_INITIAL = 200 // Initial trophy range for matching
const TROPHY_RANGE_INCREMENT = 100 // How much to increase range each check
const MAX_TROPHY_RANGE = 500 // Maximum trophy range difference
const GLOBAL_MATCHMAKING_CHECK_INTERVAL = 10000 // Check global matchmaking every 10 seconds

// Tracking formed auto teams to alternate between Team A and Team B
let teamNameCounter = 0

/**
 * Helper to emit progress updates to teams
 * @param {string} teamId - Team ID
 * @param {string} step - Progress step
 * @param {number} progress - Progress percentage
 */
const emitTeamMatchmakingProgress = (teamId, step, progress) => {
  // Emit progress event for Team
  globalEmitter.emit('quickClash:teamMatchmakingProgress', {
    teamId,
    step,
    progress,
  })
}

/**
 * Helper to emit progress updates to individual users
 * @param {string} userId - User ID
 * @param {string} step - Progress step
 * @param {number} progress - Progress percentage
 */
const emitUserMatchmakingProgress = (userId, step, progress) => {
  globalEmitter.emit('quickClash:userMatchmakingProgress', {
    userId,
    step,
    progress,
  })
}

/**
 * Join team matchmaking queue with existing team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<Object>} Matchmaking entry
 */
const joinTeamMatchmaking = async ({ teamId, session: providedSession }) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    // Start new transaction only if we created our own session
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log(`Team ${teamId} joining matchmaking queue`)

    // Check if team exists
    const team = await QuickClashTeam.findById(teamId)
      .populate('members.user', 'quickClashTrophies')
      .session(session)

    if (!team) {
      throw new Error('Team not found')
    }

    if (team.members.length < 4) {
      setTimeout(() => {
        processGlobalMatchmaking().catch(err => {
          console.error('Error during team completion process:', err)
        })
      }, 100)
      return
    }

    // Check if all members are ready
    const allReady = team.members.every(member => member.status === 'ready')
    if (!allReady) {
      throw new Error('All team members must be ready to join matchmaking')
    }

    // Calculate team's average trophies
    let totalTrophies = 0
    team.members.forEach(member => {
      totalTrophies += member.user.quickClashTrophies || 1000
    })
    const avgTrophies = Math.round(totalTrophies / team.members.length)

    // Check if team is already in matchmaking
    let matchmakingEntry = await QuickClashTeamMatchmaking.findOne({
      team: teamId,
    }).session(session)

    if (matchmakingEntry) {
      // Update existing entry
      matchmakingEntry.status = 'available'
      matchmakingEntry.lastActive = new Date()
      matchmakingEntry.expiresAt = new Date(Date.now() + MATCHMAKING_EXPIRY)
      matchmakingEntry.avgTrophies = avgTrophies
      matchmakingEntry.memberCount = team.members.length

      await matchmakingEntry.save({ session })
    } else {
      // Create new entry
      matchmakingEntry = new QuickClashTeamMatchmaking({
        team: teamId,
        avgTrophies: avgTrophies,
        memberCount: team.members.length,
        expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
      })

      await matchmakingEntry.save({ session })
    }

    // Emit event for real-time updates
    globalEmitter.emit('quickClash:teamJoinedMatchmaking', {
      teamId,
      avgTrophies,
      teamName: team.name,
    })

    // Try to find a match right away (async)
    setTimeout(() => {
      checkForTeamMatch({ teamId }).catch(err => {
        console.error('Error checking for team match:', err)
      })
    }, 100)

    // Only commit if we started our own transaction
    if (startedTransaction) {
      await session.commitTransaction()
    }
    return matchmakingEntry
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    throw error
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

/**
 * Join global matchmaking queue as a solo player
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Matchmaking entry
 */
const joinGlobalMatchmaking = async ({ userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      console.log(`User ${userId} joining global matchmaking queue`)

      // Check if user exists
      const user = await User.findById(userId).session(session)
      if (!user) {
        throw new Error('User not found')
      }

      // Check if user is already in matchmaking
      let matchmakingEntry = await QuickClashGlobalMatchmaking.findOne({
        user: userId,
      }).session(session)

      if (matchmakingEntry) {
        // Update existing entry
        matchmakingEntry.status = 'available'
        matchmakingEntry.lastActive = new Date()
        matchmakingEntry.expiresAt = new Date(Date.now() + MATCHMAKING_EXPIRY)
        matchmakingEntry.trophies = user.quickClashTrophies || 1000

        await matchmakingEntry.save({ session })
      } else {
        // Create new entry
        matchmakingEntry = new QuickClashGlobalMatchmaking({
          user: userId,
          trophies: user.quickClashTrophies || 1000,
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
        })

        await matchmakingEntry.save({ session })
      }

      // Emit event for real-time updates
      globalEmitter.emit('quickClash:userJoinedMatchmaking', {
        userId,
        trophies: user.quickClashTrophies || 1000,
        userName: user.name || user.inGameName,
      })

      // Progress update
      emitUserMatchmakingProgress(userId, 'searching', 10)

      // Try to find a match right away (async)
      setTimeout(() => {
        processGlobalMatchmaking().catch(err => {
          console.error('Error processing global matchmaking:', err)
        })
      }, 100)

      return matchmakingEntry
    })
  } finally {
    session.endSession()
  }
}

/**
 * Leave team matchmaking queue
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<boolean>} Success status
 */
const leaveTeamMatchmaking = async ({ teamId }) => {
  try {
    console.log(`Team ${teamId} leaving matchmaking queue`)

    const result = await QuickClashTeamMatchmaking.findOneAndDelete({
      team: teamId,
    })

    // Emit event if successfully left
    if (result) {
      globalEmitter.emit('quickClash:teamLeftMatchmaking', {
        teamId,
      })
    }

    return !!result
  } catch (error) {
    console.error('Error leaving team matchmaking:', error)
    throw error
  }
}

/**
 * Leave global matchmaking queue
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const leaveGlobalMatchmaking = async ({ userId }) => {
  const session = await mongoose.startSession()
  let result = false

  try {
    await session.withTransaction(async () => {
      console.log(`User ${userId} leaving global matchmaking queue`)

      // Find the player's matchmaking entry
      const playerEntry = await QuickClashGlobalMatchmaking.findOne({
        user: userId,
      }).session(session)

      if (!playerEntry) {
        return false // Not in matchmaking
      }

      // Check if player is part of an auto-formed team
      if (playerEntry.team && playerEntry.status === 'matched') {
        console.log(
          `Player ${userId} is part of team ${playerEntry.team}, checking if auto-formed`,
        )

        // Get the team
        const team = await QuickClashTeam.findById(playerEntry.team).session(
          session,
        )

        // Only dissolve non-persistent teams (auto-formed teams are non-persistent)
        if (team && !team.isPersistent) {
          console.log(`Team ${team._id} is auto-formed, dissolving it`)

          // Find all other players in this team's matchmaking
          const teamPlayers = await QuickClashGlobalMatchmaking.find({
            team: team._id,
            user: { $ne: userId }, // Exclude the leaving player
          }).session(session)

          // Reset all other players back to available status
          for (const player of teamPlayers) {
            console.log(`Resetting player ${player.user} status to available`)
            player.status = 'available'
            player.team = null
            await player.save({ session })

            // Notify player that team was dissolved
            globalEmitter.emit('quickClash:teamDissolved', {
              userId: player.user,
              reason: 'playerLeft',
            })
          }

          // Remove the team from team matchmaking if it's there
          await QuickClashTeamMatchmaking.findOneAndDelete({
            team: team._id,
          }).session(session)

          // Delete the auto-formed team
          await QuickClashTeam.findByIdAndDelete(team._id).session(session)

          console.log(`Team ${team._id} dissolved successfully`)
        }
      }

      // Now delete the player's matchmaking entry
      result = await QuickClashGlobalMatchmaking.findOneAndDelete({
        user: userId,
      }).session(session)

      // Emit event if successfully left
      if (result) {
        globalEmitter.emit('quickClash:userLeftMatchmaking', {
          userId,
        })
      }
    })

    return !!result
  } catch (error) {
    console.error('Error leaving global matchmaking:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Get team matchmaking status
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<Object>} Matchmaking status
 */
const getTeamMatchmakingStatus = async ({ teamId }) => {
  try {
    const matchmaking = await QuickClashTeamMatchmaking.findOne({
      team: teamId,
    })

    return {
      inMatchmaking: !!matchmaking,
      status: matchmaking ? matchmaking.status : null,
      matchmaking,
    }
  } catch (error) {
    console.error('Error getting team matchmaking status:', error)
    throw error
  }
}

/**
 * Get global matchmaking status for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Matchmaking status
 */
const getGlobalMatchmakingStatus = async ({ userId }) => {
  try {
    const matchmaking = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
      status: { $ne: 'in_battle' }, // Exclude users already in battle
    })

    return {
      inMatchmaking: !!matchmaking,
      status: matchmaking ? matchmaking.status : null,
      matchmaking,
    }
  } catch (error) {
    console.error('Error getting global matchmaking status:', error)
    throw error
  }
}

// Module-level variables for state management between function calls
const teamFormationState = {
  lastProcessingTime: 0,
  isCurrentlyProcessing: false,
  pendingPartialTeams: new Set(), // Teams waiting to be completed
  pendingSoloPlayers: new Set(), // Solo players waiting to be assigned
  formingTeamCache: new Map(), // Cache of teams being formed (key: teamId, value: member count)
}

// Debounce function to prevent excessive processing
const DEBOUNCE_INTERVAL = 3000 // 3 seconds

/**
 * Process the global matchmaking queue to form teams and create battles
 * @returns {Promise<void>}
 */
const processGlobalMatchmaking = async () => {
  // Debounce mechanism to prevent excessive processing
  const now = Date.now()
  if (
    teamFormationState.isCurrentlyProcessing ||
    now - teamFormationState.lastProcessingTime < DEBOUNCE_INTERVAL
  ) {
    console.log(
      'Matchmaking processing already in progress or too soon. Skipping.',
    )
    return
  }

  try {
    // Mark as processing and update timestamp
    teamFormationState.isCurrentlyProcessing = true
    teamFormationState.lastProcessingTime = now

    await performMatchmaking()
  } catch (error) {
    console.error('Error processing global matchmaking:', error)
  } finally {
    // Always release the processing lock
    teamFormationState.isCurrentlyProcessing = false
  }
}

/**
 * Main matchmaking logic - extracted to separate function for clarity
 */
const performMatchmaking = async () => {
  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      console.log('Processing global matchmaking queue')

      // Get all available solo players in matchmaking
      const soloPlayersAvailable = await QuickClashGlobalMatchmaking.find({
        status: 'available',
        team: null,
      })
        .sort({ createdAt: 1 })
        .populate('user', '_id name inGameName quickClashTrophies')
        .session(session)

      console.log(`Found ${soloPlayersAvailable.length} available solo players`)

      // Mark all available players as processing
      for (const player of soloPlayersAvailable) {
        player.status = 'processing'
        await player.save({ session })
        teamFormationState.pendingSoloPlayers.add(player.user._id.toString())
        emitUserMatchmakingProgress(player.user._id, 'forming_team', 30)
      }

      // Find all partial teams
      const partialTeams = await QuickClashTeam.find({
        'members.3': { $exists: false }, // Less than 4 members
        'members.0': { $exists: true }, // At least 1 member
        isInMatch: false,
      })
        .sort({ members: -1 }) // Teams with more members first
        .populate('members.user', '_id name inGameName quickClashTrophies')
        .session(session)

      console.log(`Found ${partialTeams.length} partial teams`)

      // Update our cached state of partial teams
      partialTeams.forEach(team => {
        teamFormationState.pendingPartialTeams.add(team._id.toString())
        teamFormationState.formingTeamCache.set(
          team._id.toString(),
          team.members.length,
        )
      })

      // State tracking for this session
      const usedPlayerIds = new Set()
      const completeTeams = []
      const processedTeamIds = new Set()
      const assignedPlayerIds = new Set()

      // First phase: Complete partial teams by combining them or adding solo players
      for (let i = 0; i < partialTeams.length; i++) {
        const team = partialTeams[i]
        if (processedTeamIds.has(team._id.toString())) continue

        // Skip teams that already have 4 members (defensive check)
        if (team.members.length === 4) {
          processedTeamIds.add(team._id.toString())
          completeTeams.push(team)
          continue
        }

        // Mark team members as used
        team.members.forEach(member => {
          usedPlayerIds.add(member.user._id.toString())
        })

        // Create a new team with these members as the base
        let newMembers = [...team.members]

        // Try to find another partial team to merge with
        for (let j = i + 1; j < partialTeams.length; j++) {
          const otherTeam = partialTeams[j]
          if (processedTeamIds.has(otherTeam._id.toString())) continue

          // Check if combining would make a team of exactly 4
          if (newMembers.length + otherTeam.members.length === 4) {
            // Perfect match! Check for duplicate members
            const hasDuplicates = otherTeam.members.some(m =>
              usedPlayerIds.has(m.user._id.toString()),
            )

            if (!hasDuplicates) {
              // We can merge these teams perfectly
              otherTeam.members.forEach(member => {
                newMembers.push(member)
                usedPlayerIds.add(member.user._id.toString())
              })

              processedTeamIds.add(otherTeam._id.toString())
              break // Found perfect match, stop looking
            }
          }
          // If adding would keep us under 4 members, consider it
          else if (newMembers.length + otherTeam.members.length < 4) {
            const hasDuplicates = otherTeam.members.some(m =>
              usedPlayerIds.has(m.user._id.toString()),
            )

            if (!hasDuplicates) {
              // Add these members
              otherTeam.members.forEach(member => {
                newMembers.push(member)
                usedPlayerIds.add(member.user._id.toString())
              })

              processedTeamIds.add(otherTeam._id.toString())
            }
          }
        }

        // If still need more players, add solo players
        if (newMembers.length < 4) {
          // Find eligible solo players not yet assigned
          const neededCount = 4 - newMembers.length
          let addedCount = 0

          for (const player of soloPlayersAvailable) {
            if (assignedPlayerIds.has(player.user._id.toString())) continue

            newMembers.push({
              user: player.user._id,
              role: 'member',
              status: 'ready',
            })

            assignedPlayerIds.add(player.user._id.toString())
            // Remove from pending solo players
            teamFormationState.pendingSoloPlayers.delete(
              player.user._id.toString(),
            )
            addedCount++

            // Update matchmaking status
            player.status = 'matched'
            await player.save({ session })

            if (addedCount >= neededCount) break
          }
        }

        // If we have exactly 4 members now, create the team
        if (newMembers.length === 4) {
          // Create a new team with empty name
          const newTeam = new QuickClashTeam({
            name: '', // Will be set by battle service
            creator: newMembers[0].user._id || newMembers[0].user,
            isPersistent: false,
            members: newMembers.map((member, idx) => ({
              user: member.user._id || member.user,
              role: idx === 0 ? 'leader' : 'member',
              status: 'ready',
            })),
          })

          await newTeam.save({ session })
          completeTeams.push(newTeam)

          // Clean up state tracking
          processedTeamIds.add(team._id.toString())
          teamFormationState.pendingPartialTeams.delete(team._id.toString())

          // Update all players' matchmaking status
          for (const member of newMembers) {
            const userId = member.user._id || member.user

            const entry = await QuickClashGlobalMatchmaking.findOne({
              user: userId,
            }).session(session)

            if (entry) {
              entry.status = 'matched'
              entry.team = newTeam._id
              await entry.save({ session })

              emitUserMatchmakingProgress(userId, 'team_formed', 60)
            }
          }
        }
      }

      // Second phase: Create teams from remaining solo players
      const remainingSoloPlayers = soloPlayersAvailable.filter(
        player => !assignedPlayerIds.has(player.user._id.toString()),
      )

      // Process in groups of 4
      for (let i = 0; i < remainingSoloPlayers.length; i += 4) {
        // Make sure we have 4 players for this team
        if (i + 3 < remainingSoloPlayers.length) {
          const teamPlayers = remainingSoloPlayers.slice(i, i + 4)

          // Create the new team
          const newTeam = new QuickClashTeam({
            name: '',
            creator: teamPlayers[0].user._id,
            isPersistent: false,
            members: [
              {
                user: teamPlayers[0].user._id,
                role: 'leader',
                status: 'ready',
              },
            ],
          })

          // Add the other members
          for (let j = 1; j < 4; j++) {
            newTeam.members.push({
              user: teamPlayers[j].user._id,
              role: 'member',
              status: 'ready',
            })
          }

          await newTeam.save({ session })
          completeTeams.push(newTeam)

          // Update matchmaking entries
          for (const player of teamPlayers) {
            player.status = 'matched'
            player.team = newTeam._id
            await player.save({ session })

            // Remove from pending solo players
            teamFormationState.pendingSoloPlayers.delete(
              player.user._id.toString(),
            )

            emitUserMatchmakingProgress(player.user._id, 'team_formed', 60)
          }
        }
      }

      // Add all complete teams to matchmaking
      console.log(
        `Adding ${completeTeams.length} complete teams to matchmaking`,
      )
      for (const team of completeTeams) {
        await joinTeamMatchmaking({ teamId: team._id, session })

        // Update progress for team members
        for (const member of team.members) {
          const userId = member.user._id || member.user
          setTimeout(() => {
            globalEmitter.emit('quickClash:userMatchmakingProgress', {
              userId: userId,
              step: 'searching_opponents',
              progress: 70,
            })
          }, 500)
        }
      }

      // Process teams in matchmaking to find matches
      await processTeamMatchmaking(session)

      // Log remaining pending players/teams for the next run
      console.log(
        `After processing: ${teamFormationState.pendingSoloPlayers.size} pending solo players, ${teamFormationState.pendingPartialTeams.size} pending partial teams`,
      )
    })
  } catch (error) {
    console.error('Error in matchmaking transaction:', error)
  } finally {
    session.endSession()
  }
}

/**
 * Process team matchmaking to find matches between teams
 * @param {mongoose.ClientSession} [session] - Mongoose session
 * @returns {Promise<void>}
 */
const processTeamMatchmaking = async providedSession => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log('Processing team matchmaking queue')

    // Get teams available for matchmaking
    const teams = await QuickClashTeamMatchmaking.find({
      status: 'available',
    })
      .sort({ createdAt: 1 }) // Process oldest entries first
      .populate('team')
      .session(session)

    if (teams.length < 2) {
      console.log('Not enough teams in matchmaking queue')
      return // Need at least 2 teams to match
    }

    console.log(`Found ${teams.length} teams in matchmaking queue`)

    // Try to match teams with similar trophy counts
    for (const teamEntry of teams) {
      if (teamEntry.status !== 'available') continue

      // Get team details
      const team = await QuickClashTeam.findById(teamEntry.team)
        .populate('members.user', '_id name inGameName quickClashTrophies')
        .session(session)

      if (!team) {
        // Team no longer exists, remove from matchmaking
        await QuickClashTeamMatchmaking.findOneAndDelete({
          _id: teamEntry._id,
        }).session(session)
        continue
      }

      // Progress update
      emitTeamMatchmakingProgress(team._id, 'searching', 20)

      // Start with initial trophy range and gradually increase it
      let trophyRange = TROPHY_RANGE_INITIAL
      let matchedTeamEntry = null

      // Try to find a match within trophy range
      while (!matchedTeamEntry && trophyRange <= MAX_TROPHY_RANGE) {
        // Find a team with similar trophy count
        matchedTeamEntry = await QuickClashTeamMatchmaking.findOne({
          _id: { $ne: teamEntry._id },
          status: 'available',
          avgTrophies: {
            $gte: teamEntry.avgTrophies - trophyRange,
            $lte: teamEntry.avgTrophies + trophyRange,
          },
        }).session(session)

        if (matchedTeamEntry) break

        // Increase trophy range for next search
        trophyRange += TROPHY_RANGE_INCREMENT
      }

      // If found a match
      if (matchedTeamEntry) {
        // Progress update
        emitTeamMatchmakingProgress(team._id, 'match_found', 40)

        const matchedTeam = await QuickClashTeam.findById(matchedTeamEntry.team)
          .populate('members.user', '_id name inGameName quickClashTrophies')
          .session(session)

        if (!matchedTeam) {
          // Matched team no longer exists, remove from matchmaking
          await QuickClashTeamMatchmaking.findOneAndDelete({
            _id: matchedTeamEntry._id,
          }).session(session)
          continue
        }

        // Check for duplicate users between teams
        const teamAUserIds = team.members.map(m => m.user._id.toString())
        const teamBUserIds = matchedTeam.members.map(m => m.user._id.toString())

        // Check for overlap (duplicate users)
        const duplicateUsers = teamAUserIds.filter(id =>
          teamBUserIds.includes(id),
        )

        if (duplicateUsers.length > 0) {
          console.log(
            `Found duplicate users between teams: ${duplicateUsers.join(', ')}`,
          )
          // Skip this match if there are duplicate users
          continue
        }

        // Mark both teams as matching to prevent race conditions
        teamEntry.status = 'matching'
        matchedTeamEntry.status = 'matching'

        await Promise.all([
          teamEntry.save({ session }),
          matchedTeamEntry.save({ session }),
        ])

        // Progress update
        emitTeamMatchmakingProgress(team._id, 'preparing_battle', 60)
        emitTeamMatchmakingProgress(matchedTeam._id, 'preparing_battle', 60)

        // Auto-select 4 categories for the battle
        const allCategories = getCategories()
        const battleCategories = getRandomCategories(allCategories, 4)

        // Create team battle between the two teams
        try {
          await Promise.all([
            updateTeamMatchStatus({
              teamId: team._id,
              isInMatch: true,
              session,
            }),
            updateTeamMatchStatus({
              teamId: matchedTeam._id,
              isInMatch: true,
              session,
            }),
          ])
          await Promise.all(
            team.members.map(member =>
              QuickClashGlobalMatchmaking.findOneAndDelete(
                { user: member.user._id },
                { session },
              ),
            ),
          )
          await Promise.all(
            matchedTeam.members.map(member =>
              QuickClashGlobalMatchmaking.findOneAndDelete(
                { user: member.user._id },
                { session },
              ),
            ),
          )
          const teamBattle = await createTeamBattle({
            teamAId: team._id,
            teamBId: matchedTeam._id,
            categories: battleCategories,
            session,
          })

          if (teamBattle) {
            // Progress update
            emitTeamMatchmakingProgress(team._id, 'battle_ready', 100)
            emitTeamMatchmakingProgress(matchedTeam._id, 'battle_ready', 100)

            // Remove both teams from matchmaking
            await Promise.all([
              QuickClashTeamMatchmaking.findOneAndDelete({
                _id: teamEntry._id,
              }).session(session),
              QuickClashTeamMatchmaking.findOneAndDelete({
                _id: matchedTeamEntry._id,
              }).session(session),
            ])

            console.log(
              `Created team battle ${teamBattle._id} between teams ${team._id} and ${matchedTeam._id}`,
            )
          }
        } catch (error) {
          console.error('Error creating team battle:', error)

          // Reset statuses if battle creation fails
          teamEntry.status = 'available'
          matchedTeamEntry.status = 'available'

          await Promise.all([
            teamEntry.save({ session }),
            matchedTeamEntry.save({ session }),
          ])
        }
      }
    }

    if (startedTransaction) {
      await session.commitTransaction()
    }
  } catch (error) {
    console.error('Error processing team matchmaking:', error)
    if (startedTransaction) {
      await session.abortTransaction()
    }
  } finally {
    if (!providedSession && session) {
      session.endSession()
    }
  }
}

/**
 * Check for a team match for a specific team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<Object|null>} Match result or null if no match found
 */
const checkForTeamMatch = async ({ teamId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      console.log(`Checking for match for team ${teamId}`)

      // Get team's matchmaking entry
      const teamEntry = await QuickClashTeamMatchmaking.findOne({
        team: teamId,
        status: 'available',
      }).session(session)

      if (!teamEntry) {
        return null
      }

      // Start progress tracking
      emitTeamMatchmakingProgress(teamId, 'searching', 10)

      // Get team details
      const team = await QuickClashTeam.findById(teamId)
        .populate('members.user', '_id quickClashTrophies name inGameName')
        .session(session)

      if (!team) {
        // Team no longer exists, remove from matchmaking
        await QuickClashTeamMatchmaking.findOneAndDelete({
          team: teamId,
        }).session(session)
        return null
      }

      // Progress update
      emitTeamMatchmakingProgress(teamId, 'searching', 20)

      // Auto-select 4 categories for the battle
      const allCategories = getCategories()
      const battleCategories = getRandomCategories(allCategories, 4)

      // Start with initial trophy range and gradually increase it
      let trophyRange = TROPHY_RANGE_INITIAL
      let matchedTeam = null

      // Progress update
      emitTeamMatchmakingProgress(teamId, 'matching', 30)

      while (!matchedTeam && trophyRange <= MAX_TROPHY_RANGE) {
        // Find a team with similar trophy count
        const matchedEntry = await QuickClashTeamMatchmaking.findOne({
          team: { $ne: teamId },
          status: 'available',
          avgTrophies: {
            $gte: teamEntry.avgTrophies - trophyRange,
            $lte: teamEntry.avgTrophies + trophyRange,
          },
        }).session(session)

        if (matchedEntry) {
          matchedTeam = await QuickClashTeam.findById(matchedEntry.team)
            .populate('members.user', '_id quickClashTrophies name inGameName')
            .session(session)

          if (!matchedTeam) {
            // Matched team no longer exists, remove from matchmaking
            await QuickClashTeamMatchmaking.findOneAndDelete({
              _id: matchedEntry._id,
            }).session(session)
            continue
          }

          // Check for duplicate users between teams
          const teamAUserIds = team.members.map(m => m.user._id.toString())
          const teamBUserIds = matchedTeam.members.map(m =>
            m.user._id.toString(),
          )

          // Check for overlap (duplicate users)
          const duplicateUsers = teamAUserIds.filter(id =>
            teamBUserIds.includes(id),
          )

          if (duplicateUsers.length > 0) {
            console.log(
              `Found duplicate users between teams: ${duplicateUsers.join(
                ', ',
              )}`,
            )
            // Skip this match if there are duplicate users
            matchedTeam = null
            continue
          }

          break
        }

        // Increase trophy range for next search
        trophyRange += TROPHY_RANGE_INCREMENT
      }

      // Progress update
      emitTeamMatchmakingProgress(teamId, 'matching', 40)

      // If we found a match
      if (matchedTeam) {
        // Progress update
        emitTeamMatchmakingProgress(teamId, 'match_found', 50)
        emitTeamMatchmakingProgress(matchedTeam._id, 'match_found', 50)

        // Get matched team entry
        const matchedEntry = await QuickClashTeamMatchmaking.findOne({
          team: matchedTeam._id,
        }).session(session)

        if (!matchedEntry) {
          return null
        }

        // Mark both teams as matching to prevent race conditions
        teamEntry.status = 'matching'
        matchedEntry.status = 'matching'

        await Promise.all([
          teamEntry.save({ session }),
          matchedEntry.save({ session }),
        ])

        // Progress update
        emitTeamMatchmakingProgress(teamId, 'preparing_battle', 70)
        emitTeamMatchmakingProgress(matchedTeam._id, 'preparing_battle', 70)

        await Promise.all([
          updateTeamMatchStatus({
            teamId: teamId,
            isInMatch: true,
            session,
          }),
          updateTeamMatchStatus({
            teamId: matchedTeam._id,
            isInMatch: true,
            session,
          }),
        ])
        // for (const member of [...team.members, ...matchedTeam.members]) {
        //   // Remove player from global matchmaking
        //   await QuickClashGlobalMatchmaking.findOneAndDelete(
        //     { user: member.user._id },
        //     { session },
        //   )
        // }
        // convert above loc in promise.all
        await Promise.all(
          team.members.map(member =>
            QuickClashGlobalMatchmaking.findOneAndDelete(
              { user: member.user._id },
              { session },
            ),
          ),
        )
        await Promise.all(
          matchedTeam.members.map(member =>
            QuickClashGlobalMatchmaking.findOneAndDelete(
              { user: member.user._id },
              { session },
            ),
          ),
        )
        // Create team battle between the two teams
        const teamBattle = await createTeamBattle({
          teamAId: teamId,
          teamBId: matchedTeam._id,
          categories: battleCategories,
          session,
        })

        if (teamBattle) {
          // Progress update
          emitTeamMatchmakingProgress(teamId, 'battle_ready', 100)
          emitTeamMatchmakingProgress(matchedTeam._id, 'battle_ready', 100)

          // Remove both teams from matchmaking
          await Promise.all([
            QuickClashTeamMatchmaking.findOneAndDelete({
              team: teamId,
            }).session(session),
            QuickClashTeamMatchmaking.findOneAndDelete({
              team: matchedTeam._id,
            }).session(session),
          ])

          // Return the match result
          return {
            matchType: 'real',
            teamBattle,
          }
        }
      }

      return null
    })
  } catch (error) {
    console.error('Error checking for team match:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Get random subset of categories
 * @param {Array} categories - All available categories
 * @param {number} count - Number of categories to select
 * @returns {Array} Selected categories
 */
const getRandomCategories = (categories, count) => {
  const shuffled = [...categories].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

module.exports = {
  joinTeamMatchmaking,
  joinGlobalMatchmaking,
  leaveTeamMatchmaking,
  leaveGlobalMatchmaking,
  getTeamMatchmakingStatus,
  getGlobalMatchmakingStatus,
  checkForTeamMatch,
  getRandomCategories,
  processGlobalMatchmaking,
  processTeamMatchmaking,
}
