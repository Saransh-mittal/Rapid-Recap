// model/quickClashSchemas/quickClashInsightFeedbackSchema.js
const mongoose = require('mongoose')

/**
 * Schema for tracking user feedback on AI-generated insights
 * This helps improve the AI model over time
 */
const quickClashInsightFeedbackSchema = new mongoose.Schema(
  {
    // Reference to the battle analysis
    battleAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM_BATTLE_ANALYSIS',
      required: true,
      index: true,
    },

    // User who provided feedback
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
      index: true,
    },

    // Insight details (stored for context even if analysis is deleted)
    insightTitle: {
      type: String,
      required: true,
    },

    insightDescription: {
      type: String,
      required: true,
    },

    insightType: {
      type: String,
      enum: [
        'tactical_insight',
        'team_dynamics',
        'personal_growth',
        'mental_game',
        'meta_strategy',
        'hidden_pattern',
        'strength',
        'weakness',
        'improvement',
        'achievement',
        'team',
        'general',
        'strategy_tip',
      ],
      required: true,
    },

    // Feedback type
    feedbackType: {
      type: String,
      enum: ['helpful', 'not_helpful', 'more_info_requested'],
      required: true,
    },

    // Optional comment from user
    comment: {
      type: String,
      maxlength: 500,
    },

    // Metadata for analysis
    meta: {
      battleResult: {
        type: String,
        enum: ['win', 'loss', 'tie'],
      },
      userExperienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
      insightVersion: {
        type: String,
        default: '2.0.0',
      },
      generationModel: {
        type: String,
        default: 'gpt-4o-mini',
      },
    },

    // Tracking
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
quickClashInsightFeedbackSchema.index({ battleAnalysis: 1, user: 1 })
quickClashInsightFeedbackSchema.index({ insightType: 1, feedbackType: 1 })
quickClashInsightFeedbackSchema.index({ createdAt: -1 })

// Prevent duplicate feedback from same user for same insight
quickClashInsightFeedbackSchema.index(
  { battleAnalysis: 1, user: 1, insightTitle: 1 },
  { unique: true },
)

const QuickClashInsightFeedback = mongoose.model(
  'QUICK_CLASH_INSIGHT_FEEDBACK',
  quickClashInsightFeedbackSchema,
)

module.exports = QuickClashInsightFeedback
