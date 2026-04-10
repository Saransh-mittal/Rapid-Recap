// setupCronJobs.js
const cron = require('node-cron')
const quickClashSchedules = require('./quickClashScheduleConfig')

// Setup Forge workflow schedules
const forgeSchedules = require('./forgeScheduleConfig')
// forgeSchedules.forEach(schedule => {
//   cron.schedule(schedule.cronPattern, schedule.task)
//   console.log(`Scheduled ${schedule.name} task`)
// })
// Setup Quick Clash schedules
quickClashSchedules.forEach(schedule => {
  // Check if this schedule needs seconds-level precision
  const needsSeconds = schedule.cronPattern.split(' ').length === 6

  if (needsSeconds) {
    // Use seconds-level scheduling for bot matchmaking
    cron.schedule(schedule.cronPattern, schedule.task, {
      timezone: 'UTC',
      scheduled: true,
    })
    console.log(`Scheduled ${schedule.name} task with seconds precision`)
  } else {
    // Regular minute-level scheduling
    cron.schedule(schedule.cronPattern, schedule.task)
    console.log(`Scheduled ${schedule.name} task`)
  }
})

console.log('All cron jobs have been set up.')
