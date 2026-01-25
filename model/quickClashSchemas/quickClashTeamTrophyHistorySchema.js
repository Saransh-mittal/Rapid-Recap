// model/quickClashSchemas/quickClashTeamTrophyHistorySchema.js
const mongoose = require('mongoose')

const quickClashTeamTrophyHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false, // Not required - can be sessionPlayer instead
    index: true,
  },
  sessionPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SESSION_PLAYER',
    required: false, // Not required - can be user instead
    index: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM',
    required: true,
  },
  teamBattle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM_BATTLE',
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
  opponentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_TEAM',
    required: true,
  },
  opponentTeamAvgTrophies: {
    type: Number, // Opponent team's average trophies
    required: true,
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'tie'],
    required: true,
  },
  bonusesApplied: {
    strongerTeam: Boolean,
    allWins: Boolean,
  },
  userParticipated: {
    type: Boolean,
    default: true,
  },
  userCompleted: {
    type: Boolean,
    default: false,
  },
  userScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Pre-validate hook to ensure at least one of user or sessionPlayer is set
quickClashTeamTrophyHistorySchema.pre('validate', function (next) {
  if (!this.user && !this.sessionPlayer) {
    next(new Error('Either user or sessionPlayer is required'))
  } else {
    next()
  }
})

// Create compound index for efficient lookups
quickClashTeamTrophyHistorySchema.index({ user: 1, createdAt: -1 })
quickClashTeamTrophyHistorySchema.index({ sessionPlayer: 1, createdAt: -1 })
quickClashTeamTrophyHistorySchema.index({ team: 1, createdAt: -1 })
quickClashTeamTrophyHistorySchema.index({ teamBattle: 1 })

const QuickClashTeamTrophyHistory = mongoose.model(
  'QUICK_CLASH_TEAM_TROPHY_HISTORY',
  quickClashTeamTrophyHistorySchema,
)

module.exports = QuickClashTeamTrophyHistory

