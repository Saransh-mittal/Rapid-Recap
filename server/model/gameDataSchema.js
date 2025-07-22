// model/gameDataSchema.js - Updated Word Weaver section without context
const mongoose = require('mongoose')
const connectionTypes = require('../data/connectionGameTypes')

const gameDataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'general',
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ARTICLE',
  },

  // Normal Quiz (existing structure enhanced)
  normal_quiz: {
    questions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
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
        correct: {
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
  },

  // True/False Game
  true_false: {
    statements: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        text: {
          type: String,
          required: true,
        },
        correct: {
          type: Boolean,
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
  },

  // UPDATED: Word Weaver without context field
  word_weaver: {
    questions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        // REMOVED: context field
        blank: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              // Validate that the blank contains proper fill-in-the-blank format
              return (
                v &&
                typeof v === 'string' &&
                v.includes('_____') && // Must contain blank placeholder
                v.trim().length >= 10 && // Reasonable sentence length
                v.split('_____').length === 2 // Must have exactly one blank
              )
            },
            message:
              'Blank must be a proper fill-in-the-blank sentence with exactly one _____ placeholder',
          },
        },
        answer: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              // Ensure answer is a single word (no spaces) and reasonable length
              return (
                v &&
                typeof v === 'string' &&
                !/\s/.test(v.trim()) &&
                v.trim().length >= 3 &&
                v.trim().length <= 15
              )
            },
            message:
              'Answer must be a single word with no spaces (3-15 characters)',
          },
        },
        wordLength: {
          type: Number,
          required: true,
          min: 3,
          max: 15,
          default: function () {
            // Calculate from answer if available
            if (this.answer) {
              return this.answer.replace(/\s+/g, '').length
            }
            return 6 // fallback default
          },
        },
        difficulty: {
          type: Number,
          required: true,
          min: 0.01,
          max: 0.99,
          default: 0.5,
        },
      },
    ],
  },

  // Connections Game
  connections: {
    concepts: [
      {
        type: String,
        required: true,
      },
    ],
    validConnections: [
      {
        from: {
          type: String,
          required: true,
        },
        to: {
          type: String,
          required: true,
        },
        reasoning: {
          type: String,
          required: true,
        },
        difficulty: {
          type: Number,
          required: true,
          min: 0.01,
          max: 0.99,
          default: 0.5,
        },
        connectionType: {
          type: String,
          enum: connectionTypes,
          default: 'conceptual',
        },
      },
    ],
    overallDifficulty: {
      type: Number,
      min: 0.01,
      max: 0.99,
      default: 0.5,
    },
  },

  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi'],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

gameDataSchema.index({ article: 1, language: 1 })
gameDataSchema.index({ category: 1 })
gameDataSchema.index({ isActive: 1 })

const GameData = mongoose.model('GAME_DATA', gameDataSchema)

module.exports = GameData
