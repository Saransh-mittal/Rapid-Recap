// scheduler/tasks/botMatchmakingTask.js
const {
  addBotsToMatchmaking,
} = require('../../services/quickClashServices/quickClashBotService')

/**
 * Add bots to matchmaking if real players are present
 * This task runs every 20-30 seconds
 */
const manageBotMatchmaking = async () => {
  try {
    console.log('Running bot matchmaking management')
    await addBotsToMatchmaking()
  } catch (error) {
    console.error('Error in bot matchmaking management:', error)
    // Don't throw - we want the cron job to continue running
  }
}

module.exports = {
  manageBotMatchmaking,
}
