// services/maintenanceService.js
const cache = require('memory-cache')
const MaintenanceWindow = require('../model/maintenanceSchema')
const { makeRetryable } = require('../utils/retryUtils')
const globalEmitter = require('../eventEmitter')

const MAINTENANCE_CACHE_KEY = 'maintenance:status'
const CACHE_DURATION = 60 * 1000 // 1 minute in milliseconds

// Function to check if system is under maintenance
const isUnderMaintenance = async () => {
  try {
    // Check cache first
    const cachedStatus = cache.get(MAINTENANCE_CACHE_KEY)
    if (cachedStatus) {
      return cachedStatus
    }

    // If not in cache, check database
    const maintenance = await MaintenanceWindow.findOne({
      isActive: true,
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
    cache.put(MAINTENANCE_CACHE_KEY, status, CACHE_DURATION)

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
    cache.del(MAINTENANCE_CACHE_KEY)

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
    cache.del(MAINTENANCE_CACHE_KEY)

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
    cache.del(MAINTENANCE_CACHE_KEY)

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
    cache.del(MAINTENANCE_CACHE_KEY)

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
