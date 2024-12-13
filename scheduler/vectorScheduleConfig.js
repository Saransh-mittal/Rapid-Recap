const moment = require('moment-timezone')
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')
const {
  dropSearchIndexes,
  devectorizeOldArticles,
  recreateSearchIndex,
} = require('../services/vectorManagementService')

// Helper to create maintenance schedule entries
const createVectorMaintenanceSchedule = (name, dayOfWeek) => ({
  name,
  cronPattern: convertISTtoUTCCron(2, 0, dayOfWeek), // 2 AM IST on specified days
  task: async () => {
    console.log(`Starting ${name}`)
    try {
      // Execute maintenance steps in sequence
      await devectorizeOldArticles()
      await dropSearchIndexes()
      await recreateSearchIndex()
      console.log(`Completed ${name}`)
    } catch (error) {
      console.error(`Error in ${name}:`, error)
    }
  },
})

// Create schedules for Wednesday (3) and Saturday (6)
const vectorSchedules = [
  createVectorMaintenanceSchedule('vector-maintenance-wednesday', '3'),
  createVectorMaintenanceSchedule('vector-maintenance-saturday', '6'),
]

module.exports = vectorSchedules
