// services/quickClashServices/quickClashTeamMatchmakingService.js
// MODIFY: Add retry logic to matchmaking operations and improve error handling

const mongoose = require('mongoose')
const QuickClashTeamMatchmaking = require('../../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashGlobalMatchmaking = require('../../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const User = require('../../model/userSchema')
const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
const globalEmitter = require('../../eventEmitter')
const { getCategories } = require('../../data/categories')
const { createTeamBattle } = require('./quickClashTeamBattleService')
const { updateTeamMatchStatus } = require('./quickClashTeamService')
const { notifyTeamMatchmakingStarted } = require('./quickClashNotificationService')
const { makeRetryable } = require('../../utils/retryUtils') // ADD: Import retry utility
const { matchmakingMutex } = require('../../utils/asyncMutex') // ADD: Import mutex for concurrency control

// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const TROPHY_RANGE_INITIAL = 200 // Initial trophy range for matching
const TROPHY_RANGE_INCREMENT = 100 // How much to increase range each check
const MAX_TROPHY_RANGE = 1000 // Maximum trophy range difference

/**
 * Helper to get member ID for both user and session player members
 * @param {Object} member - Team member object
 * @returns {string|null} Member ID as string or null if not found
 */
const getMemberId = (member) => {
  if (!member) return null
  if (member.user) {
    return member.user._id ? member.user._id.toString() : member.user.toString()
  }
  if (member.sessionPlayer) {
    return member.sessionPlayer._id
      ? member.sessionPlayer._id.toString()
      : member.sessionPlayer.toString()
  }
  return null
}

/**
 * Helper to get player ID from matchmaking entry
 * Handles both regular users (populated) and session players (null after populate)
 * @param {Object} matchmakingEntry - Global matchmaking entry with user field
 * @returns {string|null} Player ID as string or null if not found
 */
const getPlayerIdFromMatchmaking = (matchmakingEntry) => {
  if (!matchmakingEntry) return null

  // Check manually populated field first
  if (matchmakingEntry.populatedUser?._id) {
    return matchmakingEntry.populatedUser._id.toString()
  }

  // If user is populated and has _id
  if (matchmakingEntry.user?._id) {
    return matchmakingEntry.user._id.toString()
  }

  // If user is a raw ObjectId (not populated or session player)
  if (matchmakingEntry.user) {
    return matchmakingEntry.user.toString()
  }

  // Fallback to raw document field
  if (matchmakingEntry._doc?.user) {
    return matchmakingEntry._doc.user.toString()
  }

  return null
}

// Module-level variables for state management between function calls
const teamFormationState = {
  lastProcessingTime: 0,
  lastProcessingStartTime: 0, // Track when processing started for stuck detection
  isCurrentlyProcessing: false,
  pendingPartialTeams: new Set(), // Teams waiting to be completed
  pendingSoloPlayers: new Set(), // Solo players waiting to be assigned
  formingTeamCache: new Map(), // Cache of teams being formed (key: teamId, value: member count)
}

// Safety timeout for stuck processing detection (60 seconds)
const MAX_PROCESSING_TIME = 60000

/**
 * Join team matchmaking queue with existing team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {boolean} [params.isAutoFormed=false] - Whether this team was auto-formed
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} Matchmaking entry
 */
const joinTeamMatchmaking = async ({
  teamId,
  isAutoFormed = false,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    // Start new transaction only if we created our own session
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log(`Team ${teamId} joining matchmaking queue`)

    // Check if team exists - populate BOTH user and sessionPlayer
    const team = await QuickClashTeam.findById(teamId)
      .populate('members.user', 'name inGameName quickClashTrophies')
      .populate('members.sessionPlayer', 'inGameName trophies')
      .session(session)

    if (!team) {
      throw new Error('Team not found')
    }

    // Check if all members are ready
    const allReady = team.members.every(member => member.status === 'ready')
    if (!allReady) {
      throw new Error('All team members must be ready to join matchmaking')
    }

    // SPECIAL HANDLING FOR AUTO-FORMED TEAMS
    // Skip the user matchmaking check for auto-formed teams since we just created them
    // and we've already cleaned up the original matchmaking entries
    if (!isAutoFormed && !team.formationInfo?.isAutoFormed) {
      // Check if any team member is already in matchmaking
      for (const member of team.members) {
        // Use getMemberId for safe access to both user and session player IDs
        const memberId = getMemberId(member)
        if (!memberId) {
          console.warn('Member has no user or sessionPlayer ID, skipping matchmaking check')
          continue
        }

        const matchmakingStatus = await checkUserInMatchmaking({
          userId: memberId,
          session,
        })

        if (matchmakingStatus.isInMatchmaking) {
          // Get a proper name for the member (works for both user and session player)
          const memberName =
            member.user?.name || member.user?.inGameName ||
            member.sessionPlayer?.inGameName || 'A player'

          // Check if they're in the same team
          if (matchmakingStatus.type === 'team') {
            const inMatchmakingTeamId =
              matchmakingStatus.details.team._id.toString()
            if (inMatchmakingTeamId !== teamId.toString()) {
              throw new Error(
                `Team member ${memberName} is already in another team's matchmaking queue. Please wait for their current matchmaking to complete.`,
              )
            }
          } else {
            // They're in global matchmaking
            throw new Error(
              `Team member ${memberName} is already in global matchmaking queue. Please wait for their current matchmaking to complete.`,
            )
          }
        }
      }
    } else {
      console.log(
        `Team ${teamId} is auto-formed, skipping individual matchmaking checks`,
      )
    }

    // Calculate team's average trophies (handle both users and session players)
    let totalTrophies = 0
    team.members.forEach(member => {
      // Get trophies from either user or sessionPlayer
      totalTrophies += member.user?.quickClashTrophies || member.sessionPlayer?.trophies || 1000
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
      // FIX: Trigger matchmaking asynchronously AFTER the current transaction commits
      // This prevents WriteConflict errors from nested transactions competing with
      // the bot scheduler's processGlobalMatchmaking calls
      // (Same pattern used for full teams at line 257-261)
      setTimeout(() => {
        processGlobalMatchmaking().catch(err => {
          console.error('Error in async matchmaking after partial team join:', err)
        })
      }, 100)

      // Emit for authenticated user sockets
      globalEmitter.emit('quickClash:teamJoinedMatchmaking', {
        teamId: team._id.toString(),
        teamName: team.name,
        avgTrophies: avgTrophies,
        memberCount: team.members.length,
        isAutoFormed: team.formationInfo?.isAutoFormed || false,
        teamMembers: team.members.map(member => ({
          // Handle both user and session player members
          id: getMemberId(member),
          userId: member.user?._id ? member.user._id.toString() : (member.user || getMemberId(member)),
          sessionPlayerId: member.sessionPlayer?._id?.toString() || member.sessionPlayer?.toString(),
          name: member.user?.name || member.user?.inGameName || member.sessionPlayer?.inGameName || 'Player',
          isSessionPlayer: !!member.sessionPlayer,
          sourceTeam: member.sourceTeam,
          originalTeam: member.originalTeam,
          role: member.role // Added role for client-side leader checks
        })),
        formationInfo: team.formationInfo,
        timestamp: new Date(),
        matchmakingId: matchmakingEntry._id.toString(),
      })
    } else {
      // Emit event for real-time updates
      globalEmitter.emit('quickClash:teamJoinedMatchmaking', {
        teamId: team._id.toString(),
        teamName: team.name,
        avgTrophies: avgTrophies,
        memberCount: team.members.length,
        teamMembers: team.members.map(member => ({
          // Handle both user and session player members
          id: getMemberId(member),
          userId: member.user?._id ? member.user._id.toString() : (member.user || getMemberId(member)),
          sessionPlayerId: member.sessionPlayer?._id?.toString() || member.sessionPlayer?.toString(),
          name: member.user?.name || member.user?.inGameName || member.sessionPlayer?.inGameName || 'Player',
          isSessionPlayer: !!member.sessionPlayer,
          role: member.role // Added role for client-side leader checks
        })),
        preferredCategories: [],
        preferredCategories: [],
        timestamp: new Date(),
        matchmakingId: matchmakingEntry._id.toString(),
      })

      // Try to find a match right away (async)
      setTimeout(() => {
        checkForTeamMatch({ teamId }).catch(err => {
          console.error('Error checking for team match:', err)
        })
      }, 100)

      // Send push notifications to offline team members
      const leader = team.members.find(m => m.role === 'leader')
      const leaderId = getMemberId(leader)
      const leaderName = leader?.user?.name || leader?.user?.inGameName || leader?.sessionPlayer?.inGameName || 'Your leader'

      notifyTeamMatchmakingStarted({
        teamId: team._id.toString(),
        teamName: team.name,
        leaderName,
        teamMembers: team.members,
        leaderId,
      }).catch(err => {
        console.error('Error sending team matchmaking push notifications:', err)
      })
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
 * Check if a user is already in any matchmaking queue
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID to check
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} Result with isInMatchmaking flag and details
 */
const checkUserInMatchmaking = async ({ userId, session: providedSession }) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      session.startTransaction()
    }

    // Make sure we have a string ID
    const userIdStr = userId.toString()

    // Check if user is in global matchmaking
    const globalEntry = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
      status: { $in: ['available', 'processing', 'matched'] }, // Include all active statuses
    }).session(session)

    if (globalEntry) {
      console.log(
        `User ${userIdStr} found in global matchmaking with status: ${globalEntry.status}`,
      )

      // If the user is in a team, verify if it's an auto-formed team
      if (globalEntry.team) {
        const team = await QuickClashTeam.findById(globalEntry.team)
          .select('formationInfo')
          .session(session)

        if (team && team.formationInfo && team.formationInfo.isAutoFormed) {
          console.log(
            `User ${userIdStr} is in auto-formed team ${globalEntry.team}, checking if recently created`,
          )

          // Check if this team was recently created (within last 5 seconds)
          // This helps prevent race conditions during team formation
          if (
            team.formationInfo.formationDate &&
            Date.now() - new Date(team.formationInfo.formationDate).getTime() <
              5000
          ) {
            console.log(
              `Auto-formed team ${globalEntry.team} was created recently, ignoring matchmaking entry`,
            )

            // For very recently created auto-formed teams, we'll ignore the entry
            // to prevent race conditions during team formation
            if (startedTransaction) {
              await session.commitTransaction()
            }
            return {
              isInMatchmaking: false,
            }
          }
        }
      }

      return {
        isInMatchmaking: true,
        type: 'global',
        details: globalEntry,
      }
    }

    // Check if user/session player is in any REAL team (not auto-formed) that's in matchmaking
    // Auto-formed teams are temporary and shouldn't block new matchmaking
    const userTeams = await QuickClashTeam.find({
      $and: [
        // User must be a member
        {
          $or: [
            { 'members.user': userId },
            { 'members.sessionPlayer': userId }
          ]
        },
        // Must NOT be auto-formed (either no formationInfo or isAutoFormed != true)
        {
          $or: [
            { 'formationInfo.isAutoFormed': { $ne: true } },
            { 'formationInfo': { $exists: false } }
          ]
        }
      ]
    }).session(session)

    if (userTeams.length > 0) {
      const teamIds = userTeams.map(team => team._id)
      console.log(
        `User ${userIdStr} is in ${teamIds.length} teams, checking if any are in matchmaking`,
      )

      // Only check for active matchmaking entries (available or matching)
      // Exclude processed teams which are being used to form larger teams
      const teamEntry = await QuickClashTeamMatchmaking.findOne({
        team: { $in: teamIds },
        status: { $in: ['available', 'matching'] }, // Don't include 'processed' teams
      })
        .populate('team')
        .session(session)

      if (teamEntry) {
        console.log(
          `User ${userIdStr} found in team matchmaking for team ${teamEntry.team._id}`,
        )
        return {
          isInMatchmaking: true,
          type: 'team',
          details: teamEntry,
        }
      }
    }

    if (startedTransaction) {
      await session.commitTransaction()
    }

    return {
      isInMatchmaking: false,
    }
  } catch (error) {
    console.error(`Error checking if user ${userId} is in matchmaking:`, error)
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
 * @param {string} params.userId - User ID or Session Player ID
 * @returns {Promise<Object>} Matchmaking entry
 */
const joinGlobalMatchmaking = async ({ userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      console.log(`User/SessionPlayer ${userId} joining global matchmaking queue`)

      // First check if user is already in any matchmaking
      const matchmakingStatus = await checkUserInMatchmaking({
        userId,
        session,
      })

      if (matchmakingStatus.isInMatchmaking) {
        if (matchmakingStatus.type === 'global') {
          throw new Error('You are already in matchmaking queue')
        } else {
          // User is in team matchmaking
          throw new Error('You are already in team matchmaking.')
        }
      }

      // Check if user exists (try User first, then PlaySession for session players)
      let player = await User.findById(userId).session(session)
      let isSessionPlayer = false
      let trophies = 1000

      if (!player) {
        // Try to find as session player
        player = await PlaySession.findById(userId).session(session)
        if (!player) {
          throw new Error('User not found')
        }
        isSessionPlayer = true
        trophies = player.trophies || 1000
      } else {
        trophies = player.quickClashTrophies || 1000
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
        matchmakingEntry.trophies = trophies
        matchmakingEntry.isSessionPlayer = isSessionPlayer

        await matchmakingEntry.save({ session })
      } else {
        // Create new entry
        matchmakingEntry = new QuickClashGlobalMatchmaking({
          user: userId,
          trophies: trophies,
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
          isSessionPlayer: isSessionPlayer,
        })

        await matchmakingEntry.save({ session })
      }

      // Add to pending solo players state
      teamFormationState.pendingSoloPlayers.add(userId.toString())

      // NOTE: Removed immediate processGlobalMatchmakingWithRetry() call
      // to reduce concurrent transaction conflicts. Let the periodic
      // processing (cron job) handle matchmaking instead.
      // This significantly reduces WriteConflict errors.

      return matchmakingEntry
    })
  } finally {
    session.endSession()
  }
}

