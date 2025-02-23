// models/quickClashChallengeSchema.js
const mongoose = require('mongoose')

const quickClashChallengeSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
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
quickClashChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
quickClashChallengeSchema.index({ challenger: 1, status: 1 })
quickClashChallengeSchema.index({ opponent: 1, status: 1 })

const QuickClashChallenge = mongoose.model(
  'QUICK_CLASH_CHALLENGE',
  quickClashChallengeSchema,
)

module.exports = QuickClashChallenge
