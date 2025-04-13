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

// Module-level variables for state management between function calls
const teamFormationState = {
  lastProcessingTime: 0,
  isCurrentlyProcessing: false,
  pendingPartialTeams: new Set(), // Teams waiting to be completed
  pendingSoloPlayers: new Set(), // Solo players waiting to be assigned
  formingTeamCache: new Map(), // Cache of teams being formed (key: teamId, value: member count)
}

/**
 * Helper to clean up team state when a team is removed from matchmaking
 * @param {string} teamId - Team ID to clean up
 */
const cleanupTeamState = teamId => {
  if (!teamId) return

  const teamIdStr = teamId.toString()

  // Remove from pending partial teams
  if (teamFormationState.pendingPartialTeams.has(teamIdStr)) {
    console.log(`Cleaning up pendingPartialTeams state for team ${teamIdStr}`)
    teamFormationState.pendingPartialTeams.delete(teamIdStr)
  }

  // Remove from forming team cache
  if (teamFormationState.formingTeamCache.has(teamIdStr)) {
    console.log(`Cleaning up formingTeamCache state for team ${teamIdStr}`)
    teamFormationState.formingTeamCache.delete(teamIdStr)
  }
}

/**
 * Helper to clean up player state when a player is removed from matchmaking
 * @param {string} userId - User ID to clean up
 */
const cleanupPlayerState = userId => {
  if (!userId) return

  const userIdStr = userId.toString()

  // Remove from pending solo players
  if (teamFormationState.pendingSoloPlayers.has(userIdStr)) {
    console.log(`Cleaning up pendingSoloPlayers state for user ${userIdStr}`)
    teamFormationState.pendingSoloPlayers.delete(userIdStr)
  }
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

    if (team.members.length < 4) {
      // Add to pending partial teams if not a full team
      teamFormationState.pendingPartialTeams.add(teamId.toString())
      teamFormationState.formingTeamCache.set(
        teamId.toString(),
        team.members.length,
      )
      await performMatchmaking(session)
    } else {
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
    }
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

      // Add to pending solo players state
      teamFormationState.pendingSoloPlayers.add(userId.toString())

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
 * Helper function to handle auto-team cleanup
 * @param {Object} params - Parameters
 * @param {Object} params.autoTeam - The auto-formed team to clean up
 * @param {Array} params.sourcePlayers - Players from the source team
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<void>}
 */
const handleAutoTeamCleanup = async ({ autoTeam, sourcePlayers, session }) => {
  // Remove from matchmaking if present
  await QuickClashTeamMatchmaking.findOneAndDelete({
    team: autoTeam._id,
  }).session(session)

  // Clean up team state
  cleanupTeamState(autoTeam._id)

  // Reset all players in the auto-team
  for (const member of autoTeam.members) {
    // Get user ID
    const userId = member.user._id || member.user

    // Find user's matchmaking entry
    const playerEntry = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
      team: autoTeam._id,
    }).session(session)

    if (playerEntry) {
      // If player is from a source team, just delete their entry
      if (
        sourcePlayers.some(p => {
          const playerId = p.user._id || p.user
          return playerId.toString() === userId.toString()
        })
      ) {
        await QuickClashGlobalMatchmaking.findOneAndDelete({
          user: userId,
        }).session(session)
      }
      // Otherwise reset to available
      else {
        playerEntry.status = 'available'
        playerEntry.team = null
        await playerEntry.save({ session })

        // Notify player
        globalEmitter.emit('quickClash:teamDissolved', {
          userId,
          reason: 'teamLeft',
        })
      }

      // Clean up player state
      cleanupPlayerState(userId)
    }
  }

  // Delete the auto-formed team
  await QuickClashTeam.findByIdAndDelete(autoTeam._id).session(session)

  console.log(`Auto-team ${autoTeam._id} cleaned up successfully`)
}

/**
/**
 * Leave team matchmaking queue
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<boolean>} Success status
 */
