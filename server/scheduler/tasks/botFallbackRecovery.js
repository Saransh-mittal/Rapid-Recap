// scheduler/tasks/botFallbackRecovery.js
const {
  recoverStuckBots,
} = require('../../services/quickClashServices/quickClashBotService')

/**
 * Fallback mechanism to recover stuck bots in team battles
 * This task runs every 45 seconds to catch bots that missed their cues
 */
const botFallbackRecovery = async () => {
  try {
    console.log('[BOT_FALLBACK] Running bot fallback recovery check')
    await recoverStuckBots()
  } catch (error) {
    console.error('[BOT_FALLBACK] Error in bot fallback recovery:', error)
    // Don't throw - we want the cron job to continue running
  }
}

module.exports = {
  botFallbackRecovery,
}
