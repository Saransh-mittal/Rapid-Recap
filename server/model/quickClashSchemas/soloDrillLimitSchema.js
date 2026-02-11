const mongoose = require('mongoose')

const soloDrillLimitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
    unique: true,
  },

  // Daily tracking
  dailyDrillsUsed: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: Date.now },

  // Purchased extra drills (don't expire)
  purchasedDrillsRemaining: { type: Number, default: 0 },

  // Purchase history
  purchaseHistory: [
    {
      purchasedAt: { type: Date, default: Date.now },
      drillsBought: { type: Number, default: 5 },
      coinsCost: { type: Number, default: 50 },
    },
  ],

  // Stats
  totalDrillsCompleted: { type: Number, default: 0 },
  totalCoinSpent: { type: Number, default: 0 },
})

// Indexes
soloDrillLimitSchema.index({ user: 1 })

const SoloDrillLimit = mongoose.model('SOLO_DRILL_LIMIT', soloDrillLimitSchema)

module.exports = SoloDrillLimit
