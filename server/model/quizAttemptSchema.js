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
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUIZ',
  },
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      userAnswer: {
        type: String,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  RQM_score: {
    type: Number,
    required: true,
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
    deafult: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})
quizAttemptSchema.index({ user: 1 })
quizAttemptSchema.index({ createdAt: 1 })

const QuizAttempt = mongoose.model('QUIZ_ATTEMPT', quizAttemptSchema)

module.exports = QuizAttempt
