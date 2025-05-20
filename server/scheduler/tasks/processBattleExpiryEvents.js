// scheduler/tasks/processBattleExpiryEvents.js
const {
  processPendingExpiryEvents,
  cleanupFailedEvents,
} = require('../../services/quickClashServices/quickClashBattleExpiryService')

/**
 * Process pending battle expiry events
 * This task runs every minute to check for battles that have expired
 */
const processBattleExpiryEvents = async () => {
  console.log('Running battle expiry event processor')

  try {
    // Process pending events
    await processPendingExpiryEvents()
  } catch (error) {
    console.error('Error in battle expiry event processor:', error)
    // Don't throw - we want the cron job to continue running
  }
}

/**
 * Cleanup failed battle expiry events
 * This task runs less frequently to retry failed events and clean up old ones
 */
const cleanupBattleExpiryEvents = async () => {
  console.log('Running battle expiry event cleanup')

  try {
    await cleanupFailedEvents()
  } catch (error) {
    console.error('Error in battle expiry event cleanup:', error)
    // Don't throw - we want the cron job to continue running
  }
}

module.exports = {
  processBattleExpiryEvents,
  cleanupBattleExpiryEvents,
}
