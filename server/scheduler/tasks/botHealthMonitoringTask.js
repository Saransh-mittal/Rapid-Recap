// scheduler/tasks/botHealthMonitoringTask.js

const {
  checkBotHealth,
  cleanupCompletedBattles,
} = require('../../services/quickClashServices/quickClashBotHealthService')

/**
 * Check for stuck bots and attempt recovery
 * This task runs every 2 minutes
 */
const botHealthCheck = async () => {
  try {
    console.log('Running bot health check')
    await checkBotHealth()
  } catch (error) {
    console.error('Error in bot health check:', error)
    // Don't throw - we want the cron job to continue running
  }
}

/**
 * Clean up tracking for completed/inactive battles
 * This task runs every 10 minutes
 */
const botHealthCleanup = async () => {
  try {
    console.log('Running bot health cleanup')
    await cleanupCompletedBattles()
  } catch (error) {
    console.error('Error in bot health cleanup:', error)
    // Don't throw - we want the cron job to continue running
  }
}

module.exports = {
  botHealthCheck,
  botHealthCleanup,
}
