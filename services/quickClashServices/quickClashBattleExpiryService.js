// services/quickClashServices/quickClashBattleExpiryService.js
const mongoose = require('mongoose')
const QuickClashBattleExpiryEvent = require('../../model/quickClashSchemas/quickClashBattleExpiryEventSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')

const { makeRetryable } = require('../../utils/retryUtils')
const { calculateFinalTrophies } = require('../../utils/quickClashTeamUtils')
const { updateTeamMatchStatus } = require('./quickClashTeamService')
const { notifyTeamBattleCompleted } = require('./quickClashNotificationService')
const globalEmitter = require('../../eventEmitter')
const { getMemberPlayerId } = require('../../utils/sessionPlayerUtils')

// ============================================================================
// IN-MEMORY TIMER AND LOCK MANAGEMENT
// ============================================================================

// Track battle expiry timers: battleId -> timerId
const battleExpiryTimers = new Map()

// Track battles currently being processed to prevent duplicate processing
const battleProcessingLocks = new Set()

// ============================================================================
// ACTIVE SESSION TRACKING (for deferred completion)
// ============================================================================

// Track active sessions: battleId -> Set<userId>
const battleActiveSessions = new Map()

// Track battles in "ending" state (blocks new sessions)
const battlesEnding = new Set()

// Track deferred battles: battleId -> deferredAt timestamp
const deferredBattles = new Map()

// Max wait time for active sessions (185 seconds)
const MAX_DEFERRAL_TIME = 185 * 1000

/**
 * Register a user as actively playing in a battle
 */
const registerActiveSession = (battleId, userId) => {
  const key = battleId.toString()
  if (!battleActiveSessions.has(key)) {
    battleActiveSessions.set(key, new Set())
  }
  battleActiveSessions.get(key).add(userId.toString())
  console.log(`[BattleExpiry] Registered active session: battle=${key}, user=${userId}`)
}

/**
 * Unregister a user when they complete their session
 */
const unregisterActiveSession = (battleId, userId) => {
  const key = battleId.toString()
  if (battleActiveSessions.has(key)) {
    battleActiveSessions.get(key).delete(userId.toString())
    console.log(`[BattleExpiry] Unregistered active session: battle=${key}, user=${userId}`)
    if (battleActiveSessions.get(key).size === 0) {
      battleActiveSessions.delete(key)
      checkDeferredBattleCompletion(key)
    }
  }
}

/**
 * Check if a battle has any active sessions
 */
const hasActiveSessions = (battleId) => {
  const key = battleId.toString()
  return battleActiveSessions.has(key) && battleActiveSessions.get(key).size > 0
}

/**
 * Mark battle as ending (blocks new sessions)
 */
const markBattleEnding = (battleId) => {
  const key = battleId.toString()
  if (!battlesEnding.has(key)) {
    battlesEnding.add(key)
    console.log(`[BattleExpiry] Battle ${key} marked as ENDING`)
    globalEmitter.emit('quickClash:battleEnding', { battleId: key })
  }
}

/**
 * Check if battle is in ending state
 */
const isBattleEnding = (battleId) => battlesEnding.has(battleId.toString())

/**
 * Clear battle ending state
 */
const clearBattleEnding = (battleId) => battlesEnding.delete(battleId.toString())

/**
 * Defer battle completion due to active sessions
 */
const deferBattleCompletion = (battleId) => {
  const key = battleId.toString()
  if (!deferredBattles.has(key)) {
    deferredBattles.set(key, Date.now())
    console.log(`[BattleExpiry] Battle ${key} DEFERRED - waiting for active sessions`)
  }
}

/**
 * Check if deferred battle should complete (called when session ends)
 */
