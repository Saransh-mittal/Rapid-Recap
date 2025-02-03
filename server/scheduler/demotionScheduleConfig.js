// src/scheduler/demotionScheduleConfig.js

const { demotionTask } = require('./tasks/monthlyDemotionTask')

// Define demotion schedules
const demotionSchedules = [
  {
    name: 'monthlyDemotion',
    cronPattern: '0 0 1 * *', // At 00:00 on the 1st of every month
    task: demotionTask,
  },
]

module.exports = demotionSchedules
