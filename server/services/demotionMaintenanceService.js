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
const {
  sendMaintenanceCompletionNotification,
} = require('./maintenanceNotificationService')

const executeMonthlyDemotionWithMaintenance = async () => {
  try {
    // Setup maintenance window
    const startTime = new Date()
    const endTime = moment(startTime).add(2, 'hour')
    const maintenanceReason = 'Monthly Leaderboard Reset'
    console.log('Starting monthly refresh process...')

    // Schedule and start maintenance
    const maintenance = await scheduleMaintenance({
      startTime: startTime,
      endTime: endTime.toDate(),
      reason: maintenanceReason,
    })

    await startMaintenance(maintenance._id)

    // Step 1: Save monthly stats
    console.log('Collecting monthly statistics...')

    const statsResult = await saveMonthlyStats({
      month: moment().subtract(1, 'month').month() + 1, // Previous month
      year: moment().subtract(1, 'month').year(),
    })

    console.log(
      `Monthly stats collection completed for ${statsResult.processedCount} users`,
    )

    // Step 2: Execute demotion
    console.log('Starting demotion process...')

    const demotionResult = await executeMonthlyDemotion()
    await calculateRanksAfterDemotion()

    // Step 3: End maintenance
    console.log('Completing process...')

    await endMaintenance(maintenance._id)
    console.log('Sending completion notifications...')

    await sendMaintenanceCompletionNotification({
      maintenanceId: maintenance._id,
      reason: maintenanceReason,
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
