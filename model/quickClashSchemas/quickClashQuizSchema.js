// models/quickClashQuizSchema.js
const mongoose = require('mongoose')

const quickClashQuizSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_CHALLENGE',
    required: true,
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: {
        a: String,
        b: String,
        c: String,
        d: String,
      },
      answer: {
        type: String,
        required: true,
      },
      explanation: String,
      difficulty: {
        type: Number,
        required: true,
        min: 0.01,
        max: 0.99,
      },
    },
  ],
  overallDifficulty: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

quickClashQuizSchema.index({ challenge: 1, language: 1 }, { unique: true })

const QuickClashQuiz = mongoose.model('QUICK_CLASH_QUIZ', quickClashQuizSchema)

module.exports = QuickClashQuiz
