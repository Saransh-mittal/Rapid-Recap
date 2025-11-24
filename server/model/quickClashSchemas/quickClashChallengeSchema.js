// model/quickClashSchemas/quickClashChallengeSchema.js
const mongoose = require('mongoose')

const quickClashChallengeSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false,
  },
  selectedCategories: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired', 'rejected'],
    default: 'pending',
  },
  // Regular article (for traditional Quick Clash)
  article: {
    title: {
      english: String,
      hindi: String,
    },
    content: {
      english: String,
      hindi: String,
    },
    sourceArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ARTICLE',
      },
    ],
  },
  // NEW: Forge article reference (for active reading mode)
  // If present, this challenge uses Forge Mode instead of traditional reading
  forgeArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FORGE_ARTICLE',
    default: null,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
  },
  challengerScore: {
    type: Number,
    default: 0,
  },
  opponentScore: {
    type: Number,
    default: 0,
  },
  challengerAttempted: {
    type: Boolean,
    default: false,
  },
  opponentAttempted: {
    type: Boolean,
    default: false,
  },
  revengeStatus: {
    type: Boolean,
    default: false,
  },
  fromMatchmaking: {
    type: Boolean,
    default: false,
  },
  fromTeamBattle: {
    type: Boolean,
    default: false,
  },
  teamBattle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM_BATTLE',
    default: null,
  },
  trophyPotential: {
    challenger: {
      currentTrophies: Number,
      potentialGain: Number,
      potentialLoss: Number,
    },
    opponent: {
      currentTrophies: Number,
      potentialGain: Number,
      potentialLoss: Number,
    },
  },
  trophyUpdates: {
    challenger: {
      previousTrophies: Number,
      newTrophies: Number,
      change: Number,
    },
    opponent: {
      previousTrophies: Number,
      newTrophies: Number,
      change: Number,
    },
    isTie: Boolean,
    protectionApplied: {
      challenger: Boolean,
      challenger_type: String,
      opponent: Boolean,
      opponent_type: String,
    },
  },
  // NEW: Betting Mechanism
  betting: {
    enabled: {
      type: Boolean,
      default: true,
    },
    challenger: {
      betAmount: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 5, 10],
      },
      betPlaced: {
        type: Boolean,
        default: false,
      },
      betPlacedAt: Date,
      trophiesAtBet: Number,
      betResult: {
        type: String,
        enum: ['won', 'lost', 'returned'],
      },
      trophiesGained: Number,
    },
    opponent: {
      betAmount: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 5, 10],
      },
      betPlaced: {
        type: Boolean,
        default: false,
      },
      betPlacedAt: Date,
      trophiesAtBet: Number,
      betResult: {
        type: String,
        enum: ['won', 'lost', 'returned'],
      },
      trophiesGained: Number,
    },
    settled: {
      type: Boolean,
      default: false,
    },
    settledAt: Date,
  },
  winProbability: {
    challenger: {
      probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      effectiveRating: Number,
      components: {
        trophyBase: Number,
        performanceMod: Number,
        consistencyMod: Number,
      },
      dataQuality: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      sampleSize: Number,
    },
    opponent: {
      probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      effectiveRating: Number,
      components: {
        trophyBase: Number,
        performanceMod: Number,
        consistencyMod: Number,
      },
      dataQuality: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      sampleSize: Number,
    },
    calculatedAt: Date,
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

// Indexes for quick lookups and expiry
quickClashChallengeSchema.index({ expiresAt: 1 })
quickClashChallengeSchema.index({ challenger: 1, status: 1 })
quickClashChallengeSchema.index({ opponent: 1, status: 1 })
quickClashChallengeSchema.index({ teamBattle: 1 })
quickClashChallengeSchema.index({ 'winProbability.calculatedAt': -1 })
// NEW: Index for forge article lookup
quickClashChallengeSchema.index({ forgeArticle: 1 })

const QuickClashChallenge = mongoose.model(
  'QUICK_CLASH_CHALLENGE',
  quickClashChallengeSchema,
)

module.exports = QuickClashChallenge
