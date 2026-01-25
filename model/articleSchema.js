const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    dateTime: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: 'Rapid Recap Team',
    },
    hindiAuthor: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    hindiTitle: {
      type: String,
      default: '',
    },
    mainText: {
      type: String,
      required: true,
    },
    hindiMainText: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },

    imgURL: [
      {
        type: String,
      },
    ],
    quiz: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUIZ',
        },
      ],
      default: [],
    },
    userQuizStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
        },
        status: {
          type: Boolean,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: true,
      default: 'general',
    },
    onBoardingArticleCategory: {
      type: String,
    },
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ARTICLE',
      },
    ],
    avgReadTime: {
      type: Number,
    },
    quizAttemptCnt: {
      type: Number,
      default: 0,
    },
    keywords: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
    description: {
      type: String,
    },
    // Add the embedding vector field
    contentVector: {
      type: [Number],
      index: true,
      required: false,
    },
    // Optional: track vectorization status
    vectorized: {
      type: Boolean,
      default: false,
    },
    articleDifficulty: {
      type: Number,
      default: 0.5,
      min: 0.01,
      max: 0.99,
    },
    specialCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SPECIAL_CATEGORY',
      default: null,
    },
    specialCategoryAdded: {
      type: Date,
      default: null,
    },
    inlineQuiz: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: Number, // Index of correct option (0-3)
          required: true,
          min: 0,
          max: 3,
        },
        relatedSentences: [
          {
            sentenceIndex: {
              type: Number,
              required: true,
            },
            sentence: {
              type: String,
              required: true,
            },
          },
        ],
        sentencePosition: {
          type: Number, // Position of the second sentence to determine where to show quiz
          required: true,
        },
        language: {
          type: String,
          enum: ['en', 'hi'],
          default: 'en',
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        // Answer statistics
        answerStats: {
          totalResponses: {
            type: Number,
            default: 0,
          },
          optionCounts: [
            {
              type: Number,
              default: 0,
            },
          ], // Array of 4 numbers representing count for each option
          lastUpdated: {
            type: Date,
            default: Date.now,
          },
        },
        // User responses tracking (to prevent duplicate answers)
        userResponses: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'USER',
              required: true,
            },
            selectedOption: {
              type: Number,
              required: true,
              min: 0,
              max: 3,
            },
            answeredAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Forge Mode Pipeline Fields
    forgeStatus: {
      type: String,
      enum: [
        'not_seed',
        'pending',
        'processing',
        'accepted',
        'rejected',
        'failed',
      ],
      default: 'not_seed',
      index: true,
    },
    forgeSeedData: {
      seedHash: String, // SHA-256 of title + source + date
      seedEmbedding: [Number], // OpenAI embedding for dedupe
      seedSource: String, // Source from contentScrapper
      seedDate: Date,
      seedBody: String, // Full original text
      rejectionReason: String, // Why rejected
      processedAt: Date,
    },
    forgeArticleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FORGE_ARTICLE',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'Articles' },
)

articleSchema.index({ title: 1 }, { unique: true })
articleSchema.index({ dateTime: 1 })
articleSchema.index({ createdAt: -1 })
articleSchema.index({ forgeStatus: 1, 'forgeSeedData.processedAt': -1 })
articleSchema.index({ 'forgeSeedData.seedHash': 1 })
articleSchema.pre('save', function (next) {
  if (this.author === null) {
    this.author = 'Rapid Recap Team'
  }
  next()
})

const Article = mongoose.model('ARTICLE', articleSchema)

module.exports = Article
