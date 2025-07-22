// setupCronJobs.js
const cron = require('node-cron')
const schedules = require('./scheduleConfig')
const cacheSchedules = require('./cacheScheduleConfig')
const vectorSchedules = require('./vectorScheduleConfig')
const demotionSchedules = require('./demotionScheduleConfig')
const quickClashSchedules = require('./quickClashScheduleConfig')
// const indoPakSchedules = require('./indoPakScheduleConfig')
const aiNewsSchedules = require('./aiScheduleConfig')

// Setup regular schedules
schedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(
    `Scheduled ${schedule.name} task for ${schedule?.time?.format(
      'HH:mm',
    )} UTC`,
  )
})

// Setup cache maintenance schedules
cacheSchedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(`Scheduled ${schedule.name} task`)
})

// Setup vector maintenance schedules
vectorSchedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(`Scheduled ${schedule.name} task`)
})

// Setup demotion schedules
demotionSchedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task, {
    timezone: 'UTC',
    scheduled: true,
  })
  console.log(`Scheduled ${schedule.name} task`)
})

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

// indoPakSchedules.forEach(schedule => {
//   cron.schedule(schedule.cronPattern, schedule.task)
//   console.log(`Scheduled ${schedule.name} task`)
// })

aiNewsSchedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(`Scheduled ${schedule.name} task`)
})

console.log('All cron jobs have been set up.')