// ADD: Create retryable version of performMatchmaking
const performMatchmakingWithRetry = makeRetryable(
  async providedSession => {
    return await performMatchmaking(providedSession)
  },
  {
    maxRetries: 3,
    operationName: 'PerformMatchmaking',
    initialDelay: 500,
    maxDelay: 2000,
    onRetry: (error, attempt) => {
      console.log(
        `[MATCHMAKING] Retry attempt ${attempt}/3 for matchmaking after error: ${error.message}`,
      )
    },
    onAllRetriesFailed: async (error, params) => {
      console.error(
        `[MATCHMAKING] All retries failed for matchmaking operation`,
      )

      // Clean up any partial state if needed
      try {
        // Reset processing flag to allow future attempts
        teamFormationState.isCurrentlyProcessing = false
      } catch (cleanupError) {
        console.error(`[MATCHMAKING] Error during cleanup:`, cleanupError)
      }

      // Create a more user-friendly error message
      const finalError = new Error(
        'Matchmaking is temporarily busy. Please try again in a moment.',
      )
      finalError.isRetryExhausted = true
      finalError.originalError = error
      throw finalError
    },
    // Custom retry condition - only retry on write conflicts and network issues
    isRetryable: error => {
      // Retry on write conflicts
      if (error.codeName === 'WriteConflict') return true
      if (error.message.includes('Write conflict')) return true

      // Retry on transient transaction errors
      if (error.errorLabels?.includes('TransientTransactionError')) return true

      // Retry on network errors
      if (error.name === 'MongoNetworkError') return true
      if (error.name === 'MongoTimeoutError') return true

      // Don't retry on validation errors
      if (error.message.includes('not found')) return false
      if (error.message.includes('already in matchmaking')) return false

      return false
    },
  },
)

