// scheduler/tasks/fallbackBattleCompletion.js
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashBattleExpiryEvent = require('../../model/quickClashSchemas/quickClashBattleExpiryEventSchema')
const {
  createBattleExpiryEvent,
} = require('../../services/quickClashServices/quickClashBattleExpiryService')

/**
 * Fallback mechanism to catch any battles that don't have expiry events
 * This runs every 15 minutes as a safety net
 */
const fallbackBattleCompletion = async () => {
  console.log('Running fallback battle completion check')

  try {
    // Find active battles that have expired but don't have completed expiry events
    const expiredBattles = await QuickClashTeamBattle.find({
      status: 'active',
      expiresAt: { $lte: new Date() },
    })

    console.log(
      `[Fallback] Found ${expiredBattles.length} expired active battles`,
    )

    for (const battle of expiredBattles) {
      // Check if this battle has an expiry event
      const existingEvent = await QuickClashBattleExpiryEvent.findOne({
        battleId: battle._id,
        eventType: 'battle_completion',
      })

      if (!existingEvent) {
        console.log(
          `[Fallback] Creating missing expiry event for battle ${battle._id}`,
        )

        // Create the missing expiry event (will be processed immediately)
        await createBattleExpiryEvent({
          battleId: battle._id,
          expiresAt: battle.expiresAt,
        })
      } else if (
        existingEvent.status === 'failed' &&
        existingEvent.retryCount >= 3
      ) {
        console.log(
          `[Fallback] Battle ${battle._id} has a permanently failed event, creating new one`,
        )

        // Delete the failed event and create a new one
        await QuickClashBattleExpiryEvent.findByIdAndDelete(existingEvent._id)
        await createBattleExpiryEvent({
          battleId: battle._id,
          expiresAt: battle.expiresAt,
        })
      }
    }
  } catch (error) {
    console.error('Error in fallback battle completion:', error)
  }
}

module.exports = {
  fallbackBattleCompletion,
}
