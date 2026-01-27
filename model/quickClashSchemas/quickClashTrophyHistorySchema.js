// model/quickClashSchemas/quickClashTrophyHistorySchema.js
const mongoose = require('mongoose')

const quickClashTrophyHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
    index: true,
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_CHALLENGE',
    required: true,
  },
  trophiesChange: {
    type: Number,
    required: true,
  },
  trophiesAfter: {
    type: Number, // Total trophies after this change
    required: true,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  opponentTrophies: {
    type: Number, // Opponent's trophies before the match
    required: true,
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'tie', 'bet_placed', 'bet_won', 'bet_lost', 'bet_returned'],
    required: true,
  },
  protectionUsed: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create compound index for efficient lookups
quickClashTrophyHistorySchema.index({ user: 1, createdAt: -1 })

const QuickClashTrophyHistory = mongoose.model(
  'QUICK_CLASH_TROPHY_HISTORY',
  quickClashTrophyHistorySchema,
)

module.exports = QuickClashTrophyHistory
