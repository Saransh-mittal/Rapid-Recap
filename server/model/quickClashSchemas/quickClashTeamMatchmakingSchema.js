// model/quickClashSchemas/quickClashTeamMatchmakingSchema.js
const mongoose = require('mongoose')

const quickClashTeamMatchmakingSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['available', 'matching', 'in_battle', 'offline'],
    default: 'available',
  },
  preferredCategories: [
    {
      type: String,
    },
  ],
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
  avgTrophies: {
    type: Number,
    default: 0,
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  matchingAttempts: {
    type: Number,
    default: 0,
  },
  // Flag to indicate if bots should be added to reach 4 members
  allowBots: {
    type: Boolean,
    default: true,
  },
})

// Create indexes for efficient queries
quickClashTeamMatchmakingSchema.index({ status: 1, avgTrophies: 1 })
quickClashTeamMatchmakingSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
) // Auto-remove expired entries
quickClashTeamMatchmakingSchema.index({ team: 1 }, { unique: true }) // One entry per team
quickClashTeamMatchmakingSchema.index({ memberCount: 1, status: 1 })

const QuickClashTeamMatchmaking = mongoose.model(
  'QUICK_CLASH_TEAM_MATCHMAKING',
  quickClashTeamMatchmakingSchema,
)

module.exports = QuickClashTeamMatchmaking
