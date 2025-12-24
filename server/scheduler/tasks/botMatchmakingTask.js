// scheduler/tasks/botMatchmakingTask.js
const {
  addBotsToMatchmaking,
} = require('../../services/quickClashServices/quickClashBotService')
const {
  processGlobalMatchmaking,
} = require('../../services/quickClashServices/quickClashTeamMatchmakingService')

/**
 * Add bots to matchmaking if real players are present
 * Also triggers periodic matchmaking processing
 * This task runs every 5 seconds
 */
const manageBotMatchmaking = async () => {
  try {
    // Add bots if needed
    await addBotsToMatchmaking()

    // Wait for bot addition transactions to fully settle
    // This prevents WriteConflict errors with the matchmaking transaction
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Process matchmaking queue (with mutex protection and debounce)
    // This is the periodic trigger for matchmaking since we removed
    // the immediate trigger from joinGlobalMatchmaking
    await processGlobalMatchmaking()
  } catch (error) {
    console.error('Error in bot matchmaking management:', error)
    // Don't throw - we want the cron job to continue running
  }
}

module.exports = {
  manageBotMatchmaking,
}
