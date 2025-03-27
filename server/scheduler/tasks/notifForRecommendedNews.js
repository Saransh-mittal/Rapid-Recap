const { sendNotification } = require('../../services/notificationService')
const {
  getRecommendationsForNotification,
} = require('../../services/recommendationService')
const User = require('../../model/userSchema')
const Article = require('../../model/articleSchema')
const NotificationPreferences = require('../../model/notificationPreferencesSchema')
const slugify = require('slugify')

// In-memory counter for tracking daily notifications per user
// In a production environment, this should be persisted (Redis, DB, etc.)
let dailyNotificationCounts = {}

// Reset counters at midnight
function resetCounters() {
  dailyNotificationCounts = {}
  console.log('Daily notification counters reset')
}

// Schedule reset at midnight
const scheduleReset = () => {
  const now = new Date()
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0,
    0,
    0, // at midnight
  )
  const msToMidnight = night.getTime() - now.getTime()

  setTimeout(() => {
    resetCounters()
    scheduleReset() // Schedule the next reset
  }, msToMidnight)
}

// Initialize the reset schedule
scheduleReset()

async function sendRecommendedNewsNotification() {
  console.log('Processing users for recommendations')
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      inGameName: { $exists: true },
    }).select('_id userLanguage')

    // Get all user preferences in one query to avoid multiple DB hits
    const allPreferences = await NotificationPreferences.find({
      userId: { $in: users.map(user => user._id) },
    })

    // Create a map for faster lookup
    const preferencesMap = allPreferences.reduce((map, pref) => {
      map[pref.userId.toString()] = pref
      return map
    }, {})

    for (const user of users) {
      const userId = user._id.toString()

      // Get user preferences or use defaults
      const preferences = preferencesMap[userId] || {
        newsNotifications: { enabled: true, frequency: 5 },
      }

      // Skip if notifications are disabled
      if (!preferences.newsNotifications.enabled) {
        continue
      }

      // Initialize counter for this user if not exists
      if (!dailyNotificationCounts[userId]) {
        dailyNotificationCounts[userId] = 0
      }

      // Skip if user has reached their daily limit
      if (
        dailyNotificationCounts[userId] >=
        preferences.newsNotifications.frequency
      ) {
        continue
      }

      const recommendation = await getRecommendationsForNotification(
        user._id,
        20,
      )
      if (recommendation) {
        const article = await Article.findById(recommendation._id)
        if (article) {
          const title =
            user?.userLanguage === 'hi' && article?.hindiTitle
              ? article.hindiTitle
              : article.title
          const url = `https://rapidrecap.ai/article/${article._id}/${slugify(
            article.title,
          )}`
          const image =
            article.imgURL && article.imgURL.length > 0
              ? article.imgURL[0]
              : null

          await sendNotification({
            userId: user._id,
            title,
            url,
            image,
            type: 'news',
            importance: 'normal',
          })

          // Increment the notification count for this user
          dailyNotificationCounts[userId]++
        }
      }
    }
    console.log('Processed recommendations for all users')
  } catch (error) {
    console.error('Error processing users for recommendations:', error)
  }
}

module.exports = sendRecommendedNewsNotification
