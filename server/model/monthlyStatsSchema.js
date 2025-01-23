const mongoose = require('mongoose')

const monthlyStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },

    // Leaderboard Core Stats
    finalRank: {
      type: Number,
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    // Key Performance Metrics
    iqScore: {
      start: {
        type: Number,
        required: true,
      },
      final: {
        type: Number,
        required: true,
      },
      peak: {
        type: Number,
        required: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: Number,
      required: true,
    },
    rqmScore: {
      average: {
        type: Number,
        required: true,
      },
      highest: {
        type: Number,
        required: true,
      },
    },
    quizStats: {
      total: {
        type: Number,
        required: true,
      },
      perfectScores: {
        type: Number,
        default: 0,
      },
    },

    // Additional Stats
    society: {
      type: String,
      required: true,
    },
    circle: String,

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
monthlyStatsSchema.index({ user: 1, year: 1, month: 1 }, { unique: true })
monthlyStatsSchema.index({ year: 1, month: 1, finalRank: 1 })
monthlyStatsSchema.index({ year: 1, month: 1, 'rqmScore.average': -1 })
monthlyStatsSchema.index({ year: 1, month: 1, 'iqScore.final': -1 })

const MonthlyStats = mongoose.model('MonthlyStats', monthlyStatsSchema)

module.exports = MonthlyStats