const checkDeferredBattleCompletion = async (battleId) => {
  const key = battleId.toString()
  const deferredAt = deferredBattles.get(key)
  if (!deferredAt) return

  // Skip if battle is no longer in ending state (completed naturally by updateBattleWithQuizResults)
  if (!battlesEnding.has(key)) {
    console.log(`[BattleExpiry] Deferred battle ${key} already completed naturally, skipping`)
    deferredBattles.delete(key)
    return
  }

  const elapsed = Date.now() - deferredAt
  if (elapsed > MAX_DEFERRAL_TIME) {
    console.log(`[BattleExpiry] Battle ${key} exceeded max wait (${Math.round(elapsed/1000)}s) - forcing completion`)
    battleActiveSessions.delete(key)
  }

  if (!hasActiveSessions(key)) {
    console.log(`[BattleExpiry] Deferred battle ${key} ready to complete`)
    deferredBattles.delete(key)
    if (acquireBattleLock(key)) {
      try {
        await processExpiredBattleById(key)
      } catch (error) {
        console.error(`[BattleExpiry] Deferred completion error:`, error)
      } finally {
        releaseBattleLock(key)
        clearBattleEnding(key)
      }

    }
  }
}


/**
 * Acquire lock for battle processing
 * @param {string} battleId - Battle ID
 * @returns {boolean} True if lock acquired, false if already locked
 */
const acquireBattleLock = (battleId) => {
  const lockKey = battleId.toString()
  if (battleProcessingLocks.has(lockKey)) {
    console.log(`[BattleExpiry] Lock already held for battle ${lockKey}`)
    return false
  }
  battleProcessingLocks.add(lockKey)
  console.log(`[BattleExpiry] Lock acquired for battle ${lockKey}`)
  return true
}

/**
 * Release lock after battle processing
 * @param {string} battleId - Battle ID
 */
const releaseBattleLock = (battleId) => {
  const lockKey = battleId.toString()
  battleProcessingLocks.delete(lockKey)
  console.log(`[BattleExpiry] Lock released for battle ${lockKey}`)
}

/**
 * Check if a battle is currently locked for processing
 * @param {string} battleId - Battle ID
 * @returns {boolean} True if locked
 */
const isBattleLocked = (battleId) => {
  return battleProcessingLocks.has(battleId.toString())
}

/**
 * Schedule a timer for battle completion at exact expiry time
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {Date} params.expiresAt - Exact expiry time
 */
const scheduleBattleCompletion = async ({ battleId, expiresAt }) => {
  const battleIdStr = battleId.toString()

  // Clear any existing timer for this battle
  if (battleExpiryTimers.has(battleIdStr)) {
    clearTimeout(battleExpiryTimers.get(battleIdStr))
  }

  const now = Date.now()
  const delay = new Date(expiresAt).getTime() - now

  if (delay <= 0) {
    // Already expired - process immediately with lock
    if (acquireBattleLock(battleIdStr)) {
      try {
        await processExpiredBattleById(battleIdStr)
      } catch (error) {
        console.error(`[BattleExpiry] Immediate processing error for ${battleIdStr}:`, error)
      } finally {
        releaseBattleLock(battleIdStr)
      }
    }
    return
  }

  // Schedule timer for exact expiry
  const timerId = setTimeout(async () => {
    battleExpiryTimers.delete(battleIdStr)

    // Mark battle as ending FIRST (blocks new sessions from starting)
    markBattleEnding(battleIdStr)

    // Check for active sessions - if any, defer completion
    if (hasActiveSessions(battleIdStr)) {
      console.log(`[BattleExpiry] Battle ${battleIdStr} has active sessions - deferring completion`)
      deferBattleCompletion(battleIdStr)
      return
    }

    // Try to acquire lock
    if (!acquireBattleLock(battleIdStr)) {
      return
    }

    try {
      await processExpiredBattleById(battleIdStr)
    } catch (error) {
      console.error(`[BattleExpiry] Timer error for ${battleIdStr}:`, error)
      // Lock released, cron will catch as fallback
    } finally {
      releaseBattleLock(battleIdStr)
      clearBattleEnding(battleIdStr)
    }
  }, delay)


  battleExpiryTimers.set(battleIdStr, timerId)
  console.log(`[BattleExpiry] Timer scheduled for battle ${battleIdStr} in ${Math.round(delay / 1000)}s`)
}

/**
 * Cancel a scheduled battle timer (when battle completes early)
 * @param {string} battleId - Battle ID
 */
