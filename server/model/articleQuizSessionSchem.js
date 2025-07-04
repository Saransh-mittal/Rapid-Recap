// model/articleQuizSessionSchem.js - UPDATED: Enhanced language support and indexing

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
  // Game hub related fields
  gameData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GAME_DATA',
  },
  gameType: {
    type: String,
    enum: ['normal_quiz', 'true_false', 'word_weaver', 'connections'],
    default: 'normal_quiz',
  },

  // Flexible questions schema that adapts to different game types
  questions: [
    {
      // Common fields
      questionId: mongoose.Schema.Types.ObjectId,
      difficulty: Number,

      // Normal quiz fields
      question: String,
      options: {
        a: { type: optionSchema },
        b: { type: optionSchema },
        c: { type: optionSchema },
        d: { type: optionSchema },
      },
      answer: String, // For normal quiz and word weaver
      explanation: String,

      // True/False fields
      text: String, // Statement text
      correct: Boolean, // True/false answer

      // Word Weaver fields
      blank: String, // Must contain fill-in-the-blank with _____

      // Connections fields
      concepts: [String],
      validConnections: [
        {
          from: String,
          to: String,
          reasoning: String,
        },
      ],
    },
  ],

  // Flexible responses schema for different game types
  responses: [
    {
      questionId: mongoose.Schema.Types.ObjectId,

      // Normal quiz & True/False
      userAnswer: mongoose.Schema.Types.Mixed, // Can be string or boolean
      isCorrect: Boolean,

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
  // MODIFY: Enhanced language field with validation
  language: {
    type: String,
    required: true,
    enum: ['en', 'hi'],
    default: 'en',
    validate: {
      validator: function (value) {
        return ['en', 'hi'].includes(value)
      },
      message: 'Language must be either "en" (English) or "hi" (Hindi)',
    },
  },
})

// MODIFY: Enhanced indexing for better performance with language queries
articleQuizSessionSchema.index(
  { user: 1, article: 1, gameType: 1, language: 1 },
  { unique: true },
)

// ADD: Additional indexes for language-specific queries
articleQuizSessionSchema.index({ language: 1 })
articleQuizSessionSchema.index({ user: 1, language: 1 })
articleQuizSessionSchema.index({ article: 1, language: 1 })
articleQuizSessionSchema.index({ gameType: 1, language: 1 })
articleQuizSessionSchema.index({ completed: 1, language: 1 })

// ADD: Compound index for common query patterns
articleQuizSessionSchema.index({
  user: 1,
  article: 1,
  completed: 1,
  language: 1,
})

const ArticleQuizSession = mongoose.model(
  'ARTICLE_QUIZ_SESSION',
  articleQuizSessionSchema,
)

module.exports = ArticleQuizSession
