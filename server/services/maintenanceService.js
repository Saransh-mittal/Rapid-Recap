const MaintenanceWindow = require('../model/maintenanceSchema')
const { redis } = require('../redis')
const { makeRetryable } = require('../utils/retryUtils')
const globalEmitter = require('../eventEmitter')

const MAINTENANCE_CACHE_KEY = 'maintenance:status'
const MAINTENANCE_CHECK_INTERVAL = 60000 // 1 minute

// Function to check if system is under maintenance
const isUnderMaintenance = async () => {
  try {
    // Check cache first
    const cachedStatus = await redis.get(MAINTENANCE_CACHE_KEY)
    if (cachedStatus) {
      return JSON.parse(cachedStatus)
    }

    // If not in cache, check database
    const maintenance = await MaintenanceWindow.findOne({
      isActive: true,
      startTime: { $lte: new Date() },
      endTime: { $gt: new Date() },
      status: 'in-progress',
    })

    const status = {
      isUnderMaintenance: !!maintenance,
      maintenance: maintenance
        ? {
            reason: maintenance.reason,
            endTime: maintenance.endTime,
            startTime: maintenance.startTime,
          }
        : null,
    }

    // Cache the result
    await redis.setex(
      MAINTENANCE_CACHE_KEY,
      60, // Cache for 1 minute
      JSON.stringify(status),
    )

    return status
  } catch (error) {
    console.error('Error checking maintenance status:', error)
    return { isUnderMaintenance: false, maintenance: null }
  }
}

// Schedule maintenance window
const scheduleMaintenance = makeRetryable(
  async ({ startTime, endTime, reason }) => {
    const maintenance = new MaintenanceWindow({
      startTime,
      endTime,
      reason,
      status: 'scheduled',
    })

    await maintenance.save()

    // Clear cache
    await redis.del(MAINTENANCE_CACHE_KEY)

    // Emit event for scheduled maintenance
    globalEmitter.emit('maintenance-scheduled', maintenance)

    return maintenance
  },
  {
    maxRetries: 3,
    operationName: 'ScheduleMaintenance',
  },
)

// Start maintenance window
const startMaintenance = makeRetryable(
  async maintenanceId => {
    const maintenance = await MaintenanceWindow.findById(maintenanceId)
    if (!maintenance) {
      throw new Error('Maintenance window not found')
    }

    maintenance.isActive = true
    maintenance.status = 'in-progress'
    await maintenance.save()

    // Clear cache
    await redis.del(MAINTENANCE_CACHE_KEY)

    // Emit maintenance start event
    globalEmitter.emit('maintenance-started', maintenance)

    // Force all users to reload their app
    globalEmitter.emit('force-reload')

    return maintenance
  },
  {
    maxRetries: 3,
    operationName: 'StartMaintenance',
  },
)

// End maintenance window
const endMaintenance = makeRetryable(
  async maintenanceId => {
    const maintenance = await MaintenanceWindow.findById(maintenanceId)
    if (!maintenance) {
      throw new Error('Maintenance window not found')
    }

    maintenance.isActive = false
    maintenance.status = 'completed'
    await maintenance.save()

    // Clear cache
    await redis.del(MAINTENANCE_CACHE_KEY)

    // Emit maintenance end event
    globalEmitter.emit('maintenance-ended', maintenance)

    // Force all users to reload their app
    globalEmitter.emit('force-reload')

    return maintenance
  },
  {
    maxRetries: 3,
    operationName: 'EndMaintenance',
  },
)

// Cancel maintenance window
const cancelMaintenance = makeRetryable(
  async maintenanceId => {
    const maintenance = await MaintenanceWindow.findById(maintenanceId)
    if (!maintenance) {
      throw new Error('Maintenance window not found')
    }

    maintenance.isActive = false
    maintenance.status = 'cancelled'
    await maintenance.save()

    // Clear cache
    await redis.del(MAINTENANCE_CACHE_KEY)

    // Emit maintenance cancelled event
    globalEmitter.emit('maintenance-cancelled', maintenance)

    return maintenance
  },
  {
    maxRetries: 3,
    operationName: 'CancelMaintenance',
  },
)

module.exports = {
  isUnderMaintenance,
  scheduleMaintenance,
  startMaintenance,
  endMaintenance,
  cancelMaintenance,
}
