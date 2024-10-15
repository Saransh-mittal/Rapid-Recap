const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
  },
  { _id: true },
)
const articleQuizSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
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
  questions: [
    {
      question: String,
      options: {
        a: { type: optionSchema },
        b: { type: optionSchema },
        c: { type: optionSchema },
        d: { type: optionSchema },
      },
      answer: String,
      explanation: String,
      difficulty: Number,
      questionId: mongoose.Schema.Types.ObjectId,
    },
  ],
  responses: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      userAnswer: String,
      isCorrect: Boolean,
    },
  ],
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  overAllDifficulty: {
    en: Number,
    hi: Number,
  },
  RQM_score: {
    en: Number,
    hi: Number,
  },
  timeTaken: {
    en: Number,
    hi: Number,
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'hi'],
  },
})

articleQuizSessionSchema.index({ user: 1, article: 1 }, { unique: true })

const ArticleQuizSession = mongoose.model(
  'ARTICLE_QUIZ_SESSION',
  articleQuizSessionSchema,
)

module.exports = ArticleQuizSession