// ADD: Create retryable version of processGlobalMatchmaking
const processGlobalMatchmakingWithRetry = makeRetryable(
  async () => {
    return await processGlobalMatchmaking()
  },
  {
    maxRetries: 3,
    operationName: 'ProcessGlobalMatchmaking',
    initialDelay: 500,
    maxDelay: 2000,
    onRetry: (error, attempt) => {
      console.log(
        `[GLOBAL_MATCHMAKING] Retry attempt ${attempt}/3 after error: ${error.message}`,
      )
    },
    onAllRetriesFailed: async (error, params) => {
      console.error(
        `[GLOBAL_MATCHMAKING] All retries failed for global matchmaking`,
      )

      // Reset processing flag
      teamFormationState.isCurrentlyProcessing = false

      const finalError = new Error(
        'Matchmaking is temporarily busy. Please try again in a moment.',
      )
      finalError.isRetryExhausted = true
      finalError.originalError = error
      throw finalError
    },
    isRetryable: error => {
      // Same retry logic as performMatchmaking
      if (error.codeName === 'WriteConflict') return true
      if (error.message.includes('Write conflict')) return true
      if (error.errorLabels?.includes('TransientTransactionError')) return true
      if (error.name === 'MongoNetworkError') return true
      if (error.name === 'MongoTimeoutError') return true

      return false
    },
  },
)

// CONTINUE WITH REST OF THE EXISTING FUNCTIONS...
// [Rest of the existing code remains the same - leaveTeamMatchmaking, leaveGlobalMatchmaking, etc.]

/**
 * Leave team matchmaking queue
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} [params.userId] - User ID who initiated leaving (for notifications)
 * @returns {Promise<boolean>} Success status
 */
const leaveTeamMatchmaking = async ({ teamId, userId = null }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      console.log(
        `Team ${teamId} leaving matchmaking queue${
          userId ? ` initiated by user ${userId}` : ''
        }`,
      )

      // Get the team first to check if it exists and its properties
      const team = await QuickClashTeam.findById(teamId).session(session)

      // If team doesn't exist, we need to clean up any orphaned matchmaking entries
      if (!team) {
        console.log(
          `Team ${teamId} doesn't exist, cleaning up orphaned matchmaking entries`,
        )

        // Remove any orphaned team matchmaking entry
        const teamMatchEntry = await QuickClashTeamMatchmaking.findOneAndDelete(
          {
            team: teamId,
          },
        ).session(session)

        if (teamMatchEntry) {
          console.log(
            `Removed orphaned team matchmaking entry for team ${teamId}`,
          )
          cleanupTeamState(teamId)
        }

        // If userId is provided, also check and clean up that user's entries
        if (userId) {
          console.log(`Cleaning up matchmaking entries for user ${userId}`)

          // Check if user is in global matchmaking
          const globalEntry =
            await QuickClashGlobalMatchmaking.findOneAndDelete({
              user: userId,
            }).session(session)

          if (globalEntry) {
            console.log(`Removed global matchmaking entry for user ${userId}`)
            cleanupPlayerState(userId)

            // Emit event for user leaving global matchmaking
            globalEmitter.emit('quickClash:userLeftMatchmaking', {
              userId,
            })
          }

          // Check if user/session player is part of any other team matchmaking
          const userTeams = await QuickClashTeam.find({
            $or: [
              { 'members.user': userId },
              { 'members.sessionPlayer': userId }
            ]
          }).session(session)

          if (userTeams.length > 0) {
            const teamIds = userTeams.map(team => team._id)

            // Check if any of these teams are in matchmaking
            const teamEntries = await QuickClashTeamMatchmaking.find({
              team: { $in: teamIds },
            }).session(session)

            for (const entry of teamEntries) {
              console.log(
                `Found user ${userId} in team matchmaking for team ${entry.team}`,
              )

              // If this is an auto-formed team, use the cleanup function
              const teamInEntry = userTeams.find(
                t => t._id.toString() === entry.team.toString(),
              )
              if (
                teamInEntry &&
                teamInEntry.formationInfo &&
                teamInEntry.formationInfo.isAutoFormed
              ) {
                console.log(
                  `Team ${entry.team} is auto-formed, using cleanup function`,
                )
                await cleanupAutoFormedTeam({
                  teamId: entry.team,
                  session,
                  initiatorUserId: userId,
                })
              } else {
                // For regular teams, remove the matchmaking entry
                await QuickClashTeamMatchmaking.findOneAndDelete({
                  team: entry.team,
                }).session(session)

                cleanupTeamState(entry.team)

                // Notify other team members
                if (teamInEntry) {
                  for (const member of teamInEntry.members) {
                    const memberId = getMemberId(member)
                    if (memberId && memberId !== userId.toString()) {
                      globalEmitter.emit('quickClash:teamLeftMatchmaking', {
                        userId: memberId,
                        teamId: entry.team.toString(),
                        teamName: teamInEntry.name,
                        reason: 'memberLeft',
                        memberName: 'A team member',
                      })
                    }
                  }
                }
              }
            }
          }
        }

        return true
      }

      // Team exists - continue with existing logic
      if (team.formationInfo && team.formationInfo.isAutoFormed) {
        console.log(`Team ${teamId} is auto-formed, using cleanup function`)

        // Use our dedicated cleanup function for auto-formed teams
        await cleanupAutoFormedTeam({
          teamId: team._id,
          session,
          initiatorUserId: userId, // Pass the initiator user ID for better notifications
        })

        return true
      }

      // Standard process for regular teams
      const entry = await QuickClashTeamMatchmaking.findOne({
        team: teamId,
      }).session(session)

      // If the entry is 'processed', we should remove it too
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

            // Use our dedicated cleanup function with initiator info
            await cleanupAutoFormedTeam({
              teamId: autoTeam._id,
              session,
              initiatorUserId: userId,
            })
          }
        }

        // If entry was available, send notifications to all team members
        if (entry.status === 'available') {
          // Get team members for notifications
          if (team) {
            // Get initiator name if available
            let initiatorName = 'A team member'
            if (userId) {
              // Find initiator - handle both user and session player members
              const initiatorMember = team.members.find(member => {
                const memberId = member.user?._id?.toString() || member.user?.toString() ||
                                member.sessionPlayer?._id?.toString() || member.sessionPlayer?.toString()
                return memberId === userId.toString()
              })

              if (initiatorMember) {
                if (initiatorMember.user) {
                  // Try to get user's name
                  const initiator = await User.findById(userId)
                    .select('name inGameName')
                    .session(session)

                  if (initiator) {
                    initiatorName =
                      initiator.name || initiator.inGameName || 'A team member'
                  }
                } else if (initiatorMember.sessionPlayer) {
                  // Session player - try to get their name
                  const sessionPlayer = await PlaySession.findById(userId)
                    .select('inGameName')
                    .session(session)
                  if (sessionPlayer) {
                    initiatorName = sessionPlayer.inGameName || 'A player'
                  }
                }
              }
            }

            // Notify all other team members that someone left matchmaking
            for (const member of team.members) {
              // Get member ID safely
              const memberId = member.user?._id?.toString() || member.user?.toString() ||
                              member.sessionPlayer?._id?.toString() || member.sessionPlayer?.toString()

              // Only notify if it's not the initiator and member has an ID
              if (userId && memberId && memberId !== userId.toString()) {
                globalEmitter.emit('quickClash:teamLeftMatchmaking', {
                  userId: member.user || member.sessionPlayer,
                  teamId: teamId.toString(),
                  teamName: team?.name,
                  reason: 'memberLeft',
                  memberName: initiatorName,
                  isSessionPlayer: !!member.sessionPlayer,
                })
              }
            }
          }
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

      // Clean up player state immediately
      cleanupPlayerState(userId)

      // Find the player's matchmaking entry
      const playerEntry = await QuickClashGlobalMatchmaking.findOne({
        user: userId,
      }).session(session)

      if (!playerEntry) {
        return false // Not in matchmaking
      }

      // Find if the user is part of any auto-formed team
      let userSourceTeamId = null

      // Check if player is part of an auto-formed team
      if (playerEntry.team && playerEntry.status === 'matched') {
        console.log(
          `Player ${userId} is part of team ${playerEntry.team}, checking if auto-formed`,
        )

        // Get the team
        const team = await QuickClashTeam.findById(playerEntry.team).session(
          session,
        )

        // Check if this is an auto-formed team
        if (team && team.formationInfo && team.formationInfo.isAutoFormed) {
          console.log(`Team ${team._id} is auto-formed, using cleanup function`)

          // Check if the user is from a source team
          const memberFromSourceTeam = team.members.find(member => {
            const memberId = getMemberId(member)
            return memberId === userId.toString() && member.sourceTeam
          })

          if (memberFromSourceTeam && memberFromSourceTeam.sourceTeam) {
            userSourceTeamId = memberFromSourceTeam.sourceTeam
            console.log(
              `User ${userId} came from source team ${userSourceTeamId}`,
            )
          }

          // Use our dedicated cleanup function
          await cleanupAutoFormedTeam({
            teamId: team._id,
            session,
          })
        }
        // For regular teams that aren't auto-formed
        else if (team && !team?.formationInfo?.isAutoFormed) {
          console.log(
            `Team ${team._id} is not auto-formed but temporary, dissolving it`,
          )

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
          }

          // Remove the team from team matchmaking if it's there
          await QuickClashTeamMatchmaking.findOneAndDelete({
            team: team._id,
          }).session(session)

          // Delete the team
          await QuickClashTeam.findByIdAndDelete(team._id).session(session)

          console.log(`Team ${team._id} dissolved successfully`)
        }
      }

      // If user was from a source team, explicitly remove that team from matchmaking
      if (userSourceTeamId) {
        console.log(
          `Explicitly removing source team ${userSourceTeamId} from matchmaking`,
        )

        // Delete the source team from matchmaking regardless of its status
        const deleteResult = await QuickClashTeamMatchmaking.findOneAndDelete({
          team: userSourceTeamId,
        }).session(session)

        if (deleteResult) {
          console.log(
            `Successfully removed source team ${userSourceTeamId} from matchmaking`,
          )

          // Clean up team state
          cleanupTeamState(userSourceTeamId)

          // Emit event for team leaving matchmaking
          globalEmitter.emit('quickClash:teamLeftMatchmaking', {
            teamId: userSourceTeamId.toString(),
            teamName: deleteResult?.team?.name,
            reason: 'member_left_autoformed',
            timestamp: new Date(),
          })
        } else {
          console.log(
            `Source team ${userSourceTeamId} was not found in matchmaking`,
          )
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

    const isBattleReady =
      matchmaking &&
      (matchmaking.status === 'battleReady' ||
        matchmaking.status === 'matched' ||
        matchmaking.status === 'creating_battle')

    return {
      inMatchmaking: !!matchmaking && !isBattleReady,
      status: matchmaking ? matchmaking.status : null,
      matchmaking,
    }
  } catch (error) {
    console.error('Error getting team matchmaking status:', error)
    throw error
  }
}

