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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'Articles' },
)

articleSchema.index({ title: 1 }, { unique: true })
articleSchema.index({ dateTime: 1 })
articleSchema.pre('save', function (next) {
  if (this.author === null) {
    this.author = 'Rapid Recap Team'
  }
  next()
})

const Article = mongoose.model('ARTICLE', articleSchema)

module.exports = Article
