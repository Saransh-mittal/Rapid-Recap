const mongoose = require('mongoose')

const notificationPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
    unique: true,
  },
  newsNotifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: Number, // notifications per day
      default: 5, // Default to 5 news notifications per day
      min: 0,
      max: 10,
    },
  },
  quickClashNotifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: String, // 'all', 'important', 'none'
      default: 'all',
      enum: ['all', 'important', 'none'],
    },
  },
  tournamentNotifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: String, // 'all', 'important', 'none'
      default: 'all',
      enum: ['all', 'important', 'none'],
    },
  },
  dailyStreakReminders: {
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
})

notificationPreferencesSchema.pre('save', function (next) {
  this.updated = Date.now()
  next()
})

const NotificationPreferences = mongoose.model(
  'NOTIFICATION_PREFERENCES',
  notificationPreferencesSchema,
)

module.exports = NotificationPreferences
