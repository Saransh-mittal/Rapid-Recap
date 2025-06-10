// services/quickClashServices/quickClashBattleExpiryService.js
const mongoose = require('mongoose')
const QuickClashBattleExpiryEvent = require('../../model/quickClashSchemas/quickClashBattleExpiryEventSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')

const { makeRetryable } = require('../../utils/retryUtils')
// REFACTOR: Import the centralized battle completion logic
const { _completeAndFinalizeBattle } = require('./quickClashTeamBattleService')

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
            status: 'pending',
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

        // REFACTOR: Use the centralized completion logic from the battle service
        await _completeAndFinalizeBattle({ battle, session })

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
 * Process all pending expiry events
 */
const processPendingExpiryEvents = async () => {
  console.log(`[BattleExpiry] Processing pending expiry events`)

  try {
    // Find events that are ready to be processed (with 30-second buffer)
    const bufferTime = new Date(Date.now() - 30 * 1000) // 30 seconds ago

    const pendingEvents = await QuickClashBattleExpiryEvent.find({
      executeAt: { $lte: bufferTime },
      status: 'pending',
    })
      .sort({ executeAt: 1 })
      .limit(10) // Process max 10 at a time to avoid overwhelming the system

    console.log(
      `[BattleExpiry] Found ${pendingEvents.length} pending events to process`,
    )

    // Process events in parallel (but limited)
    const promises = pendingEvents.map(event =>
      processExpiredBattle({ eventId: event._id.toString() }).catch(error => {
        console.error(
          `[BattleExpiry] Failed to process event ${event._id}:`,
          error,
        )
        // Don't let one failure stop others
      }),
    )

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
}
