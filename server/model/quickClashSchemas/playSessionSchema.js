// model/quickClashSchemas/playSessionSchema.js
// Spark Engine - PlaySession for frictionless viral invites
const mongoose = require('mongoose')
const crypto = require('crypto')

const playSessionSchema = new mongoose.Schema(
  {
    // Unique session identifier (stored in localStorage)
    // Generated automatically by pre-save hook
    sessionId: {
      type: String,
      unique: true,
    },
    // User-chosen in-game name
    inGameName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 16,
    },
    // Game progression
    trophies: {
      type: Number,
      default: 1000,
    },
    // Stats tracking
    stats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      totalMatches: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      peakTrophies: { type: Number, default: 1000 },
    },
    // Current team (if any)
    currentTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM',
      default: null,
    },
    // Timestamps
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    // Conversion tracking - null until converted to full account
    convertedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    // Device fingerprint for return visits
    deviceFingerprint: {
      type: String,
      default: null,
    },
    // Track invite source
    invitedByTeam: {
      type: String, // Team code
      default: null,
    },
    invitedBySession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PLAY_SESSION',
      default: null,
    },
    // Streak tracking for daily return habit
    streak: {
      dayStreak: { type: Number, default: 0 },
      lastPlayedDate: { type: Date, default: null },
      longestStreak: { type: Number, default: 0 },
    },
    // Coins - earned from completing quizzes
    coins: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'PlaySessions',
  }
)

// Generate unique session ID before saving
playSessionSchema.pre('save', async function (next) {
  if (this.isNew && !this.sessionId) {
    // Generate a unique 24-character session ID
    const generateSessionId = () => {
      return crypto.randomBytes(12).toString('hex')
    }

    let sessionId = generateSessionId()
    let idExists = true
    let attempts = 0

    while (idExists && attempts < 10) {
      const existing = await mongoose
        .model('PLAY_SESSION')
        .findOne({ sessionId })
      if (!existing) {
        idExists = false
      } else {
        sessionId = generateSessionId()
        attempts++
      }
    }

    this.sessionId = sessionId
  }
  next()
})

// Update lastActiveAt on any activity
playSessionSchema.methods.touch = async function () {
  this.lastActiveAt = new Date()
  return this.save()
}

// Update stats after a match
playSessionSchema.methods.updateStats = async function (matchResult) {
  const { won, score, trophyChange } = matchResult

  this.stats.totalMatches += 1
  this.stats.totalScore += score
  this.stats.avgScore = Math.round(this.stats.totalScore / this.stats.totalMatches)

  if (won) {
    this.stats.wins += 1
  } else {
    this.stats.losses += 1
  }

  // Update trophies
  this.trophies = Math.max(0, this.trophies + trophyChange)
  if (this.trophies > this.stats.peakTrophies) {
    this.stats.peakTrophies = this.trophies
  }

  this.lastActiveAt = new Date()
  return this.save()
}

// Indexes
playSessionSchema.index({ sessionId: 1 })
playSessionSchema.index({ inGameName: 1 })
playSessionSchema.index({ deviceFingerprint: 1 })
playSessionSchema.index({ currentTeamId: 1 })
playSessionSchema.index({ convertedToUser: 1 })
playSessionSchema.index({ lastActiveAt: -1 })

const PlaySession = mongoose.model('PLAY_SESSION', playSessionSchema)

module.exports = PlaySession