const cancelBattleTimer = (battleId) => {
  const battleIdStr = battleId.toString()
  if (battleExpiryTimers.has(battleIdStr)) {
    clearTimeout(battleExpiryTimers.get(battleIdStr))
    battleExpiryTimers.delete(battleIdStr)
    console.log(`[BattleExpiry] Timer cancelled for battle ${battleIdStr}`)
  }
}

/**
 * Process expired battle by ID (helper for timer-based processing)
 * @param {string} battleId - Battle ID
 */
const processExpiredBattleById = async (battleId) => {
  // Find the expiry event for this battle
  const event = await QuickClashBattleExpiryEvent.findOne({
    battleId,
    status: { $in: ['pending', 'failed'] },
  })

  if (event) {
    await processExpiredBattle({ eventId: event._id.toString() })
  } else {
    // Fallback: process battle directly if no event found
    const battle = await QuickClashTeamBattle.findById(battleId)

    if (battle && battle.status === 'active') {
      const session = await mongoose.startSession()
      try {
        await session.withTransaction(async () => {
          await completeBattleOnExpiry({ battle, session })
        })
      } catch (directError) {
        console.error(`[BattleExpiry] Direct battle completion failed:`, directError)
        throw directError
      } finally {
        session.endSession()
      }
    }
  }
}

/**
 * Create a battle expiry event when team battle is created
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {Date} params.expiresAt - When the battle expires
 * @param {mongoose.ClientSession} [params.session] - Optional session
 */
const createBattleExpiryEvent = async ({
  battleId,
  expiresAt,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    // Create the expiry event
    const expiryEvent = new QuickClashBattleExpiryEvent({
      battleId,
      eventType: 'battle_completion',
      executeAt: expiresAt,
    })

    await expiryEvent.save({ session })

    if (startedTransaction) {
      await session.commitTransaction()
    }

    console.log(
      `[BattleExpiry] Created expiry event for battle ${battleId} at ${expiresAt}`,
    )

    // Schedule in-memory timer for precise expiry (non-blocking)
    scheduleBattleCompletion({ battleId, expiresAt }).catch(err => {
      console.error(`[BattleExpiry] Failed to schedule timer for battle ${battleId}:`, err)
    })

    return expiryEvent
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }

    // Don't fail battle creation if event creation fails
    console.error(
      `[BattleExpiry] Failed to create expiry event for battle ${battleId}:`,
      error,
    )
    // We'll rely on fallback cron job to catch this battle
    return null
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

/**
 * Process expired team battles - complete them and calculate final results
 * @param {string} eventId - The expiry event ID being processed
 */
const processExpiredBattle = makeRetryable(
  async ({ eventId }) => {
    console.log(`[BattleExpiry] Processing expired battle event: ${eventId}`)

    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // Get the event and mark it as processing
        const event = await QuickClashBattleExpiryEvent.findOneAndUpdate(
          {
            _id: eventId,
            $or: [
              { status: 'pending' },
              { status: 'failed' },
            ],
          },
          {
            status: 'processing',
            processedAt: new Date(),
          },
          { session, new: true },
        )

        if (!event) {
          console.log(
            `[BattleExpiry] Event ${eventId} already processed or not found`,
          )
          return
        }

        // Get the battle
        const battle = await QuickClashTeamBattle.findById(
          event.battleId,
        ).session(session)

        if (!battle) {
          console.log(`[BattleExpiry] Battle ${event.battleId} not found`)
          // Mark event as completed anyway
          await QuickClashBattleExpiryEvent.findByIdAndUpdate(
            eventId,
            { status: 'completed' },
            { session },
          )
          return
        }

        // Only process active battles
        if (battle.status !== 'active') {
          console.log(
            `[BattleExpiry] Battle ${battle._id} is not active (status: ${battle.status})`,
          )
          // Mark event as completed
          await QuickClashBattleExpiryEvent.findByIdAndUpdate(
            eventId,
            { status: 'completed' },
            { session },
          )
          return
        }

        console.log(`[BattleExpiry] Completing expired battle ${battle._id}`)

        // Complete the battle using existing logic
        await completeBattleOnExpiry({ battle, session })

        // Mark event as completed
        await QuickClashBattleExpiryEvent.findByIdAndUpdate(
          eventId,
          { status: 'completed' },
          { session },
        )

        console.log(
          `[BattleExpiry] Successfully completed battle ${battle._id}`,
        )
      })
    } catch (error) {
      console.error(
        `[BattleExpiry] Error processing battle event ${eventId}:`,
        error,
      )

      // Update event with error info
      await QuickClashBattleExpiryEvent.findByIdAndUpdate(eventId, {
        status: 'failed',
        lastError: error.message,
        $inc: { retryCount: 1 },
      })

      throw error
    } finally {
      session.endSession()
    }
  },
  {
    maxRetries: 3,
    operationName: 'ProcessExpiredBattle',
    initialDelay: 5000, // 5 seconds
    onRetry: (error, attempt) => {
      console.log(
        `[BattleExpiry] Retry attempt ${attempt}/3 for expired battle processing`,
      )
    },
  },
)

