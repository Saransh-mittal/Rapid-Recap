// models/quickClashSessionSchema.js
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
  quiz: {
    startTime: Date,
    endTime: Date,
    responses: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        timeSpent: Number,
      },
    ],
    timeSpent: Number,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  score: {
    RQM_score: Number,
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
quickClashSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
quickClashSessionSchema.index({ user: 1, createdAt: -1 })

const QuickClashSession = mongoose.model(
  'QUICK_CLASH_SESSION',
  quickClashSessionSchema,
)

module.exports = QuickClashSession
