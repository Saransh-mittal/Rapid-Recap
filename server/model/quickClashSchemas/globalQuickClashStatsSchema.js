// model/quickClashSchemas/globalQuickClashStatsSchema.js
const mongoose = require('mongoose')

const globalQuickClashStatsSchema = new mongoose.Schema(
  {
    statsType: {
      type: String,
      required: true,
      unique: true,
      enum: ['global_rqm', 'trophy_distribution', 'player_counts'],
    },

    // RQM Statistics
    rqmStats: {
      globalAverage: {
        type: Number,
        default: 0,
      },
      highestAverage: {
        type: Number,
        default: 0,
      },
      medianRQM: {
        type: Number,
        default: 0,
      },
      totalPlayersWithRQM: {
        type: Number,
        default: 0,
      },
      // Distribution percentiles for user ranking
      percentiles: {
        p10: { type: Number, default: 0 },
        p25: { type: Number, default: 0 },
        p50: { type: Number, default: 0 },
        p75: { type: Number, default: 0 },
        p90: { type: Number, default: 0 },
        p95: { type: Number, default: 0 },
        p99: { type: Number, default: 0 },
      },
    },

    // Trophy Statistics (bonus data)
    trophyStats: {
      averageTrophies: {
        type: Number,
        default: 1000,
      },
      highestTrophies: {
        type: Number,
        default: 1000,
      },
      totalPlayers: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    calculationDuration: {
      type: Number, // in milliseconds
      default: 0,
    },
    dataSource: {
      type: String,
      default: 'background_task',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'GlobalQuickClashStats',
  },
)

// Indexes for fast retrieval
globalQuickClashStatsSchema.index({ statsType: 1 })
globalQuickClashStatsSchema.index({ lastUpdated: -1 })

const GlobalQuickClashStats = mongoose.model(
  'GLOBAL_QUICK_CLASH_STATS',
  globalQuickClashStatsSchema,
)

module.exports = GlobalQuickClashStats
