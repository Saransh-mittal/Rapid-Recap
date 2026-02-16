const mongoose = require('mongoose')

const soloDrillSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  forgeArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FORGE_ARTICLE',
    required: true,
  },

  // Progress tracking (mirrors existing session patterns)
  forgeProgress: {
    // Which section user is currently on (0-4)
    currentSection: { type: Number, default: 0, min: 0, max: 20 },
    // Which sections have been unlocked (array of section numbers)
    unlockedSections: { type: [Number], default: [] },
    // Tracks where Oracle's Eye was already used (max once per forge question)
    oracleUsedSections: { type: [Number], default: [] },
    // Responses to section MCQs
    responses: [
      {
        sectionNumber: { type: Number, required: true },
        userAnswer: { type: Number, required: true }, // 0-3
        isCorrect: { type: Boolean, required: true },
        timeSpent: { type: Number, default: 0 },
        answeredAt: { type: Date, default: Date.now },
        scoreBreakdown: {
          base: { type: Number, default: 0 },
          speedBonus: { type: Number, default: 0 },
          streakBonus: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
        },
      },
    ],
    // Global time tracking
    globalStartTime: Date,
    globalEndTime: Date,
    totalTimeAllowed: { type: Number, default: 100000 }, // 100 seconds
    sectionTimings: [
      {
        sectionNumber: Number,
        questionStartTime: Date,
        questionAnsweredTime: Date,
        questionTimeSpent: Number,
        readingStartTime: Date,
        readingEndTime: Date,
        readingTimeSpent: Number,
      },
    ],
    // Overall forge session stats
    startTime: Date,
    endTime: Date,
    totalTimeSpent: Number,
    correctAnswers: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    baseScore: { type: Number, default: 0 },
    speedBonusTotal: { type: Number, default: 0 },
    streakBonusTotal: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },

  quizAttempt: {
    startTime: Date,
    endTime: Date,
    responses: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        userAnswer: String,
        isCorrect: Boolean,
        timeSpent: Number,
      },
    ],
    answerMappings: { type: Object, default: {} },
    selectedQuestionIds: { type: [String], default: [] },
    shuffledOptions: { type: Object, default: {} },
    // Tracks where Oracle's Eye was already used (max once per quiz question)
    oracleUsedQuestionIds: { type: [String], default: [] },
    timeSpent: Number,
    completed: { type: Boolean, default: false },
  },

  // Powerup loadout (30 housing max, unlimited access to all powerup types)
  loadout: [
    {
      powerupId: { type: String, required: true },
      type: {
        type: String,
        enum: [
          'active',
          'passive',
          'TIME_WARP',
          'SCORE_SURGE',
          'ORACLES_EYE',
          'STREAK_SHIELD',
          'PRECISION_PROTOCOL',
        ],
      },
      cost: { type: Number, required: true },
      phase: { type: String, enum: ['forge', 'quiz', 'both'] },
    },
  ],
  activePowerups: [
    {
      powerupId: String,
      type: { type: String },
      cost: Number,
      phase: String,
      used: { type: Boolean, default: false },
      usedAt: Date,
      effectApplied: { type: Boolean, default: false },
    },
  ],
  loadoutHousingUsed: { type: Number, default: 0, max: 30 },

  // Scoring
  forgeScore: { type: Number, default: 0 },
  quizScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  benchmark: {
    type: String,
    enum: ['rookie', 'bronze', 'silver', 'gold', 'diamond'],
  },

  // Source tracking
  source: {
    type: String,
    enum: ['daily_free', 'purchased', 'custom'],
    default: 'daily_free',
  },

  // Original user text (custom drills only)
  customInput: { type: String },

  // Timing
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,

  // Status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
})

// Indexes
soloDrillSessionSchema.index({ user: 1, createdAt: -1 })
soloDrillSessionSchema.index({ status: 1 })

const SoloDrillSession = mongoose.model(
  'SOLO_DRILL_SESSION',
  soloDrillSessionSchema
)

module.exports = SoloDrillSession