/**
 * Complete a battle when it expires (extracted from updateBattleWithQuizResults logic)
 * @param {Object} params
 * @param {Object} params.battle - Battle document
 * @param {mongoose.ClientSession} params.session - Database session
 */
const completeBattleOnExpiry = async ({ battle, session }) => {
  // Mark battle as completed
  battle.status = 'completed'

  // Calculate final results based on completed challenges
  let teamAWins = 0
  let teamBWins = 0
  let ties = 0

  battle.challenges.forEach(challenge => {
    // CORRECTED LOGIC: Handle cases where only one team completed the challenge
    if (challenge.teamACompleted && challenge.teamBCompleted) {
      // Both teams completed - compare scores
      if (challenge.teamAScore > challenge.teamBScore) {
        teamAWins++
        challenge.winner = 'teamA' // Ensure winner is set
      } else if (challenge.teamBScore > challenge.teamAScore) {
        teamBWins++
        challenge.winner = 'teamB' // Ensure winner is set
      } else {
        ties++
        challenge.winner = 'tie' // Ensure winner is set
      }
    } else if (challenge.teamACompleted && !challenge.teamBCompleted) {
      // Only team A completed - they win
      teamAWins++
      challenge.winner = 'teamA' // Ensure winner is set
    } else if (!challenge.teamACompleted && challenge.teamBCompleted) {
      // Only team B completed - they win
      teamBWins++
      challenge.winner = 'teamB' // Ensure winner is set
    } else {
      // Neither team completed - count as tie
      ties++
      challenge.winner = 'tie' // Ensure winner is set
    }
  })

  battle.teamAWins = teamAWins
  battle.teamBWins = teamBWins
  battle.ties = ties

  // Determine overall winner
  if (teamAWins > teamBWins) {
    battle.winner = 'teamA'
  } else if (teamBWins > teamAWins) {
    battle.winner = 'teamB'
  } else {
    // Use total scores as first tiebreaker
    battle.teamATotalScore = battle.teamAMembers.reduce(
      (sum, member) => sum + member.score,
      0,
    )
    battle.teamBTotalScore = battle.teamBMembers.reduce(
      (sum, member) => sum + member.score,
      0,
    )

    if (battle.teamATotalScore > battle.teamBTotalScore) {
      battle.winner = 'teamA'
    } else if (battle.teamBTotalScore > battle.teamATotalScore) {
      battle.winner = 'teamB'
    } else {
      // Use highest individual RQM score as second tiebreaker
      const teamAHighestScore = Math.max(
        ...battle.teamAMembers.map(m => m.score || 0),
        0, // Default to 0 if no scores
      )
      const teamBHighestScore = Math.max(
        ...battle.teamBMembers.map(m => m.score || 0),
        0, // Default to 0 if no scores
      )

      if (teamAHighestScore > teamBHighestScore) {
        battle.winner = 'teamA'
      } else if (teamBHighestScore > teamAHighestScore) {
        battle.winner = 'teamB'
      } else {
        battle.winner = 'tie'
      }
    }
  }

  console.log(
    `[BattleExpiry] Battle ${battle._id} - Team A: ${teamAWins} wins, Team B: ${teamBWins} wins, Ties: ${ties}`,
  )
  console.log(`[BattleExpiry] Final result: ${battle.winner}`)

  // Calculate final trophies (reuse existing logic)
  await calculateFinalTrophies(battle, session)

  // Update team match status - gracefully handle missing teams
  // Teams may have been auto-formed and cleaned up, or disbanded by users
  if (battle.teamA) {
    try {
      await updateTeamMatchStatus({
        teamId: battle.teamA,
        isInMatch: false,
        session,
      })
    } catch (teamError) {
      if (teamError.message === 'Team not found') {
        console.log(`[BattleExpiry] Team A (${battle.teamA}) not found - may have been auto-formed or disbanded`)
      } else {
        throw teamError
      }
    }
  }

  if (battle.teamB) {
    try {
      await updateTeamMatchStatus({
        teamId: battle.teamB,
        isInMatch: false,
        session,
      })
    } catch (teamError) {
      if (teamError.message === 'Team not found') {
        console.log(`[BattleExpiry] Team B (${battle.teamB}) not found - may have been auto-formed or disbanded`)
      } else {
        throw teamError
      }
    }
  }

  // Save the completed battle
  await battle.save({ session })

  // Extract powerup rewards and trophy changes for socket notification
  const powerupRewards = {}
  const trophyChanges = {}

  for (const member of battle.teamAMembers) {
    const userId = getMemberPlayerId(member)
    if (!userId) continue // Skip members without valid user/sessionPlayer

    // Always include trophy change for each member
    trophyChanges[userId] = {
      trophyChange: member.trophyChange || 0,
      isWinner: battle.winner === 'teamA',
      isTie: battle.winner === 'tie',
    }

    // Include powerup reward if housingSpaceEarned > 0
    if (member.powerupReward && member.powerupReward.housingSpaceEarned > 0) {
      powerupRewards[userId] = {
        housingSpaceEarned: member.powerupReward.housingSpaceEarned,
        powerupsAwarded: member.powerupReward.powerupsAwarded || [],
        individualWins: member.powerupReward.individualWins || 0,
      }
    }
  }

  for (const member of battle.teamBMembers) {
    const userId = getMemberPlayerId(member)
    if (!userId) continue // Skip members without valid user/sessionPlayer

    // Always include trophy change for each member
    trophyChanges[userId] = {
      trophyChange: member.trophyChange || 0,
      isWinner: battle.winner === 'teamB',
      isTie: battle.winner === 'tie',
    }

    // Include powerup reward if housingSpaceEarned > 0
    if (member.powerupReward && member.powerupReward.housingSpaceEarned > 0) {
      powerupRewards[userId] = {
        housingSpaceEarned: member.powerupReward.housingSpaceEarned,
        powerupsAwarded: member.powerupReward.powerupsAwarded || [],
        individualWins: member.powerupReward.individualWins || 0,
      }
    }
  }

  console.log(`[BattleExpiry] Trophy changes payload:`, JSON.stringify(trophyChanges))
  console.log(`[BattleExpiry] Powerup rewards payload:`, JSON.stringify(powerupRewards))

  // Emit completion event with powerup rewards and trophy changes (async, non-blocking)
  setTimeout(() => {
    globalEmitter.emit('quickClash:teamBattleCompleted', {
      battleId: battle._id,
      winner: battle.winner,
      teamA: battle.teamA,
      teamB: battle.teamB,
      powerupRewards,
      trophyChanges,
    })
    console.log(`[BattleExpiry] Emitted teamBattleCompleted for battle ${battle._id} with ${Object.keys(trophyChanges).length} trophy changes`)
  }, 0)

  // Send push notifications to offline team members
  notifyTeamBattleCompleted({
    battle,
    teamAMembers: battle.teamAMembers,
    teamBMembers: battle.teamBMembers,
    teamA: { _id: battle.teamA, name: 'Team A' }, // Minimal info, full details fetched in service
    teamB: { _id: battle.teamB, name: 'Team B' },
  }).catch(err => {
    console.error(`[BattleExpiry] Error sending battle completed push notifications:`, err)
  })
}

