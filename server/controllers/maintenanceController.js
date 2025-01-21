const asyncHandler = require('express-async-handler')
const {
  scheduleMaintenance,
  startMaintenance,
  endMaintenance,
  cancelMaintenance,
  isUnderMaintenance,
} = require('../services/maintenanceService')
const MaintenanceWindow = require('../model/maintenanceSchema')

// Schedule maintenance window
const scheduleMaintenanceWindow = asyncHandler(async (req, res) => {
  const { startTime, endTime, reason } = req.body

  const maintenance = await scheduleMaintenance({
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    reason,
  })

  res.status(201).json({
    status: 'success',
    maintenance,
  })
})

// Start maintenance window
const startMaintenanceWindow = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params
  const maintenance = await startMaintenance(maintenanceId)

  res.json({
    status: 'success',
    maintenance,
  })
})

// End maintenance window
const endMaintenanceWindow = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params
  const maintenance = await endMaintenance(maintenanceId)

  res.json({
    status: 'success',
    maintenance,
  })
})

// Cancel maintenance window
const cancelMaintenanceWindow = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params
  const maintenance = await cancelMaintenance(maintenanceId)

  res.json({
    status: 'success',
    maintenance,
  })
})

// Get maintenance status
const getMaintenanceStatus = asyncHandler(async (req, res) => {
  const status = await isUnderMaintenance()
  res.json(status)
})

// Get all maintenance windows
const getMaintenanceWindows = asyncHandler(async (req, res) => {
  const maintenanceWindows = await MaintenanceWindow.find()
    .sort({ createdAt: -1 })
    .limit(10)

  res.json({
    status: 'success',
    maintenanceWindows,
  })
})

module.exports = {
  scheduleMaintenanceWindow,
  startMaintenanceWindow,
  endMaintenanceWindow,
  cancelMaintenanceWindow,
  getMaintenanceStatus,
  getMaintenanceWindows,
}