/**
 * Get global matchmaking status for a user (includes team matchmaking check)
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Matchmaking status
 */
const getGlobalMatchmakingStatus = async ({ userId }) => {
  try {
    // First check for direct global matchmaking entry
    const globalMatchmaking = await QuickClashGlobalMatchmaking.findOne({
      user: userId,
      status: { $ne: 'in_battle' }, // Exclude users already in battle
    })

    if (globalMatchmaking) {
      const isBattleReady =
        globalMatchmaking.status === 'battleReady' ||
        globalMatchmaking.status === 'matched' ||
        globalMatchmaking.status === 'creating_battle'

      return {
        inMatchmaking: !isBattleReady,
        status: globalMatchmaking.status,
        matchmaking: globalMatchmaking,
        type: 'global',
      }
    }

    // If not in global matchmaking, check if user is part of any team in matchmaking
    const userTeams = await QuickClashTeam.find({
      'members.user': userId,
    }).select('_id name members formationInfo')

    if (userTeams.length > 0) {
      const teamIds = userTeams.map(team => team._id)

      // Check if any of these teams are in matchmaking (exclude 'processed' teams)
      const teamMatchmaking = await QuickClashTeamMatchmaking.findOne({
        team: { $in: teamIds },
        status: { $in: ['available', 'matching'] }, // Only active matchmaking
      }).populate('team', '_id name members formationInfo')

      if (teamMatchmaking) {
        // Found team in matchmaking
        const team = teamMatchmaking.team

        // Determine join type and step based on team info
        let joinType = 'regular'
        let step = 'searching'
        let originalTeam = null

        // Check if this is an auto-formed team
        if (team.formationInfo && team.formationInfo.isAutoFormed) {
          // Check if user was originally a solo player
          if (
            team.formationInfo.soloPlayers &&
            team.formationInfo.soloPlayers.some(
              playerId => playerId.toString() === userId.toString(),
            )
          ) {
            joinType = 'solo'
          }
          // Check if user was from a source team
          else {
            const userMember = team.members.find(member => {
              const memberId = getMemberId(member)
              return memberId === userId.toString()
            })

            if (userMember && userMember.sourceTeam) {
              joinType = 'sourceTeam'

              // Find original team info if available
              if (team.formationInfo.sourceTeams) {
                const sourceTeamId = userMember.sourceTeam.toString()
                const sourceTeam = await QuickClashTeam.findById(
                  sourceTeamId,
                ).select('_id name')

                if (sourceTeam) {
                  originalTeam = {
                    _id: sourceTeam._id,
                    name: sourceTeam.name,
                  }
                }
              }
            }
          }
        }

        // Determine step based on team status
        if (teamMatchmaking.status === 'matching') {
          step = 'creating_battle'
        } else if (team.members.length < 4) {
          step = 'forming_team'
        } else {
          step = 'searching'
        }

        const isBattleReady =
          teamMatchmaking.status === 'battleReady' ||
          teamMatchmaking.status === 'matched' ||
          teamMatchmaking.status === 'creating_battle'

        return {
          inMatchmaking: !isBattleReady,
          status: teamMatchmaking.status,
          matchmaking: {
            team: team._id,
            teamName: team.name,
            joinType: joinType,
            originalTeam: originalTeam,
            step: step,
            avgTrophies: teamMatchmaking.avgTrophies,
            memberCount: teamMatchmaking.memberCount,
            createdAt: teamMatchmaking.createdAt,
          },
          type: 'team',
        }
      }
    }

    // Not in any matchmaking
    return {
      inMatchmaking: false,
      status: null,
      matchmaking: null,
      type: null,
    }
  } catch (error) {
    console.error('Error getting global matchmaking status:', error)
    throw error
  }
}

// Debounce function to prevent excessive processing
const DEBOUNCE_INTERVAL = 8000 // 8 seconds (increased to reduce contention with async triggers)

