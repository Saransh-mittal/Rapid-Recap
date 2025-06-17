// model/quickClashSchemas/quickClashChallengeSchema.js
const mongoose = require('mongoose')

const quickClashChallengeSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false, // Changed to false since team battle challenges start without a challenger
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false, // Changed to false since team battle challenges start without an opponent
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
  // NEW: Team battle related fields
  fromTeamBattle: {
    type: Boolean,
    default: false,
  },
  teamBattle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM_BATTLE',
    default: null,
  },
  // Potential trophy exchanges - calculated at challenge creation
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
  // Actual trophy updates - added after challenge completion
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
quickClashChallengeSchema.index({ teamBattle: 1 }) // NEW: Index for team battle lookup

const QuickClashChallenge = mongoose.model(
  'QUICK_CLASH_CHALLENGE',
  quickClashChallengeSchema,
)

module.exports = QuickClashChallenge
