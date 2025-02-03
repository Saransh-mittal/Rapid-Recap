const cron = require('node-cron')
const moment = require('moment') // Install moment for date manipulation: npm install moment
const { mailTransporter } = require('../utils/mail.utils')

const tasks = {} // Store scheduled tasks here

const scheduleEmail = ({
  userId,
  userEmail,
  delayMinutes,
  mailHtml,
  subject,
}) => {
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
      const transporter = await mailTransporter()
      await transporter.sendMail({
        from: 'rapidrecap2k23@gmail.com',
        to: userEmail,
        subject,
        html: mailHtml,
      })
      delete tasks[userId][delayMinutes] // Remove the task after execution
    })

    // Ensure the user has a tasks object
    if (!tasks[userId]) {
      tasks[userId] = {}
    }

    tasks[userId][delayMinutes] = task
  }
}

const cancelScheduledEmails = userId => {
  if (tasks[userId]) {
    Object.values(tasks[userId]).forEach(task => task.stop())
    delete tasks[userId]
  }
}

const scheduleDayEndEmail = ({
  userId,
  userEmail,
  beforeMin,
  mailHtml,
  subject,
}) => {
  const now = moment.utc()
  //const endOfDay = moment.utc().endOf("day").subtract(beforehour, "hours");
  const endOfDay = moment.utc().endOf('day')
  const sendTime = endOfDay.subtract(beforeMin, 'minutes')

  if (now.isBefore(sendTime)) {
    const utcTime = moment.utc(sendTime)

    // Convert to local time
    const localTime = utcTime.local()
    const minute = localTime.minute()
    const hour = localTime.hour()
    const dayOfMonth = localTime.date()
    const month = localTime.month() + 1 // month() returns 0-based month
    const dayOfWeek = '*' // Run the task regardless of the day of the week

    const cronPattern = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    //console.log(cronPattern);
    const task = cron.schedule(cronPattern, async () => {
      const transporter = await mailTransporter()
      await transporter.sendMail({
        from: 'rapidrecap2k23@gmail.com',
        to: userEmail,
        subject,
        html: mailHtml,
      })
      delete tasks[userId].daily // Remove the task after execution
    })

    // Ensure the user has a tasks object
    if (!tasks[userId]) {
      tasks[userId] = {}
    }

    tasks[userId].daily = task
  }
}

module.exports = { scheduleEmail, cancelScheduledEmails, scheduleDayEndEmail }
