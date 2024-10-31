// models/articleHighlightSchema.js

const mongoose = require('mongoose')

const articleHighlightSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ARTICLE',
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
      default: 'en',
    },
    error: {
      type: String,
      default: null,
    },
  },
  { collection: 'ArticleHighlights' },
)

// Index for faster queries
articleHighlightSchema.index({ processingStatus: 1, createdAt: 1 })

const ArticleHighlight = mongoose.model(
  'ARTICLE_HIGHLIGHT',
  articleHighlightSchema,
)

module.exports = ArticleHighlight
