// setupCronJobs.js
const cron = require('node-cron')
const schedules = require('./scheduleConfig')
const cacheSchedules = require('./cacheScheduleConfig')

schedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(
    `Scheduled ${schedule.name} task for ${schedule?.time?.format(
      'HH:mm',
    )} UTC`,
  )
})

cacheSchedules.forEach(schedule => {
  cron.schedule(schedule.cronPattern, schedule.task)
  console.log(`Scheduled ${schedule.name} task`)
})

console.log('All cron jobs have been set up.')
