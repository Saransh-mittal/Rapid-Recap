// model/quickClashSchemas/quickClashGlobalMatchmakingSchema.js
const mongoose = require('mongoose')

const quickClashGlobalMatchmakingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['available', 'processing', 'matched', 'in_battle', 'offline'],
    default: 'available',
  },
  trophies: {
    type: Number,
    default: 1000,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM',
    default: null,
  },
  battle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM_BATTLE',
    default: null,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

// Create indexes for efficient queries
quickClashGlobalMatchmakingSchema.index({ status: 1, trophies: 1 })
quickClashGlobalMatchmakingSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
) // Auto-remove expired entries
quickClashGlobalMatchmakingSchema.index({ user: 1 }, { unique: true }) // One entry per user
quickClashGlobalMatchmakingSchema.index({ createdAt: 1 })

const QuickClashGlobalMatchmaking = mongoose.model(
  'QUICK_CLASH_GLOBAL_MATCHMAKING',
  quickClashGlobalMatchmakingSchema,
)

module.exports = QuickClashGlobalMatchmaking
