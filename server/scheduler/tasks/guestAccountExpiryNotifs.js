const fs = require('fs').promises
const path = require('path')
const moment = require('moment-timezone')

const { sendNotification } = require('../../services/notificationService')
const User = require('../../model/userSchema')

async function loadNotificationConfig() {
  const configPath = path.join(
    __dirname,
    '../../data/guestAccountNotifications.json',
  )
  const configData = await fs.readFile(configPath, 'utf8')
  return JSON.parse(configData)
}

async function sendGuestAccountExpiryNotifs() {
  console.log('Processing guest accounts for expiry notifications')
  try {
    const notificationConfig = await loadNotificationConfig()
    const currentDate = moment().tz('Asia/Kolkata')

    const guests = await User.find({
      role: 'guest',
      expiresAt: {
        $gt: currentDate.toDate(),
        $lte: currentDate.clone().add(7, 'days').toDate(),
      },
    })

    for (const guest of guests) {
      const daysUntilExpiry = moment(guest.expiresAt).diff(currentDate, 'days')
      let notifications

      if (daysUntilExpiry === 0) {
        notifications = notificationConfig.notifications.day_7
      } else if (daysUntilExpiry === 1) {
        notifications = notificationConfig.notifications.day_6
      } else {
        notifications = notificationConfig.notifications.day_1_to_5
      }

      for (const notification of notifications) {
        const notificationTime = moment.tz(
          `${currentDate.format('YYYY-MM-DD')} ${notification.time}`,
          'YYYY-MM-DD hh:mm A',
          'Asia/Kolkata',
        )

        if (currentDate.isSame(notificationTime, 'minute')) {
          await sendNotification({
            userId: guest._id,
            title: notification.subject,
            body: notification.body,
            url: 'https://rapidrecap.ai',
          })
          console.log(`Sent expiry notification to guest ${guest._id}`)
        }
      }
    }
  } catch (error) {
    console.error(
      'Error processing guest accounts for expiry notifications:',
      error,
    )
  }
}

module.exports = sendGuestAccountExpiryNotifs
