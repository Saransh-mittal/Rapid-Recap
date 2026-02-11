const mongoose = require('mongoose')

const forgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    // Original seed reference
    seedArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ARTICLE',
      required: true,
    },

    // Forge content structure (5 sections for 24s read each)
    sections: [
      {
        sectionNumber: {
          type: Number, // 1-5
          required: true,
        },
        title: {
          type: String, // e.g., "The Source", "The Split"
          required: true,
        },
        content: {
          type: String, // 30-55 words
          required: true,
        },
        icon: {
          type: String, // emoji
          default: 'ðŸ“š',
        },
        mcq: {
          question: {
            type: String,
            required: true,
          },
          options: [
            {
              type: String,
              required: true,
            },
          ], // Always 4 options
          correctIndex: {
            type: Number, // 0-3
            required: true,
            min: 0,
            max: 3,
          },
          hint: String, // Optional hint
          contextNugget: String, // e.g., "Step 1 â†’ Light source"
        },
        readingTime: {
          type: Number, // seconds (default 24)
          default: 24,
        },
      },
    ],

    // Metadata
    category: {
      type: String,
      required: true,
      index: true,
    },
    subtype: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [String],

    // Quality metrics
    qualityScore: {
      type: Number, // 0-100
      default: 0,
    },

    // Publishing
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: Date,

    // Analytics
    stats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number, // percentage
        default: 0,
      },
    },

    // Quick Clash Quiz (stored in article, copied to QuickClashQuiz when challenge is created)
    quickClashQuiz: {
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
            enum: ['a', 'b', 'c', 'd'],
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
        min: 0.01,
        max: 0.99,
      },
      generatedAt: Date,
    },

    // LLM provenance
    llmMetadata: {
      model: String, // e.g., "gpt-4o"
      promptVersion: String,
      tokensUsed: Number,
      cost: Number,
      generatedAt: Date,
      // Verifier and reassessment audit trail for automated quality control.
      verifier: mongoose.Schema.Types.Mixed,
      reassessment: mongoose.Schema.Types.Mixed,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'ForgeArticles' },
)

// Indexes for efficient queries
forgeArticleSchema.index({ status: 1, category: 1, createdAt: -1 })
forgeArticleSchema.index({ difficulty: 1, status: 1 })
forgeArticleSchema.index({ seedArticleId: 1 })

const ForgeArticle = mongoose.model('FORGE_ARTICLE', forgeArticleSchema)

module.exports = ForgeArticle
