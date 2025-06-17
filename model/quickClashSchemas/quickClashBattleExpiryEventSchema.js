// model/quickClashSchemas/quickClashBattleExpiryEventSchema.js
const mongoose = require('mongoose')

const quickClashBattleExpiryEventSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM_BATTLE',
    required: true,
    index: true, // Fast lookups by battle ID
  },
  eventType: {
    type: String,
    enum: ['battle_completion', 'battle_warning'], // Extendable for future events
    default: 'battle_completion',
    required: true,
  },
  executeAt: {
    type: Date,
    required: true,
    index: true, // Critical for time-based queries
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true, // Fast status filtering
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  // Track retry attempts for robust error handling
  retryCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
    default: null,
  },
})

// TTL index: Auto-delete completed events after 7 days (cleanup)
// Why 7 days? Gives us a week of history for debugging
quickClashBattleExpiryEventSchema.index(
  { processedAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days
    partialFilterExpression: { status: 'completed' },
  },
)

// Compound index for efficient worker queries
quickClashBattleExpiryEventSchema.index({
  executeAt: 1,
  status: 1,
})

// Ensure one event per battle (prevents duplicates)
quickClashBattleExpiryEventSchema.index(
  { battleId: 1, eventType: 1 },
  { unique: true },
)

const QuickClashBattleExpiryEvent = mongoose.model(
  'QUICK_CLASH_BATTLE_EXPIRY_EVENT',
  quickClashBattleExpiryEventSchema,
)

module.exports = QuickClashBattleExpiryEvent
