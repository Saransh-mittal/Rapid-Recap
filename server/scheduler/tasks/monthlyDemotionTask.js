const cron = require('node-cron')
const {
  executeMonthlyDemotionWithMaintenance,
} = require('../../services/demotionMaintenanceService')
const globalEmitter = require('../../eventEmitter')
const moment = require('moment-timezone')

// Schedule monthly demotion task
// Runs at 00:00 UTC on the 1st of every month
const scheduleDemotionTask = () => {
  cron.schedule(
    '0 0 1 * *',
    async () => {
      console.log('Initiating monthly leaderboard refresh process...')

      try {
        // Check if it's the right time
        const currentUTC = moment.utc()
        if (currentUTC.date() !== 1 || currentUTC.hour() !== 0) {
          console.log('Not the correct time for monthly refresh')
          return
        }

        // Execute the process
        globalEmitter.emit('monthly-refresh-status', {
          status: 'starting',
          message: 'Starting monthly leaderboard refresh',
        })

        const result = await executeMonthlyDemotionWithMaintenance()

        console.log('Monthly refresh completed:', {
          statsProcessed: result.stats.processedCount,
          demotionsProcessed: result.demotion.processedCount,
          errors: result.stats.statsErrors,
        })

        globalEmitter.emit('monthly-refresh-status', {
          status: 'completed',
          message: 'Monthly refresh completed successfully',
          stats: {
            processedUsers: result.stats.processedCount,
            errors: result.stats.statsErrors.length,
          },
        })
      } catch (error) {
        console.error('Monthly refresh failed:', error)

        globalEmitter.emit('monthly-refresh-status', {
          status: 'failed',
          message: 'Monthly refresh failed',
          error: error.message,
        })
      }
    },
    {
      timezone: 'UTC',
      scheduled: true,
    },
  )
}

// Function for manual trigger (admin only)
const triggerManualDemotion = async () => {
  try {
    return await executeMonthlyDemotionWithMaintenance()
  } catch (error) {
    console.error('Manual demotion trigger failed:', error)
    throw error
  }
}

module.exports = {
  scheduleDemotionTask,
  triggerManualDemotion,
}
