// services/notificationService.js

const webpush = require('web-push')
const Subscription = require('../model/subscriptionSchema')
const NotificationPreferences = require('../model/notificationPreferencesSchema')

/**
 * Check if a notification should be sent based on user preferences
 * @param {Object} options - options object
 * @param {string} options.userId - ID of the user
 * @param {string} options.type - Type of notification ('news', 'quickClash', 'tournament', etc)
 * @param {string} [options.importance='normal'] - Importance level of notification ('important' or 'normal')
 * @returns {Promise<boolean>} - Whether the notification should be sent
 */
async function shouldSendNotification({ userId, type, importance = 'normal' }) {
  try {
    // Look up user preferences
    const preferences = await NotificationPreferences.findOne({ userId })

    // If no preferences, use defaults (allow all)
    if (!preferences) return true

    // Check based on notification type
    if (type === 'news') {
      // For news, check enabled status
      if (!preferences.newsNotifications.enabled) return false

      // Check daily count (this would need to be tracked separately)
      // This is simplified here - in production, implement a counter
      return true
    } else if (type === 'quickClash') {
      // For quick clash, check enabled first
      if (!preferences.quickClashNotifications.enabled) return false

      // Check frequency setting
      const frequency = preferences.quickClashNotifications.frequency
      if (frequency === 'none') return false
      if (frequency === 'important' && importance !== 'important') return false

      return true
    } else if (type === 'tournament') {
      // For tournament, check enabled first
      if (!preferences.tournamentNotifications.enabled) return false

      // Check frequency setting
      const frequency = preferences.tournamentNotifications.frequency
      if (frequency === 'none') return false
      if (frequency === 'important' && importance !== 'important') return false

      return true
    } else if (type === 'streak' && !preferences.dailyStreakReminders.enabled) {
      return false
    }

    // For other types or if no match, default to allowing
    return true
  } catch (error) {
    console.error('Error checking notification preferences:', error)
    // Default to allow on error
    return true
  }
}

async function sendNotification({
  title,
  body,
  icon,
  url,
  image,
  userId,
  messageId,
  type = 'news',
  importance = 'normal',
}) {
  try {
    // Check if we should send based on user preferences
    const shouldSend = await shouldSendNotification({
      userId,
      type,
      importance,
    })
    if (!shouldSend) {
      console.log(
        `Notification suppressed due to user preferences (type: ${type}, userId: ${userId})`,
      )
      return
    }

    const subscriptions = await Subscription.find({ userId })
    for (let subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, icon, url, image, messageId }),
        )
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription has expired or is no longer valid, remove it from the database
          await Subscription.deleteOne({ _id: subscription._id })
          console.log(`Deleted subscription ${subscription._id}`)
        } else {
          console.log(error)
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = { sendNotification, shouldSendNotification }
