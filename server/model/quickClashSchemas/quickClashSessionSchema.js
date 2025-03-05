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
    enum: ['reading', 'quiz', 'completed'],
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
    // Using a regular object for answer mappings rather than Map type
    answerMappings: {
      type: Object,
      default: {},
    },
    // Add field to track which questions were shown to the user
    selectedQuestionIds: {
      type: [String],
      default: [],
    },
    shuffledOptions: {
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
    baseRQM_score: Number, // Add this field to match your service response
    speedBonus: Number,
    accuracyBonus: Number,
    total: Number,
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
