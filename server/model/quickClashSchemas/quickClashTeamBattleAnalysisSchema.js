// model/quickClashSchemas/quickClashTeamBattleAnalysisSchema.js
const mongoose = require('mongoose')

/**
 * Schema for storing team battle analyses with progressive Q&A system
 */
const quickClashTeamBattleAnalysisSchema = new mongoose.Schema(
  {
    // Battle reference
    battle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM_BATTLE',
      required: true,
      index: true,
    },

    // User who the analysis is for
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
      index: true,
    },

    // Team mode (for future expansion)
    teamMode: {
      type: String,
      enum: ['4v4', '2v2', '3v3'],
      default: '4v4',
      index: true,
    },

    // User's team in this battle
    userTeam: {
      type: String,
      enum: ['teamA', 'teamB'],
      required: true,
    },

    // AI-generated insights (legacy support)
    aiInsights: [
      {
        type: {
          type: String,
          enum: [
            'strength',
            'weakness',
            'improvement',
            'achievement',
            'team',
            'general',
          ],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        icon: {
          type: String,
          required: true,
        },
      },
    ],

    battleRecap: {
      title: {
        type: String,
        required: false,
      },
      content: {
        type: String,
        required: false,
      },
      mood: {
        type: String,
        enum: [
          'victory',
          'defeat',
          'epic',
          'close_call',
          'learning_moment',
          'comeback',
          'dominant',
        ],
        default: 'learning_moment',
      },
    },

    // Progressive Follow-up Questions System
    questionProgression: {
      currentQuestionIndex: {
        type: Number,
        default: 1, // Start with question 1
        min: 1,
        max: 3,
      },
      totalQuestionsGenerated: {
        type: Number,
        default: 1, // Start with 1 question generated
        min: 0,
        max: 3,
      },
      isComplete: {
        type: Boolean,
        default: false, // True when all 3 questions are answered or user stops
      },
      battleContext: {
        type: String, // Serialized context for generating next questions
        default: '',
      },
      conversationHistory: [
        {
          questionId: String,
          question: String,
          answer: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Current and Historical Questions
    followUpQuestions: [
      {
        id: {
          type: String,
          required: true,
        },
        questionIndex: {
          type: Number, // 1, 2, or 3
          required: true,
          min: 1,
          max: 3,
        },
        question: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          enum: ['tactical', 'strategic', 'psychological', 'improvement'],
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        preview: {
          type: String,
          required: true,
        },
        answered: {
          type: Boolean,
          default: false,
        },
        answer: {
          content: String,
          keyTakeaway: String,
          actionItem: String,
          answeredAt: Date,
        },
        generatedAt: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true, // Only one question should be active at a time
        },
      },
    ],

    // Trophy history reference
    trophyHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM_TROPHY_HISTORY',
    },

    // Metrics and stats
    metrics: {
      userScore: Number,
      teamAvgScore: Number,
      opponentAvgScore: Number,
      trophyChange: Number,
      appliedBonuses: {
        firstDaily: Boolean,
        strongerTeam: Boolean,
        comebackWin: Boolean,
        allWins: Boolean,
      },
      performanceRating: Number,
      contributionPercentage: Number,
    },

    // Analysis meta data
    meta: {
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      version: {
        type: String,
        default: '3.1.0', // Updated version for progressive Q&A
      },
      openAIModel: {
        type: String,
        default: 'gpt-4o-mini',
      },
      generationTimeMs: Number,
      contextEnrichment: {
        type: String,
        default: 'progressive_qa',
      },
    },

    // Expiry date (if needed for cleanup)
    expiresAt: {
      type: Date,
      default: function () {
        const date = new Date()
        date.setDate(date.getDate() + 30)
        return date
      },
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound indexes for efficient lookups
quickClashTeamBattleAnalysisSchema.index(
  { battle: 1, user: 1 },
  { unique: true },
)
quickClashTeamBattleAnalysisSchema.index({ user: 1, createdAt: -1 })
quickClashTeamBattleAnalysisSchema.index({
  'questionProgression.isComplete': 1,
})

const QuickClashTeamBattleAnalysis = mongoose.model(
  'QUICK_CLASH_TEAM_BATTLE_ANALYSIS',
  quickClashTeamBattleAnalysisSchema,
)

module.exports = QuickClashTeamBattleAnalysis
