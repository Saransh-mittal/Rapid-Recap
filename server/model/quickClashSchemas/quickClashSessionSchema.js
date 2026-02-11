// models/quickClashSchemas/quickClashSessionSchema.js
const mongoose = require('mongoose')

const quickClashSessionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_CHALLENGE',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_QUIZ',
  },
  phase: {
    type: String,
    enum: ['reading', 'quiz', 'completed', 'retried'],
    default: 'reading',
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    required: true,
  },
  reading: {
    startTime: Date,
    endTime: Date,
    timeSpent: Number,
    completed: {
      type: Boolean,
      default: false,
    },
    completionType: {
      type: String,
      enum: ['manual', 'timeout'],
    },
  },
  // NEW: Forge mode progress tracking
  // Only used when challenge.forgeArticle exists
  forgeProgress: {
    // Which section user is currently on (0-4)
    currentSection: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    // Which sections have been unlocked (array of section numbers)
    unlockedSections: {
      type: [Number],
      default: [],
    },
    // Responses to section MCQs
    responses: [
      {
        sectionNumber: {
          type: Number,
          required: true,
        },
        userAnswer: {
          type: Number, // 0-3 (index of selected option)
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        timeSpent: {
          type: Number, // milliseconds
          default: 0,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
        scoreBreakdown: {
          base: {
            type: Number,
            default: 0,
          },
          speedBonus: {
            type: Number,
            default: 0,
          },
          streakBonus: {
            type: Number,
            default: 0,
          },
          total: {
            type: Number,
            default: 0,
          },
        },
      },
    ],
    // NEW: Global time tracking
    globalStartTime: Date, // When user started first section
    globalEndTime: Date, // When user completed/timed out
    totalTimeAllowed: {
      // Total time budget in milliseconds
      type: Number,
      default: 100000, // 100 seconds
    },
    // Per-section detailed timing
    sectionTimings: [
      {
        sectionNumber: Number,
        questionStartTime: Date, // When question was shown
        questionAnsweredTime: Date, // When answer was submitted
        questionTimeSpent: Number, // Time on question (ms)
        readingStartTime: Date, // When reading started (if correct)
        readingEndTime: Date, // When reading completed
        readingTimeSpent: Number, // Time on reading (ms)
      },
    ],
    // Overall forge session stats
    startTime: Date,
    endTime: Date,
    totalTimeSpent: Number, // Total time in milliseconds
    correctAnswers: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    // NEW: Score breakdown tracking
    baseScore: {
      type: Number,
      default: 0,
    },
    speedBonusTotal: {
      type: Number,
      default: 0,
    },
    streakBonusTotal: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // NEW: Active state tracking
    active: {
      type: Boolean,
      default: false,
    },
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
    answerMappings: {
      type: Object,
      default: {},
    },
    selectedQuestionIds: {
      type: [String],
      default: [],
    },
    shuffledOptions: {
      type: Object,
      default: {},
    },
    // Per-question powerup usage metadata (e.g. Oracle's Eye once/question in quiz)
    powerupUsage: {
      type: Object,
      default: {},
    },
    timeSpent: Number,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  score: {
    RQM_score: Number,
    baseRQM_score: Number,
    speedBonus: Number,
    accuracyBonus: Number,
    total: Number,
    forgeScore: Number,
    precisionBonus: Number,
    scoreSurgeBonus: Number,
  },
  // Powerups for this session
  activePowerups: [
    {
      powerupId: String,
      type: { type: String }, // 'active', 'passive'
      cost: Number,
      phase: String, // 'forge', 'quiz', 'both'
      used: {
        type: Boolean,
        default: false,
      },
      usedAt: Date,
      effectApplied: {
        type: Boolean,
        default: false,
      },
    },
  ],
  // Backend error tracking - for free retry eligibility
  backendError: {
    occurred: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String, // 'QUEUE_PROCESSING_FAILED', 'WRITE_CONFLICT_EXHAUSTED', etc.
    },
    timestamp: Date,
    canRetry: {
      type: Boolean,
      default: true,
    },
  },
  // If this session was retried, reference to the new session
  retriedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_SESSION',
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

// Indexes for performance
quickClashSessionSchema.index({ challenge: 1, user: 1 }, { unique: true })
quickClashSessionSchema.index({ expiresAt: 1 })
quickClashSessionSchema.index({ user: 1, createdAt: -1 })

const QuickClashSession = mongoose.model(
  'QUICK_CLASH_SESSION',
  quickClashSessionSchema,
)

module.exports = QuickClashSession
