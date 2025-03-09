// model/quickClashSchemas/quickClashMatchmakingSchema.js
const mongoose = require('mongoose')

const quickClashMatchmakingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
    index: true,
  },
  isBot: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['available', 'in_challenge', 'offline'],
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
})

// Create indexes for efficient queries
quickClashMatchmakingSchema.index({ status: 1 })
quickClashMatchmakingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // Auto-remove expired entries
quickClashMatchmakingSchema.index({ user: 1 }, { unique: true }) // One entry per user

const QuickClashMatchmaking = mongoose.model(
  'QUICK_CLASH_MATCHMAKING',
  quickClashMatchmakingSchema,
)

module.exports = QuickClashMatchmaking
