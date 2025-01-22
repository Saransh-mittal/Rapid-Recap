const {
  executeMonthlyDemotion,
  calculateRanksAfterDemotion,
} = require('./demotionService')
const {
  scheduleMaintenance,
  startMaintenance,
  endMaintenance,
} = require('./maintenanceService')
const { saveMonthlyStats } = require('./monthlyStatsService')
const moment = require('moment-timezone')
const globalEmitter = require('../eventEmitter')
const MaintenanceWindow = require('../model/maintenanceSchema')

const executeMonthlyDemotionWithMaintenance = async () => {
  try {
    // Setup maintenance window
    const startTime = moment()
      .utc()
      .startOf('month')
      .set({ hour: 0, minute: 0 })
    const endTime = moment(startTime).add(2, 'hours')

    console.log('Starting monthly refresh process...')

    // Schedule and start maintenance
    const maintenance = await scheduleMaintenance({
      startTime: startTime.toDate(),
      endTime: endTime.toDate(),
      reason: 'Monthly Leaderboard Refresh and Stats Collection',
    })

    await startMaintenance(maintenance._id)

    // Emit maintenance start event for frontend
    globalEmitter.emit('maintenance-update', {
      status: 'started',
      step: 'initialization',
      progress: 0,
      message: 'Starting monthly refresh process',
    })

    // Step 1: Save monthly stats
    console.log('Collecting monthly statistics...')
    globalEmitter.emit('maintenance-update', {
      status: 'in-progress',
      step: 'stats-collection',
      progress: 20,
      message: 'Collecting monthly statistics',
    })

    const statsResult = await saveMonthlyStats({
      month: moment().subtract(1, 'month').month() + 1, // Previous month
      year: moment().subtract(1, 'month').year(),
    })

    console.log(
      `Monthly stats collection completed for ${statsResult.processedCount} users`,
    )

    // Step 2: Execute demotion
    console.log('Starting demotion process...')
    globalEmitter.emit('maintenance-update', {
      status: 'in-progress',
      step: 'demotion',
      progress: 60,
      message: 'Performing leaderboard refresh',
    })

    const demotionResult = await executeMonthlyDemotion()
    await calculateRanksAfterDemotion()

    // Step 3: End maintenance
    console.log('Completing process...')
    globalEmitter.emit('maintenance-update', {
      status: 'completing',
      step: 'finalization',
      progress: 90,
      message: 'Finalizing monthly refresh',
    })

    await endMaintenance(maintenance._id)

    // Final success event
    globalEmitter.emit('maintenance-update', {
      status: 'completed',
      step: 'completed',
      progress: 100,
      message: 'Monthly refresh completed successfully',
    })

    return {
      success: true,
      stats: {
        processedCount: statsResult.processedCount,
        statsErrors: statsResult.errors,
      },
      demotion: {
        processedCount: demotionResult.processedCount,
      },
      maintenance: {
        startTime,
        endTime,
        status: 'completed',
      },
    }
  } catch (error) {
    console.error('Error in monthly demotion process:', error)
    globalEmitter.emit('maintenance-update', {
      status: 'error',
      step: 'error',
      progress: 100,
      message: 'An error occurred during the monthly refresh',
    })
    throw error
  }
}

// Function to monitor progress
const getMaintenanceProgress = async maintenanceId => {
  const maintenance = await MaintenanceWindow.findById(maintenanceId)
  if (!maintenance) {
    throw new Error('Maintenance window not found')
  }
  return {
    status: maintenance.status,
    startTime: maintenance.startTime,
    endTime: maintenance.endTime,
    reason: maintenance.reason,
  }
}

module.exports = {
  executeMonthlyDemotionWithMaintenance,
  getMaintenanceProgress,
}