const leaveTeamMatchmaking = async ({ teamId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      console.log(`Team ${teamId} leaving matchmaking queue`)

      // Find the entry first to check its status
      const entry = await QuickClashTeamMatchmaking.findOne({
        team: teamId,
      }).session(session)

      // If the entry is 'processed', we should remove it too
      // This can happen if a team was already included in a new team formation
      // but the user still tries to leave matchmaking
      if (
        entry &&
        (entry.status === 'available' || entry.status === 'processed')
      ) {
        await QuickClashTeamMatchmaking.findOneAndDelete({
          team: teamId,
        }).session(session)

        // Clean up team state
        cleanupTeamState(teamId)

        // If the team was processed (used in auto-team formation)
        if (entry.status === 'processed') {
          console.log(
            `Team ${teamId} was processed, checking auto-formed teams`,
          )

          // Find auto-teams that used this team as a source
          const autoTeams = await QuickClashTeam.find({
            'formationInfo.sourceTeams': teamId,
            'formationInfo.isAutoFormed': true,
          }).session(session)

          console.log(
            `Found ${autoTeams.length} auto-formed teams using this team`,
          )

          for (const autoTeam of autoTeams) {
            console.log(`Handling cleanup for auto-team ${autoTeam._id}`)

            // Find all players from this team in the auto-team
            const sourcePlayers = autoTeam.members.filter(
              m =>
                m.sourceTeam && m.sourceTeam.toString() === teamId.toString(),
            )

            // Clean up the auto-formed team
            await handleAutoTeamCleanup({
              autoTeam,
              sourcePlayers,
              session,
            })
          }
        }

        // Emit event if successfully left
        if (entry.status === 'available') {
          globalEmitter.emit('quickClash:teamLeftMatchmaking', {
            teamId,
          })
        }

        return true
      }

      return false
    })
  } catch (error) {
    console.error('Error leaving team matchmaking:', error)
    throw error
  } finally {
    session.endSession()
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

      // Clean up player state immediately
      cleanupPlayerState(userId)

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

          // Clean up team state
          cleanupTeamState(team._id)

          // Find all other players in this team's matchmaking
          const teamPlayers = await QuickClashGlobalMatchmaking.find({
            team: team._id,
            user: { $ne: userId }, // Exclude the leaving player
          }).session(session)

          // Reset all other players back to available status
          for (const player of teamPlayers) {
            console.log(`Resetting player ${player.user} status to available`)
            // Clean up each team player's state
            cleanupPlayerState(player.user)

            player.status = 'available'
            player.team = null
            await player.save({ session })

            // Notify player that team was dissolved
            globalEmitter.emit('quickClash:teamDissolved', {
              userId: player.user,
              reason: 'playerLeft',
            })
          }

          // Check if this was an auto-formed team and reset source teams if needed
          if (team.formationInfo && team.formationInfo.isAutoFormed) {
            const sourceTeams = team.formationInfo.sourceTeams || []
            console.log(
              `Checking ${sourceTeams.length} source teams to reset status`,
            )

            // Reset all source teams' matchmaking entries back to available
            for (const sourceTeamId of sourceTeams) {
              console.log(`Resetting source team ${sourceTeamId} status`)
              const sourceTeamEntry = await QuickClashTeamMatchmaking.findOne({
                team: sourceTeamId,
                status: 'processed', // Only reset if still marked as processed
              }).session(session)

              if (sourceTeamEntry) {
                console.log(
                  `Found entry for team ${sourceTeamId}, resetting to available`,
                )
                sourceTeamEntry.status = 'available'
                await sourceTeamEntry.save({ session })

                // Re-add to pending partial teams state
                teamFormationState.pendingPartialTeams.add(
                  sourceTeamId.toString(),
                )

                // Get member count for cache
                const sourceTeam = await QuickClashTeam.findById(sourceTeamId)
                  .select('members')
                  .session(session)

                if (sourceTeam) {
                  teamFormationState.formingTeamCache.set(
                    sourceTeamId.toString(),
                    sourceTeam.members.length,
                  )
                }
              }
            }
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
 * @param {Object} options
 * @param {mongoose.ClientSession} [options.providedSession] - Optional mongoose session
 * @returns {Promise<void>}
 */
const performMatchmaking = async providedSession => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log('Processing global matchmaking queue')

    // Get all available solo players in matchmaking
    const soloPlayersAvailable = await QuickClashGlobalMatchmaking.find({
      status: { $in: ['available', 'processing'] }, // Include processing players that weren't matched
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

    // Find all partial teams - only look for teams with 'available' status
    const teamsInMatchmaking = await QuickClashTeamMatchmaking.find({
      status: 'available', // Only find available teams, not processed ones
    })
      .select('team')
      .lean()
      .session(session)

    console.log(`Found ${teamsInMatchmaking.length} teams in matchmaking`)
    const teamIdsInMatchmaking = teamsInMatchmaking.map(entry => entry.team)

    // Then find partial teams that are both in matchmaking AND have fewer than 4 members
    const partialTeams = await QuickClashTeam.find({
      _id: { $in: teamIdsInMatchmaking }, // Only teams in matchmaking
      'members.3': { $exists: false }, // Less than 4 members
    })
      .sort({ lastActive: -1 })
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
      let newMembers = team.members.map(member => {
        // Extract only the data we need from the Mongoose document
        return {
          user: member.user, // Keep the reference intact
          role: member.role || 'member',
          status: member.status || 'ready',
          joinedAt: member.joinedAt || new Date(),
          selectedCategory: member.selectedCategory || null,
          sourceTeam: team._id, // Track original team for each member
        }
      })

      // Keep track of teams used to form this new team
      const usedTeamIds = [team._id.toString()]
      const sourceTeams = [team._id]
      const soloPlayers = []

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
              newMembers.push({
                user: member.user,
                role: member.role || 'member',
                status: member.status || 'ready',
                joinedAt: member.joinedAt || new Date(),
                selectedCategory: member.selectedCategory || null,
                sourceTeam: otherTeam._id, // Track original team for each member
              })

              if (member.user && member.user._id) {
                usedPlayerIds.add(member.user._id.toString())
              }
            })

            processedTeamIds.add(otherTeam._id.toString())
            usedTeamIds.push(otherTeam._id.toString())
            sourceTeams.push(otherTeam._id)

            // Clean up the other team from the state since it's being merged
            cleanupTeamState(otherTeam._id)

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
              newMembers.push({
                user: member.user,
                role: member.role || 'member',
                status: member.status || 'ready',
                joinedAt: member.joinedAt || new Date(),
                selectedCategory: member.selectedCategory || null,
                sourceTeam: otherTeam._id, // Track original team for each member
              })

              if (member.user && member.user._id) {
                usedPlayerIds.add(member.user._id.toString())
              }
            })

            processedTeamIds.add(otherTeam._id.toString())
            usedTeamIds.push(otherTeam._id.toString())
            sourceTeams.push(otherTeam._id)

            // Clean up the other team from the state since it's being merged
            cleanupTeamState(otherTeam._id)
          }
        }
      }

      // If still need more players, add solo players
      if (newMembers.length < 4) {
        // Find eligible solo players not yet assigned
        const neededCount = 4 - newMembers.length
        let addedCount = 0

        // Keep track of players we're tentatively adding
        const tentativePlayerIds = []
        const tentativePlayers = []

        for (const player of soloPlayersAvailable) {
          if (assignedPlayerIds.has(player.user._id.toString())) continue

          newMembers.push({
            user: player.user._id,
            role: 'member',
            status: 'ready',
            sourceTeam: null, // No source team for solo players
          })

          // Track this solo player for origin info
          soloPlayers.push(player.user._id)

          // Track for potential rollback
          tentativePlayerIds.push(player.user._id.toString())
          tentativePlayers.push(player)

          // Temporarily mark as assigned but don't update status yet
          assignedPlayerIds.add(player.user._id.toString())
          // Remove from pending solo players temporarily
          teamFormationState.pendingSoloPlayers.delete(
            player.user._id.toString(),
          )

          addedCount++

          if (addedCount >= neededCount) break
        }

        // If we have exactly 4 members now, create the team and update player statuses
        if (newMembers.length === 4) {
          // Update matchmaking status of tentative players to matched
          for (const player of tentativePlayers) {
            player.status = 'matched'
            await player.save({ session })
          }
        } else {
          // We couldn't form a complete team, rollback the solo player assignments
          console.log(
            `Cannot form complete team with ${newMembers.length} members, rolling back solo player assignments`,
          )

          // Remove the solo players we just added from newMembers
          newMembers.splice(newMembers.length - tentativePlayers.length)

          // Remove from soloPlayers array too
          soloPlayers.splice(soloPlayers.length - tentativePlayers.length)

          // Undo the assignments
          for (const playerId of tentativePlayerIds) {
            assignedPlayerIds.delete(playerId)
            teamFormationState.pendingSoloPlayers.add(playerId)
          }

          // Don't create a team in this case - exit the loop for this partial team
          continue
        }
      }

      // If we have exactly 4 members now, create the team
      if (newMembers.length === 4) {
        // Create a new team with empty name
        const newTeam = new QuickClashTeam({
          name: '', // Will be set by battle service
          creator: newMembers[0].user._id || newMembers[0].user,
          isPersistent: false,
          teamType: 'auto', // Mark as auto-formed team
          members: newMembers
            .map((member, idx) => {
              const userId =
                member.user && member.user._id ? member.user._id : member.user
              return {
                user: userId,
                role: idx === 0 ? 'leader' : 'member',
                status: 'ready',
                sourceTeam: member.sourceTeam,
              }
            })
            .filter(m => m.user),
          // Add formation info for tracking origin
          formationInfo: {
            isAutoFormed: true,
            sourceTeams,
            soloPlayers,
            formationDate: new Date(),
          },
        })

        await newTeam.save({ session })
        completeTeams.push(newTeam)

        // Clean up state tracking
        processedTeamIds.add(team._id.toString())
        teamFormationState.pendingPartialTeams.delete(team._id.toString())
        teamFormationState.formingTeamCache.delete(team._id.toString())

        // Log formation info
        console.log(
          `Created auto-formed team ${newTeam._id} from ${sourceTeams.length} source teams and ${soloPlayers.length} solo players`,
        )

        // Mark all used teams as 'processed' in the database
        for (const usedTeamId of usedTeamIds) {
          // Find and update status in matchmaking entry
          await QuickClashTeamMatchmaking.findOneAndUpdate(
            { team: usedTeamId },
            { status: 'processed' },
            { session },
          )
          console.log(`Marked team ${usedTeamId} as processed in matchmaking`)
        }

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

    console.log(
      `Found ${remainingSoloPlayers.length} remaining solo players for team formation`,
    )

    // Process in groups of 4
    for (let i = 0; i < remainingSoloPlayers.length; i += 4) {
      // Make sure we have 4 players for this team
      if (i + 3 < remainingSoloPlayers.length) {
        const teamPlayers = remainingSoloPlayers.slice(i, i + 4)
        const soloPlayerIds = teamPlayers.map(player => player.user._id)

        // Create the new team
        const newTeam = new QuickClashTeam({
          name: '',
          creator: teamPlayers[0].user._id,
          isPersistent: false,
          teamType: 'auto', // Mark as auto-formed team
          members: [
            {
              user: teamPlayers[0].user._id,
              role: 'leader',
              status: 'ready',
              sourceTeam: null, // No source team for solo players
            },
          ],
          // Add formation info for tracking origin
          formationInfo: {
            isAutoFormed: true,
            sourceTeams: [], // No source teams for pure solo team
            soloPlayers: soloPlayerIds,
            formationDate: new Date(),
          },
        })

        // Add the other members
        for (let j = 1; j < 4; j++) {
          newTeam.members.push({
            user: teamPlayers[j].user._id,
            role: 'member',
            status: 'ready',
            sourceTeam: null, // No source team for solo players
          })
        }

        await newTeam.save({ session })
        completeTeams.push(newTeam)

        // Log formation info
        console.log(
          `Created auto-formed team ${newTeam._id} from ${soloPlayerIds.length} solo players`,
        )

        // Update matchmaking entries
        for (const player of teamPlayers) {
          player.status = 'matched'
          player.team = newTeam._id
          await player.save({ session })

          // Mark as assigned
          assignedPlayerIds.add(player.user._id.toString())

          // Remove from pending solo players
          teamFormationState.pendingSoloPlayers.delete(
            player.user._id.toString(),
          )

          emitUserMatchmakingProgress(player.user._id, 'team_formed', 60)
        }
      }
    }

    // Add all complete teams to matchmaking
    console.log(`Adding ${completeTeams.length} complete teams to matchmaking`)
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

    // Reset unassigned players back to 'available' status
    const unassignedPlayers = soloPlayersAvailable.filter(
      player => !assignedPlayerIds.has(player.user._id.toString()),
    )

    console.log(
      `Resetting status for ${unassignedPlayers.length} unassigned players back to available`,
    )
    for (const player of unassignedPlayers) {
      // Reset back to available so they're picked up in next cycle
      player.status = 'available'
      await player.save({ session })
    }

    // Log remaining pending players/teams for the next run
    console.log(
      `After processing: ${teamFormationState.pendingSoloPlayers.size} pending solo players, ${teamFormationState.pendingPartialTeams.size} pending partial teams`,
    )

    if (startedTransaction) {
      await session.commitTransaction()
    }
  } catch (error) {
    console.error('Error in matchmaking transaction:', error)
    if (startedTransaction) {
      await session.abortTransaction()
    }
    throw error // Re-throw for caller to handle
  } finally {
    if (!providedSession) {
      session.endSession()
    }
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

    // Get teams available for matchmaking - now explicitly excluding 'processed' teams
    const teams = await QuickClashTeamMatchmaking.find({
      status: 'available', // Only use teams with 'available' status
      memberCount: 4,
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

      if (!team || team.members.length < 4) {
        // Team no longer exists, remove from matchmaking
        await QuickClashTeamMatchmaking.findOneAndDelete({
          _id: teamEntry._id,
        }).session(session)

        // Clean up team state
        cleanupTeamState(teamEntry.team)
        continue
      }

      // Progress update
      emitTeamMatchmakingProgress(team._id, 'searching', 20)

      // Start with initial trophy range and gradually increase it
      let trophyRange = TROPHY_RANGE_INITIAL
      let matchedTeamEntry = null

      // Try to find a match within trophy range - now explicitly excluding 'processed' teams
      while (!matchedTeamEntry && trophyRange <= MAX_TROPHY_RANGE) {
        // Find a team with similar trophy count
        matchedTeamEntry = await QuickClashTeamMatchmaking.findOne({
          _id: { $ne: teamEntry._id },
          status: 'available', // Only match with available teams
          avgTrophies: {
            $gte: teamEntry.avgTrophies - trophyRange,
            $lte: teamEntry.avgTrophies + trophyRange,
          },
          memberCount: 4,
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

          // Clean up team state
          cleanupTeamState(matchedTeamEntry.team)
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
              ).then(() => {
                // Clean up each player's state
                cleanupPlayerState(member.user._id)
              }),
            ),
          )
          await Promise.all(
            matchedTeam.members.map(member =>
              QuickClashGlobalMatchmaking.findOneAndDelete(
                { user: member.user._id },
                { session },
              ).then(() => {
                // Clean up each player's state
                cleanupPlayerState(member.user._id)
              }),
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

            // Clean up both teams from the state
            cleanupTeamState(team._id)
            cleanupTeamState(matchedTeam._id)

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
        status: 'available', // Ensure team is available
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

      if (!team || team.members.length < 4) {
        // Team no longer exists, remove from matchmaking
        await QuickClashTeamMatchmaking.findOneAndDelete({
          team: teamId,
        }).session(session)

        // Clean up team state
        cleanupTeamState(teamId)
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
        // Find a team with similar trophy count - now explicitly excluding 'processed' teams
        const matchedEntry = await QuickClashTeamMatchmaking.findOne({
          team: { $ne: teamId },
          status: 'available', // Only match with available teams
          avgTrophies: {
            $gte: teamEntry.avgTrophies - trophyRange,
            $lte: teamEntry.avgTrophies + trophyRange,
          },
          memberCount: 4,
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

            // Clean up team state
            cleanupTeamState(matchedEntry.team)
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

        await Promise.all(
          team.members.map(member =>
            QuickClashGlobalMatchmaking.findOneAndDelete(
              { user: member.user._id },
              { session },
            ).then(() => {
              // Clean up each player's state
              cleanupPlayerState(member.user._id)
            }),
          ),
        )
        await Promise.all(
          matchedTeam.members.map(member =>
            QuickClashGlobalMatchmaking.findOneAndDelete(
              { user: member.user._id },
              { session },
            ).then(() => {
              // Clean up each player's state
              cleanupPlayerState(member.user._id)
            }),
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

          // Clean up both teams from the state
          cleanupTeamState(teamId)
          cleanupTeamState(matchedTeam._id)

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

// Expose for testing
const _getTeamFormationState = () => {
  return { ...teamFormationState }
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
  // For testing
  _getTeamFormationState,
}
