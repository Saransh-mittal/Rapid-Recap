// models/quickClashHighlightSchema.js
const mongoose = require('mongoose')

const quickClashHighlightSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_CHALLENGE',
      required: true,
      index: true,
    },
    dictionary: [
      {
        word: {
          type: String,
          required: true,
        },
        definition: {
          type: String,
          required: true,
        },
      },
    ],
    importantSentences: [
      {
        type: String,
        required: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { collection: 'QuickClashHighlights' },
)

// Indexes for faster queries
quickClashHighlightSchema.index({ processingStatus: 1, createdAt: 1 })
quickClashHighlightSchema.index(
  { challengeId: 1, language: 1 },
  { unique: true },
)

const QuickClashHighlight = mongoose.model(
  'QUICK_CLASH_HIGHLIGHT',
  quickClashHighlightSchema,
)

module.exports = QuickClashHighlight