/**
 * Process all pending expiry events
 */
const processPendingExpiryEvents = async () => {
  console.log(`[BattleExpiry] Processing pending expiry events`)

  try {
    // Find events that are ready to be processed (with 30-second buffer)
    const bufferTime = new Date(Date.now() - 30 * 1000) // 30 seconds ago

    const pendingEvents = await QuickClashBattleExpiryEvent.find({
      executeAt: { $lte: bufferTime },
      $or: [
        { status: 'pending' },
        { status: 'failed' },
      ],
    })
      .sort({ executeAt: 1 })
      .limit(10) // Process max 10 at a time to avoid overwhelming the system

    console.log(
      `[BattleExpiry] Found ${pendingEvents.length} pending events to process`,
    )

    // Process events in parallel (but limited), with lock checking
    const promises = pendingEvents.map(async event => {
      const battleIdStr = event.battleId.toString()

      // Skip if battle has active sessions (will be handled when sessions complete)
      if (hasActiveSessions(battleIdStr)) {
        console.log(`[BattleExpiry] Cron skipping battle ${battleIdStr} - has active sessions`)
        return
      }

      // Skip if timer is already handling this battle
      if (isBattleLocked(battleIdStr)) {
        console.log(`[BattleExpiry] Cron skipping locked battle ${battleIdStr}`)
        return
      }

      // Try to acquire lock
      if (!acquireBattleLock(battleIdStr)) {
        console.log(`[BattleExpiry] Cron failed to acquire lock for ${battleIdStr}`)
        return
      }

      try {
        await processExpiredBattle({ eventId: event._id.toString() })
      } catch (error) {
        console.error(
          `[BattleExpiry] Failed to process event ${event._id}:`,
          error,
        )
        // Don't let one failure stop others
      } finally {
        releaseBattleLock(battleIdStr)
      }
    })

    await Promise.all(promises)
    console.log(`[BattleExpiry] Completed processing pending events`)
  } catch (error) {
    console.error(`[BattleExpiry] Error in processPendingExpiryEvents:`, error)
  }
}