/**
 * Process the global matchmaking queue to form teams and create battles
 * @returns {Promise<void>}
 */
const processGlobalMatchmaking = async () => {
  const now = Date.now()

  // Safety check: Force release mutex if it's been locked too long (stuck lock)
  const lockAge = matchmakingMutex.getLockAge()
  if (lockAge && lockAge > 60000) {
    console.warn(
      `[MATCHMAKING] Mutex locked for ${Math.round(lockAge / 1000)}s with queue ${matchmakingMutex.queueLength()}. Force releasing!`,
    )
    matchmakingMutex.forceRelease()
  }

  // Safety check: Reset stuck processing flag if it's been too long
  if (
    teamFormationState.isCurrentlyProcessing &&
    teamFormationState.lastProcessingStartTime > 0 &&
    now - teamFormationState.lastProcessingStartTime > MAX_PROCESSING_TIME
  ) {
    console.warn(
      `[MATCHMAKING] Detected stuck processing state (started ${Math.round((now - teamFormationState.lastProcessingStartTime) / 1000)}s ago). Force resetting.`,
    )
    teamFormationState.isCurrentlyProcessing = false
    teamFormationState.lastProcessingStartTime = 0
  }

  // Early debounce check before acquiring mutex (reduces lock contention)
  if (now - teamFormationState.lastProcessingTime < DEBOUNCE_INTERVAL) {
    // Only log occasionally to reduce noise
    return
  }

  // Check mutex state for debugging (only if locked or has queue)
  if (matchmakingMutex.isLocked() || matchmakingMutex.queueLength() > 0) {
    console.log(
      `[MATCHMAKING] Mutex status - locked: ${matchmakingMutex.isLocked()}, queue: ${matchmakingMutex.queueLength()}, age: ${matchmakingMutex.getLockAge()}ms`,
    )
  }

  try {
    // Use mutex to ensure only one matchmaking process runs at a time
    // This prevents WriteConflict errors from concurrent transactions
    // The mutex now has a 30s timeout to prevent permanent deadlocks
    await matchmakingMutex.withLock(async () => {
      // Re-check timing after acquiring lock (another process may have just finished)
      const currentTime = Date.now()
      if (
        teamFormationState.isCurrentlyProcessing ||
        currentTime - teamFormationState.lastProcessingTime < DEBOUNCE_INTERVAL
      ) {
        console.log(
          'Matchmaking processing already completed by another process. Skipping.',
        )
        return
      }

      try {
        // Mark as processing and update timestamps
        teamFormationState.isCurrentlyProcessing = true
        teamFormationState.lastProcessingTime = currentTime
        teamFormationState.lastProcessingStartTime = currentTime

        console.log('[MATCHMAKING] Starting matchmaking processing with mutex lock')
        await performMatchmaking()
        console.log('[MATCHMAKING] Completed matchmaking processing')
      } catch (error) {
        console.error('Error processing global matchmaking:', error)
      } finally {
        // Always release the processing lock and reset start time
        teamFormationState.isCurrentlyProcessing = false
        teamFormationState.lastProcessingStartTime = 0
      }
    }, 30000) // 30 second timeout
  } catch (error) {
    // Handle mutex timeout errors gracefully
    if (error.message && error.message.includes('timed out')) {
      console.error('[MATCHMAKING] Mutex acquisition timed out - will retry on next cycle')
    } else {
      console.error('[MATCHMAKING] Error in processGlobalMatchmaking:', error)
    }
  }
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
 * Clean up auto-formed teams and their associated matchmaking entries
 * @param {Object} params - Parameters
 * @param {string} params.teamId - ID of the auto-formed team
 * @param {mongoose.ClientSession} params.session - Database session
 * @param {string} [params.initiatorUserId] - ID of the user who initiated the leave action
 * @returns {Promise<void>}
 */
const cleanupAutoFormedTeam = async ({
  teamId,
  session,
  initiatorUserId = null,
}) => {
  // Get the auto-formed team
  const team = await QuickClashTeam.findById(teamId)
    .populate('members.user', '_id name inGameName')
    .populate('members.sessionPlayer', '_id inGameName trophies')
    .session(session)

  if (!team || !team.formationInfo || !team.formationInfo.isAutoFormed) {
    console.log(`Team ${teamId} is not an auto-formed team or doesn't exist.`)
    return
  }

  console.log(`Cleaning up auto-formed team ${teamId}`)

  // 1. Remove from matchmaking queue
  await QuickClashTeamMatchmaking.findOneAndDelete({
    team: teamId,
  }).session(session)

  // Clean up team state
  cleanupTeamState(teamId)

  // Find the initiator's source team if they have one
  let initiatorSourceTeamId = null
  let initiatorName = 'A team member'

  if (initiatorUserId) {
    const initiatorMember = team.members.find(member => {
      const memberId = getMemberId(member)
      return memberId && memberId.toString() === initiatorUserId.toString()
    })

    if (initiatorMember) {
      initiatorSourceTeamId = initiatorMember.sourceTeam
      initiatorName =
        initiatorMember.user?.name ||
        initiatorMember.user?.inGameName ||
        initiatorMember.sessionPlayer?.inGameName ||
        'A team member'
    }
  }

  // Collect members by type for better notification handling
  const soloMembers = []
  const sourceTeamMembers = new Map() // Map of sourceTeam -> members

  // 2. Reset all members to available or delete their entries
  for (const member of team.members) {
    const memberId = getMemberId(member)
    if (!memberId) continue

    const memberIdStr = memberId.toString()

    // Get the user's matchmaking entry
    const entry = await QuickClashGlobalMatchmaking.findOne({
      user: memberId,
    }).session(session)

    if (entry) {
      // If this user came from another team
      if (member.sourceTeam) {
        const sourceTeamId = member.sourceTeam.toString()

        console.log(
          `Processing matchmaking entry for ${memberIdStr} from source team ${sourceTeamId}`,
        )

        // Track this member for source team notifications
        if (!sourceTeamMembers.has(sourceTeamId)) {
          sourceTeamMembers.set(sourceTeamId, [])
        }
        sourceTeamMembers.get(sourceTeamId).push({
          userId: memberIdStr,
          name: member.user.name || member.user.inGameName,
          isInitiator:
            initiatorUserId && memberIdStr === initiatorUserId.toString(),
        })

        // Delete the matchmaking entry in any case
        await QuickClashGlobalMatchmaking.findOneAndDelete({
          user: memberId,
        }).session(session)
      }
      // If they were a solo player, reset them to available
      else {
        console.log(`Resetting solo player ${memberIdStr} to available`)
        entry.status = 'available'
        entry.team = null
        await entry.save({ session })

        // Add back to pending solo players state
        teamFormationState.pendingSoloPlayers.add(memberIdStr)

        // Add to solo members list for notifications
        soloMembers.push({
          userId: memberIdStr,
          name: member.user.name || member.user.inGameName,
          isInitiator:
            initiatorUserId && memberIdStr === initiatorUserId.toString(),
        })
      }
    }

    // Clean up player state
    cleanupPlayerState(memberId)
  }

  const teamMemberIds = team.members.map(member => getMemberId(member)).filter(id => id !== null)

  // 3. Process source teams
  if (
    team.formationInfo.sourceTeams &&
    team.formationInfo.sourceTeams.length > 0
  ) {
    for (const sourceTeamId of team.formationInfo.sourceTeams) {
      const sourceTeamIdStr = sourceTeamId.toString()
      console.log(`Processing source team ${sourceTeamIdStr}`)

      // If this is the initiator's source team, completely remove it from matchmaking
      if (
        initiatorSourceTeamId &&
        sourceTeamIdStr === initiatorSourceTeamId.toString()
      ) {
        console.log(
          `Removing initiator's source team ${sourceTeamIdStr} from matchmaking`,
        )

        // Delete the team from matchmaking
        await QuickClashTeamMatchmaking.findOneAndDelete({
          team: sourceTeamId,
        }).session(session)

        // Notify all members of this source team
        const sourceTeam = await QuickClashTeam.findById(sourceTeamId)
          .populate('members.user', '_id name inGameName')
          .populate('members.sessionPlayer', '_id inGameName trophies')
          .session(session)

        if (sourceTeam) {
          console.log(sourceTeam)
          for (const srcMember of sourceTeam.members) {
            const srcUserId =
              (srcMember.user && (srcMember.user._id || srcMember.user)) ||
              (srcMember.sessionPlayer &&
                (srcMember.sessionPlayer._id || srcMember.sessionPlayer))

            if (srcUserId.toString() !== initiatorUserId) {
              globalEmitter.emit('quickClash:teamLeftMatchmaking', {
                userId: srcUserId.toString(),
                teamId: sourceTeamIdStr,
                teamName: sourceTeam?.name,
                reason: 'memberLeft',
                memberName: initiatorName,
              })
            }
          }
        }
      }
      // For other source teams, reset them to available
      else {
        const sourceTeamEntry = await QuickClashTeamMatchmaking.findOne({
          team: sourceTeamId,
          status: 'processed', // Only reset if still marked as processed
        }).session(session)

        if (sourceTeamEntry) {
          sourceTeamEntry.status = 'available'
          await sourceTeamEntry.save({ session })

          // Re-add to pending partial teams state
          teamFormationState.pendingPartialTeams.add(sourceTeamIdStr)

          // Get member count for cache
          const sourceTeam = await QuickClashTeam.findById(sourceTeamId)
            .select('members')
            .session(session)

          if (sourceTeam) {
            teamFormationState.formingTeamCache.set(
              sourceTeamIdStr,
              sourceTeam.members.length,
            )
          }

          // Emit event for this team returning to matchmaking
          globalEmitter.emit('quickClash:teamReturnedToMatchmaking', {
            teamId: sourceTeamIdStr,
            reason: 'autoTeamDissolved',
            timestamp: new Date(),
          })
        }
      }
    }
  }

  // 4. Delete the auto-formed team itself
  await QuickClashTeam.findByIdAndDelete(teamId).session(session)

  console.log(
    `Auto-formed team ${teamId} and related entries cleaned up successfully`,
  )
}

/**
 * Main matchmaking logic - extracted to separate function for clarity
 * @param {Object} options
 * @param {mongoose.ClientSession} [options.providedSession] - Optional mongoose session
 * @returns {Promise<void>}
 */
const performMatchmaking = async providedSession => {
  // If a session is provided, use it directly (already in a transaction)
  if (providedSession) {
    return await performMatchmakingLogic(providedSession)
  }

  // Otherwise, create a new session and use withTransaction for auto-retry
  const session = await mongoose.startSession()
  try {
    // withTransaction automatically retries on TransientTransactionError (WriteConflict)
    await session.withTransaction(async () => {
      await performMatchmakingLogic(session)
    }, {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      maxCommitTimeMS: 30000,
    })
  } finally {
    session.endSession()
  }
}

/**
 * Internal matchmaking logic - separated for use with withTransaction
 * @param {mongoose.ClientSession} session - Mongoose session (required)
 */
const performMatchmakingLogic = async session => {
  try {
    console.log('Processing global matchmaking queue')

    // Get all available solo players in matchmaking
    const soloPlayersAvailable = await QuickClashGlobalMatchmaking.find({
      status: { $in: ['available', 'processing'] }, // Include processing players that weren't matched
      team: null,
    })
      .sort({ createdAt: 1 })
      .session(session)

    console.log(`Found ${soloPlayersAvailable.length} available solo players`)

    // Mark all available players as processing
    for (const player of soloPlayersAvailable) {
      player.status = 'processing'
      await player.save({ session })
      const playerId = getPlayerIdFromMatchmaking(player)
      if (playerId) {
        teamFormationState.pendingSoloPlayers.add(playerId)
      }
    }

    // Manual population of user/sessionPlayer data
    // This is necessary because 'user' field can contain IDs from either User or PlaySession collection
    // but the schema ref is strictly set to 'USER', causing populate() to fail for session players
    const userIdsToCheck = []

    // Collect all IDs
    for (const player of soloPlayersAvailable) {
      if (player.user) userIdsToCheck.push(player.user)
    }

    if (userIdsToCheck.length > 0) {
      // 1. Fetch from User collection
      const users = await User.find({
        _id: { $in: userIdsToCheck }
      })
      .select('_id name inGameName quickClashTrophies')
      .session(session)

      const userMap = new Map(users.map(u => [u._id.toString(), u]))

      // 2. Identify missing IDs (Session Players)
      const missingIds = userIdsToCheck.filter(id => !userMap.has(id.toString()))

      let sessionMap = new Map()
      if (missingIds.length > 0) {
        // Fetch from PlaySession collection
        const sessionPlayers = await PlaySession.find({
          _id: { $in: missingIds }
        })
        .select('_id inGameName trophies')
        .session(session)

        sessionMap = new Map(sessionPlayers.map(s => [s._id.toString(), s]))
      }

      // 3. Attach populated data to player objects
      for (const player of soloPlayersAvailable) {
        if (!player.user) continue

        const idStr = player.user.toString()
        if (userMap.has(idStr)) {
          player.populatedUser = userMap.get(idStr)
        } else if (sessionMap.has(idStr)) {
          const sp = sessionMap.get(idStr)
          // Normalize session player to look like user for downstream compatibility
          player.populatedUser = {
            _id: sp._id,
            name: sp.inGameName || 'Session Player',
            inGameName: sp.inGameName,
            quickClashTrophies: sp.trophies || 1000,
            isSessionPlayer: true
          }
        }
      }
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
      .populate('members.sessionPlayer', '_id inGameName trophies')
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
        const memberId = getMemberId(member)
        if (memberId) {
          usedPlayerIds.add(memberId)
        }
      })

      // Create a new team with these members as the base
      let newMembers = team.members.map(member => {
        // Extract only the data we need from the Mongoose document
        return {
          user: member.user || null, // Keep the user reference if present
          sessionPlayer: member.sessionPlayer || null, // Keep sessionPlayer reference if present
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
          const hasDuplicates = otherTeam.members.some(m => {
            const mId = getMemberId(m)
            return mId && usedPlayerIds.has(mId)
          })

          if (!hasDuplicates) {
            // We can merge these teams perfectly
            otherTeam.members.forEach(member => {
              newMembers.push({
                user: member.user || null,
                sessionPlayer: member.sessionPlayer || null,
                role: member.role || 'member',
                status: member.status || 'ready',
                joinedAt: member.joinedAt || new Date(),
                selectedCategory: member.selectedCategory || null,
                sourceTeam: otherTeam._id, // Track original team for each member
              })

              const memberId = getMemberId(member)
              if (memberId) {
                usedPlayerIds.add(memberId)
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
          const hasDuplicates = otherTeam.members.some(m => {
            const mId = getMemberId(m)
            return mId && usedPlayerIds.has(mId)
          })

          if (!hasDuplicates) {
            // Add these members
            otherTeam.members.forEach(member => {
              newMembers.push({
                user: member.user || null,
                sessionPlayer: member.sessionPlayer || null,
                role: member.role || 'member',
                status: member.status || 'ready',
                joinedAt: member.joinedAt || new Date(),
                selectedCategory: member.selectedCategory || null,
                sourceTeam: otherTeam._id, // Track original team for each member
              })

              const memberId = getMemberId(member)
              if (memberId) {
                usedPlayerIds.add(memberId)
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
          const playerId = getPlayerIdFromMatchmaking(player)
          if (!playerId || assignedPlayerIds.has(playerId)) continue

          newMembers.push({
            user: playerId, // Use extracted ID instead of player.user._id
            role: 'member',
            status: 'ready',
            sourceTeam: null, // No source team for solo players
          })

          // Track this solo player for origin info
          soloPlayers.push(playerId)

          // Track for potential rollback
          tentativePlayerIds.push(playerId)
          tentativePlayers.push(player)

          // Temporarily mark as assigned but don't update status yet
          assignedPlayerIds.add(playerId)
          // Remove from pending solo players temporarily
          teamFormationState.pendingSoloPlayers.delete(playerId)

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
        // Create the new team
        const creatorId = getMemberId(newMembers[0])
        const newTeam = new QuickClashTeam({
          name: '', // Will be set later
          creator: creatorId,
          teamType: 'auto', // Mark as auto-formed team
          members: newMembers
            .map((member, idx) => {
              // Handle both user and sessionPlayer members
              const memberId = getMemberId(member)
              if (!memberId) return null

              // Build member object with appropriate reference
              const memberObj = {
                role: idx === 0 ? 'leader' : 'member',
                status: 'ready',
                sourceTeam: member.sourceTeam,
              }

              // Set either user or sessionPlayer based on what's present
              if (member.user) {
                memberObj.user = member.user._id || member.user
              } else if (member.sessionPlayer) {
                memberObj.sessionPlayer = member.sessionPlayer._id || member.sessionPlayer
              }

              return memberObj
            })
            .filter(m => m !== null && (m.user || m.sessionPlayer)),
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
        processedTeamIds.add(team._id.toString()) // FIXED: Using processedTeamIds instead of processedTeams
        teamFormationState.pendingPartialTeams.delete(team._id.toString())
        teamFormationState.formingTeamCache.delete(team._id.toString())

        // Log formation info
        console.log(
          `Created auto-formed team ${newTeam._id} from ${sourceTeams.length} source teams and ${soloPlayers.length} solo players`,
        )

        // Mark all used teams as 'processed' in the matchmaking entry
        // AND REMOVE ALL INDIVIDUAL PLAYER ENTRIES
        for (const usedTeamId of usedTeamIds) {
          // Update the team status to processed
          const teamEntry = await QuickClashTeamMatchmaking.findOne({
            team: usedTeamId,
          }).session(session)

          if (teamEntry) {
            teamEntry.status = 'processed'
            await teamEntry.save({ session })

            // Get all members of this team and clean up their individual entries
            const sourceTeam = await QuickClashTeam.findById(usedTeamId)
              .select('members')
              .session(session)

            if (sourceTeam && sourceTeam.members) {
              // Remove individual matchmaking entries for all team members
              for (const member of sourceTeam.members) {
                const memberId = getMemberId(member)
                if (!memberId) continue

                // Delete any existing global matchmaking entry for this user
                await QuickClashGlobalMatchmaking.deleteOne({
                  user: memberId,
                }).session(session)

                // Clean up from the tracking state as well
                teamFormationState.pendingSoloPlayers.delete(memberId)
              }
            }

            console.log(
              `Marked team ${usedTeamId} as processed in matchmaking and cleaned up member entries`,
            )
          }
        }

        // Update all players' matchmaking status for the new team
        for (const member of newMembers) {
          const memberId = getMemberId(member)
          if (!memberId) continue

          const memberIdStr = memberId.toString()

          // Make sure they're removed from the pending solo players
          teamFormationState.pendingSoloPlayers.delete(memberIdStr)
          assignedPlayerIds.add(memberIdStr)

          // Update or create a new matchmaking entry for this player in the new team
          const existingEntry = await QuickClashGlobalMatchmaking.findOne({
            user: memberId,
          }).session(session)

          if (existingEntry) {
            // Update existing entry
            existingEntry.status = 'matched'
            existingEntry.team = newTeam._id
            await existingEntry.save({ session })
          } else {
            // Create new entry
            const newEntry = new QuickClashGlobalMatchmaking({
              user: memberId,
              team: newTeam._id,
              status: 'matched',
              expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
            })
            await newEntry.save({ session })
          }
        }
      }
    }

    // Second phase: Create teams from remaining solo players
    const remainingSoloPlayers = soloPlayersAvailable.filter(player => {
      const playerId = getPlayerIdFromMatchmaking(player)
      return playerId && !assignedPlayerIds.has(playerId)
    })

    console.log(
      `Found ${remainingSoloPlayers.length} remaining solo players for team formation`,
    )

    // Process in groups of 4
    for (let i = 0; i < remainingSoloPlayers.length; i += 4) {
      // Make sure we have 4 players for this team
      if (i + 3 < remainingSoloPlayers.length) {
        const teamPlayers = remainingSoloPlayers.slice(i, i + 4)
        const soloPlayerIds = teamPlayers.map(player => getPlayerIdFromMatchmaking(player))

        // Create the new team
        // Create the new team
        const leader = teamPlayers[0].populatedUser

        const newTeam = new QuickClashTeam({
          name: '',
          creator: leader.isSessionPlayer ? null : leader._id,
          teamType: 'auto', // Mark as auto-formed team
          members: [
            {
              user: leader.isSessionPlayer ? null : leader._id,
              sessionPlayer: leader.isSessionPlayer ? leader._id : null,
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
          const otherPlayer = teamPlayers[j].populatedUser

          newTeam.members.push({
            user: otherPlayer.isSessionPlayer ? null : otherPlayer._id,
            sessionPlayer: otherPlayer.isSessionPlayer ? otherPlayer._id : null,
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
          const playerId = getPlayerIdFromMatchmaking(player)
          if (playerId) {
            assignedPlayerIds.add(playerId)
            // Remove from pending solo players
            teamFormationState.pendingSoloPlayers.delete(playerId)
          }
        }
      }
    }

    // Add all complete teams to matchmaking
    console.log(`Adding ${completeTeams.length} complete teams to matchmaking`)
    for (const team of completeTeams) {
      console.log(`Processing auto-formed team ${team._id} for matchmaking`)

      // FIRST: Ensure that ALL individual member matchmaking entries are cleared
      // This must be done BEFORE we try to join the team to matchmaking
      for (const member of team.members) {
        const memberId = getMemberId(member)
        if (!memberId) continue

        const memberIdStr = memberId.toString()

        console.log(
          `Ensuring global matchmaking entry is cleaned up for team member ${memberIdStr}`,
        )

        // Delete any existing global matchmaking entry directly
        await QuickClashGlobalMatchmaking.deleteOne({
          user: memberId,
        }).session(session)

        // Clean up from pending solo players if needed
        teamFormationState.pendingSoloPlayers.delete(memberIdStr)
      }

      // SECOND: Create new matchmaking entries for each member with the new team ID
      for (const member of team.members) {
        const memberId = getMemberId(member)
        if (!memberId) continue

        const memberIdStr = memberId.toString()

        console.log(
          `Creating new matchmaking entry for team member ${memberIdStr} with team ${team._id}`,
        )

        // Create a new entry linking the user to the new team
        const newEntry = new QuickClashGlobalMatchmaking({
          user: memberId,
          team: team._id,
          status: 'matched',
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
        })

        await newEntry.save({ session })
      }
      // THIRD: Now join the team to matchmaking with the isAutoFormed flag
      try {
        console.log(
          `Joining auto-formed team ${team._id} to matchmaking with isAutoFormed flag`,
        )
        await joinTeamMatchmaking({
          teamId: team._id,
          isAutoFormed: true, // Add this flag to skip individual checks
          session,
        })
      } catch (error) {
        console.error(
          `Error joining auto-formed team ${team._id} to matchmaking:`,
          error,
        )

        // If there's an error, we need to clean up this auto-formed team
        console.log(`Cleaning up auto-formed team ${team._id} due to error`)

        // Remove from any existing matchmaking
        await QuickClashTeamMatchmaking.deleteOne({ team: team._id }).session(
          session,
        )

        // Delete all member matchmaking entries
        for (const member of team.members) {
          const memberId = getMemberId(member)
          if (!memberId) continue
          await QuickClashGlobalMatchmaking.deleteOne({ user: memberId }).session(
            session,
          )
        }

        // Delete the team itself
        await QuickClashTeam.findByIdAndDelete(team._id).session(session)

        // Notify solo players or reset original teams
        for (const member of team.members) {
          // If from a source team, don't need to do anything special
          // If solo player, reset their entry to available
          if (!member.sourceTeam) {
            const userId = getMemberId(member)
            if (!userId) continue

            // Create a new entry for this solo player
            const newEntry = new QuickClashGlobalMatchmaking({
              user: userId,
              status: 'available',
              expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
            })

            await newEntry.save({ session })

            // Add back to pending solo players
            teamFormationState.pendingSoloPlayers.add(userId)
          }
        }
      }
    }

    // Process teams in matchmaking to find matches
    await processTeamMatchmaking(session)

    // Reset unassigned players back to 'available' status
    const unassignedPlayers = soloPlayersAvailable.filter(player => {
      const playerId = getPlayerIdFromMatchmaking(player)
      return playerId && !assignedPlayerIds.has(playerId)
    })

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
    // Transaction will be auto-committed by withTransaction
  } catch (error) {
    console.error('Error in matchmaking transaction:', error)
    throw error // Re-throw for withTransaction to handle retry or abort
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

        // Check for duplicate users between teams - this is critical for auto-formed teams
        // Use getMemberId to support both users and session players
        const teamAUserIds = team.members.map(m => getMemberId(m)).filter(Boolean)
        const teamBUserIds = matchedTeam.members.map(m => getMemberId(m)).filter(Boolean)

        // Check for overlap (duplicate users)
        const duplicateUsers = teamAUserIds.filter(id =>
          teamBUserIds.includes(id),
        )

        if (duplicateUsers.length > 0) {
          console.log(
            `Found duplicate users between teams: ${duplicateUsers.join(', ')}`,
          )

          // Skip this match if there are duplicate users
          // But also clean up the situation

          // For auto-formed teams with duplicates, clean them up
          if (team.formationInfo && team.formationInfo.isAutoFormed) {
            console.log(
              `Auto-formed team ${team._id} has duplicate users, cleaning up`,
            )
            await cleanupAutoFormedTeam({ teamId: team._id, session })
          }

          if (
            matchedTeam.formationInfo &&
            matchedTeam.formationInfo.isAutoFormed
          ) {
            console.log(
              `Auto-formed team ${matchedTeam._id} has duplicate users, cleaning up`,
            )
            await cleanupAutoFormedTeam({ teamId: matchedTeam._id, session })
          }

          continue
        }

        // Mark both teams as matching to prevent race conditions
        teamEntry.status = 'matching'
        matchedTeamEntry.status = 'matching'

        await Promise.all([
          teamEntry.save({ session }),
          matchedTeamEntry.save({ session }),
        ])

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

          // Clean up all individual matchmaking entries for both teams
          // Note: Session players don't have entries in QuickClashGlobalMatchmaking
          await Promise.all([
            // Team A members
            ...team.members
              .map(member => {
                const memberId = getMemberId(member)
                if (!memberId) return Promise.resolve()
                return QuickClashGlobalMatchmaking.findOneAndDelete(
                  { user: memberId },
                  { session },
                ).then(() => {
                  // Clean up each player's state
                  cleanupPlayerState(memberId)
                })
              }),
            // Team B members
            ...matchedTeam.members
              .map(member => {
                const memberId = getMemberId(member)
                if (!memberId) return Promise.resolve()
                return QuickClashGlobalMatchmaking.findOneAndDelete(
                  { user: memberId },
                  { session },
                ).then(() => {
                  // Clean up each player's state
                  cleanupPlayerState(memberId)
                })
              }),
          ])

          const teamBattle = await createTeamBattle({
            teamAId: team._id,
            teamBId: matchedTeam._id,
            categories: battleCategories,
            session,
          })

          if (teamBattle) {
            // Progress update - include winProbability for immediate client display
            globalEmitter.emit('quickClash:teamBattleReady', {
              battleId: teamBattle._id.toString(),
              teamA: team._id.toString(),
              teamB: matchedTeam._id.toString(),
              teamAMembers: team.members.map(m => ({
                memberId: getMemberId(m),
                name: m.user?.name || m.user?.inGameName || 'Session Player',
                isSession: !!m.sessionPlayer,
              })),
              teamBMembers: matchedTeam.members.map(m => ({
                memberId: getMemberId(m),
                name: m.user?.name || m.user?.inGameName || 'Session Player',
                isSession: !!m.sessionPlayer,
              })),
              categories: battleCategories,
              winProbability: teamBattle.winProbability || null,
            })

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

      // Auto-select 4 categories for the battle
      const allCategories = getCategories()
      const battleCategories = getRandomCategories(allCategories, 4)

      // Start with initial trophy range and gradually increase it
      let trophyRange = TROPHY_RANGE_INITIAL
      let matchedTeam = null

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

          // Check for duplicate users between teams - use getMemberId for session player support
          const teamAUserIds = team.members.map(m => getMemberId(m)).filter(Boolean)
          const teamBUserIds = matchedTeam.members.map(m => getMemberId(m)).filter(Boolean)

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

      // If we found a match
      if (matchedTeam) {
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

        // Clean up global matchmaking entries (only for users, not session players)
        await Promise.all(
          team.members
            .map(member => {
              const memberId = getMemberId(member)
              if (!memberId) return Promise.resolve()
              return QuickClashGlobalMatchmaking.findOneAndDelete(
                { user: memberId },
                { session },
              ).then(() => {
                // Clean up each player's state
                cleanupPlayerState(memberId)
              })
            }),
        )
        await Promise.all(
          matchedTeam.members
            .map(member => {
              const memberId = getMemberId(member)
              if (!memberId) return Promise.resolve()
              return QuickClashGlobalMatchmaking.findOneAndDelete(
                { user: memberId },
                { session },
              ).then(() => {
                // Clean up each player's state
                cleanupPlayerState(memberId)
              })
            }),
        )

        // Create team battle between the two teams
        const teamBattle = await createTeamBattle({
          teamAId: teamId,
          teamBId: matchedTeam._id,
          categories: battleCategories,
          session,
        })

        if (teamBattle) {
          // Emit detailed battle ready event with all information needed by clients
          globalEmitter.emit('quickClash:teamBattleReady', {
            battleId: teamBattle._id.toString(),
            teamA: teamId.toString(),
            teamB: matchedTeam._id.toString(),
            teamAMembers: team.members.map(m => ({
              memberId: getMemberId(m),
              name: m.user?.name || m.user?.inGameName || 'Session Player',
              isSession: !!m.sessionPlayer,
            })),
            teamBMembers: matchedTeam.members.map(m => ({
              memberId: getMemberId(m),
              name: m.user?.name || m.user?.inGameName || 'Session Player',
              isSession: !!m.sessionPlayer,
            })),
            categories: battleCategories,
            winProbability: teamBattle.winProbability || null,
          })

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
  checkUserInMatchmaking,
}
