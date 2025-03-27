const NotificationPreferences = require('../model/notificationPreferencesSchema')
const asyncHandler = require('express-async-handler')

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notify/preferences
 * @access  Private
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id

  let preferences = await NotificationPreferences.findOne({ userId })

  // If no preferences found, create default preferences
  if (!preferences) {
    preferences = await NotificationPreferences.create({ userId })
  }

  res.status(200).json(preferences)
})

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/notify/preferences
 * @access  Private
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const updates = req.body

  // Find and update the preferences
  let preferences = await NotificationPreferences.findOne({ userId })

  // If no preferences found, create with the provided updates
  if (!preferences) {
    preferences = await NotificationPreferences.create({
      userId,
      ...updates,
    })
  } else {
    // Otherwise update the existing preferences
    // Only update fields that are provided
    if (updates.newsNotifications) {
      preferences.newsNotifications = {
        ...preferences.newsNotifications,
        ...updates.newsNotifications,
      }
    }

    if (updates.quickClashNotifications) {
      preferences.quickClashNotifications = {
        ...preferences.quickClashNotifications,
        ...updates.quickClashNotifications,
      }
    }

    if (updates.tournamentNotifications) {
      preferences.tournamentNotifications = {
        ...preferences.tournamentNotifications,
        ...updates.tournamentNotifications,
      }
    }

    if (updates.hasOwnProperty('dailyStreakReminders')) {
      preferences.dailyStreakReminders = updates.dailyStreakReminders
    }

    await preferences.save()
  }

  res.status(200).json(preferences)
})

module.exports = {
  getNotificationPreferences,
  updateNotificationPreferences,
}
