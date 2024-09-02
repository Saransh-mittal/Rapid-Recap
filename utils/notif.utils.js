const cron = require('node-cron')
const moment = require('moment') // Install moment for date manipulation: npm install moment
const { sendNotification } = require('../services/notificationService')

const tasks = {} // Store scheduled tasks here

const scheduleNotif = ({ userId, title, body, image, delayMinutes }) => {
  const now = new Date()
  const sendTime = new Date(now.getTime() + delayMinutes * 60000)

  // Check if the sendTime is within the same day
  if (moment(sendTime).isSame(now, 'day')) {
    const minute = sendTime.getMinutes()
    const hour = sendTime.getHours()
    const dayOfMonth = sendTime.getDate()
    const month = sendTime.getMonth() + 1 // getMonth() returns 0-based month
    const dayOfWeek = '*' // Run the task regardless of the day of the week

    const cronPattern = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    const task = cron.schedule(cronPattern, async () => {
      await sendNotification({
        userId,
        title,
        body,
        image,
      })
    })

    // Ensure the user has a tasks object
    if (!tasks[userId]) {
      tasks[userId] = {}
    }

    tasks[userId][delayMinutes] = task
  }
}

const cancelScheduledNotif = userId => {
  if (tasks[userId]) {
    Object.values(tasks[userId]).forEach(task => task.stop())
    delete tasks[userId]
  }
}

module.exports = { scheduleNotif, cancelScheduledNotif }