/**
 * Cleanup failed events (retry failed events or remove old ones)
 */
const cleanupFailedEvents = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Find failed events that are old enough to retry or cleanup
    const failedEvents = await QuickClashBattleExpiryEvent.find({
      status: 'failed',
      processedAt: { $lte: oneHourAgo },
      retryCount: { $lt: 3 }, // Only retry if less than 3 attempts
    })

    console.log(
      `[BattleExpiry] Found ${failedEvents.length} failed events to retry`,
    )

    for (const event of failedEvents) {
      // Reset to pending for retry
      await QuickClashBattleExpiryEvent.findByIdAndUpdate(event._id, {
        status: 'pending',
        lastError: null,
      })
    }

    // Remove events that have failed too many times
    const result = await QuickClashBattleExpiryEvent.deleteMany({
      status: 'failed',
      retryCount: { $gte: 3 },
      processedAt: { $lte: oneHourAgo },
    })

    if (result.deletedCount > 0) {
      console.log(
        `[BattleExpiry] Cleaned up ${result.deletedCount} permanently failed events`,
      )
    }
  } catch (error) {
    console.error(`[BattleExpiry] Error in cleanupFailedEvents:`, error)
  }
}

module.exports = {
  createBattleExpiryEvent,
  processPendingExpiryEvents,
  cleanupFailedEvents,
  processExpiredBattle,
  // Timer management exports
  scheduleBattleCompletion,
  cancelBattleTimer,
  isBattleLocked,
  // Active session tracking exports
  registerActiveSession,
  unregisterActiveSession,
  hasActiveSessions,
  // Battle ending state exports
  isBattleEnding,
  markBattleEnding,
  clearBattleEnding,
}

