// model/quizAttemptSchema.js (Updated)
const mongoose = require('mongoose')

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ARTICLE',
    required: true,
  },
  articleQuizSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ARTICLE_QUIZ_SESSION',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUIZ',
  },

  // NEW: Game hub related fields
  gameData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GAME_DATA',
  },
  gameType: {
    type: String,
    enum: ['normal_quiz', 'true_false', 'word_weaver', 'connections'],
    default: 'normal_quiz',
  },

  // Enhanced responses to support different game types
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      // Normal quiz & True/False
      userAnswer: {
        type: String,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
      // Word Weaver
      userWord: String,
      skipped: {
        type: Boolean,
        default: false,
      },
      // Connections
      connections: [
        {
          from: String,
          to: String,
          isValid: Boolean,
        },
      ],
    },
  ],

  // Performance metrics for enhanced games
  performance: {
    accuracy: Number,
    difficulty: Number,
    correctCount: Number,
    totalItems: Number,
  },

  RQM_score: {
    type: Number,
    required: true,
  },
  baseRQM_score: {
    type: Number,
  },
  articleDifficulty: {
    type: Number,
    required: true,
  },
  userPercentile: {
    type: Number,
  },
  timeTaken: {
    type: Number,
  },
  timeDilatedTimeTaken: {
    type: Number,
  },
  expectedTime: {
    type: Number,
  },

  // Enhanced scoring factors
  timeFactor: {
    type: Number,
  },
  performanceBonus: {
    type: Number,
    default: 1.0,
  },

  isBoosted: {
    type: Boolean,
    default: false,
  },
  boost: {
    type: Number,
    default: 1,
  },
  season: {
    type: Number,
    required: true,
    default: 1,
  },
  month: {
    type: Number,
  },
  year: {
    type: Number,
  },

  // IQ Calculation and Society/Circle data
  prevIQScore: {
    type: Number,
  },
  newIQScore: {
    type: Number,
  },
  prevUserScore: {
    type: Number,
  },
  newUserScore: {
    type: Number,
  },
  globalMeanUserScore: {
    type: Number,
  },
  globalStandardDeviation: {
    type: Number,
  },
  hasSocietyOrCircleChanged: {
    type: Boolean,
    default: false,
  },
  changedSocietyOrCircle: {
    type: String,
  },
  isUpgrade: {
    type: Boolean,
    default: false,
  },
  newSociety: {
    type: String,
  },
  newCircle: {
    type: String,
  },
  societyUpgradeMessage: {
    type: String,
  },
  boostMultiplier: {
    type: Number,
    default: 1,
  },
  originalIncrement: {
    type: Number,
  },
  boostedIncrement: {
    type: Number,
  },
  additionalScore: {
    type: Number,
  },
  pauseRealTimeIQ: {
    type: Boolean,
    default: false,
  },

  // Time Dilation and Boost tracking
  timeDilationBoosted: {
    type: Boolean,
    default: false,
  },
  usedForTimeDilation: {
    type: Boolean,
    default: false,
  },
  additionalTime: {
    type: Number,
  },

  // Activity and Achievement tracking
  xpAwarded: {
    type: Number,
    default: 0,
  },
  quinBoostUtilized: {
    type: Boolean,
    default: false,
  },
  streakRevived: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

quizAttemptSchema.index({ user: 1 })
quizAttemptSchema.index({ createdAt: 1 })
quizAttemptSchema.index({ season: 1 })
quizAttemptSchema.index({ user: 1, article: 1, gameType: 1 })
quizAttemptSchema.index({ gameType: 1 })
quizAttemptSchema.index({ user: 1, createdAt: -1 })

const QuizAttempt = mongoose.model('QUIZ_ATTEMPT', quizAttemptSchema)

module.exports = QuizAttempt
