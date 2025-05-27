// model/quickClashSchemas/quickClashInsightFeedbackSchema.js
const mongoose = require('mongoose')

/**
 * Enhanced schema for AI feedback and learning system
 * Tracks both explicit and implicit user feedback for AI improvement
 */
const quickClashInsightFeedbackSchema = new mongoose.Schema(
  {
    // Core References
    battleAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM_BATTLE_ANALYSIS',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
      index: true,
    },
    battle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM_BATTLE',
      required: true,
      index: true,
    },

    // Enhanced Insight Details
    insightData: {
      // Core insight information - title is now required and has a default
      title: {
        type: String,
        required: true,
        default: function () {
          return `Insight-${this.user}-${Date.now()}`
        },
      },
      description: { type: String, required: true },
      type: {
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
          'battle_recap',
          'follow_up_question',
          'follow_up_answer',
          'trophy_analysis',
        ],
        required: true,
      },
      category: {
        type: String,
        enum: [
          'tactical',
          'strategic',
          'psychological',
          'improvement',
          'general',
          'validation', // Added this missing value
          'achievement', // Added this missing value
        ],
        required: true,
      },

      // AI Generation Details
      generationContext: {
        questionTemplate: String, // Which template was used
        dataPoints: [String], // What data points influenced this insight
        userExperienceLevel: {
          type: String,
          enum: ['new', 'beginner', 'intermediate', 'advanced', 'expert'],
        },
        battleCount: Number, // User's battle count when insight was generated
        promptVersion: String, // Version of the prompt used
        temperature: Number, // AI temperature setting used
      },
    },

    // Explicit Feedback
    explicitFeedback: {
      type: {
        type: String,
        enum: [
          'helpful',
          'not_helpful',
          'more_info_requested',
          'irrelevant',
          'confusing',
          'not_provided',
        ],
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      specificAspects: {
        accuracy: { type: Number, min: 1, max: 5 },
        relevance: { type: Number, min: 1, max: 5 },
        actionability: { type: Number, min: 1, max: 5 },
        clarity: { type: Number, min: 1, max: 5 },
      },
      improvement_suggestions: {
        type: String,
        maxlength: 300,
      },
    },

    // Implicit Feedback (Behavioral Data)
    implicitFeedback: {
      // Engagement metrics
      timeSpent: {
        readingTime: { type: Number, default: 0 }, // Seconds spent reading
        totalViewTime: { type: Number, default: 0 }, // Total time in analysis view
        revisitCount: { type: Number, default: 0 }, // How many times user revisited
      },

      // Interaction patterns
      interactions: {
        expanded: { type: Boolean, default: false }, // Did user expand the insight
        scrollDepth: { type: Number, default: 0 }, // Percentage of content scrolled
        clickedFollowUp: { type: Boolean, default: false }, // Clicked on follow-up questions
        sharedInsight: { type: Boolean, default: false }, // Shared the insight
        screenshotTaken: { type: Boolean, default: false }, // Downloaded/screenshot
      },

      // Follow-up behavior
      followUpBehavior: {
        askedFollowUp: { type: Boolean, default: false },
        followUpEngagementTime: { type: Number, default: 0 },
        followUpRating: { type: Number, min: 1, max: 5 },
      },
    },

    // Context Data for Learning
    contextData: {
      // User state when feedback was given
      userTrophies: Number,
      userLevel: String,
      deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop'],
      },
      sessionLength: Number, // How long was the user's session
      battlesAnalyzedInSession: Number,

      // Battle context
      battleResult: {
        type: String,
        enum: ['win', 'loss', 'tie'],
      },
      userScore: Number,
      trophyChange: Number,
      teamRole: {
        type: String,
        enum: ['top_performer', 'average', 'bottom_performer', 'mvp'],
      },

      // Temporal context
      timeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
      },
      dayOfWeek: {
        type: String,
        enum: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],
      },
    },

    // Learning Signals
    learningSignals: {
      // Performance indicators
      improvedInNextBattle: { type: Boolean, default: null },
      appliedSuggestion: { type: Boolean, default: null },
      categoryPerformanceChange: { type: Number, default: 0 },

      // Engagement indicators
      returnedForMoreAnalysis: { type: Boolean, default: false },
      recommendedToFriend: { type: Boolean, default: false },
      upgradedToPremium: { type: Boolean, default: false }, // Future feature

      // Long-term learning
      retentionRate: Number, // Days active after receiving insight
      improvementTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
      },
    },

    // AI Model Metadata
    aiMetadata: {
      modelVersion: {
        type: String,
        default: 'gpt-4o-mini',
      },
      promptHash: String, // Hash of the prompt used for consistency tracking
      generationLatency: Number, // Time taken to generate insight
      tokens: {
        input: Number,
        output: Number,
        total: Number,
      },
      confidence: Number, // AI confidence score if available
    },

    // Processing Status
    processingStatus: {
      analyzed: { type: Boolean, default: false },
      usedForTraining: { type: Boolean, default: false },
      includedInMetrics: { type: Boolean, default: false },
      contributedToImprovement: { type: Boolean, default: false },
    },

    // Tracking
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Compound Indexes for efficient queries
quickClashInsightFeedbackSchema.index({ user: 1, createdAt: -1 })
quickClashInsightFeedbackSchema.index({
  'insightData.type': 1,
  'explicitFeedback.type': 1,
})
quickClashInsightFeedbackSchema.index({
  'contextData.battleResult': 1,
  'explicitFeedback.rating': 1,
})
quickClashInsightFeedbackSchema.index({
  'aiMetadata.modelVersion': 1,
  'explicitFeedback.rating': 1,
})
quickClashInsightFeedbackSchema.index({ 'processingStatus.analyzed': 1 })

// User experience level and feedback correlation
quickClashInsightFeedbackSchema.index({
  'insightData.generationContext.userExperienceLevel': 1,
  'explicitFeedback.rating': 1,
})

// Time-based analysis
quickClashInsightFeedbackSchema.index({
  createdAt: 1,
  'contextData.timeOfDay': 1,
  'explicitFeedback.type': 1,
})

// SIMPLIFIED: Basic unique constraint without partial filter (more compatible)
// This will prevent exact duplicates while being compatible with older MongoDB versions
quickClashInsightFeedbackSchema.index(
  {
    battleAnalysis: 1,
    user: 1,
    'insightData.title': 1,
  },
  {
    unique: true,
    sparse: true, // Sparse index allows multiple null values but prevents duplicate non-null values
  },
)

// Additional index for finding feedback without requiring exact title match
quickClashInsightFeedbackSchema.index({
  battleAnalysis: 1,
  user: 1,
  'insightData.type': 1,
})

// Pre-save middleware to update timestamps and derive fields
quickClashInsightFeedbackSchema.pre('save', function (next) {
  this.updatedAt = new Date()

  // Ensure title is never null or empty
  if (!this.insightData.title || this.insightData.title.trim() === '') {
    this.insightData.title = `Insight-${this.user}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`
  }

  // Auto-derive time context
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  if (!this.contextData.timeOfDay) {
    if (hour >= 6 && hour < 12) this.contextData.timeOfDay = 'morning'
    else if (hour >= 12 && hour < 17) this.contextData.timeOfDay = 'afternoon'
    else if (hour >= 17 && hour < 21) this.contextData.timeOfDay = 'evening'
    else this.contextData.timeOfDay = 'night'
  }

  if (!this.contextData.dayOfWeek) {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    this.contextData.dayOfWeek = days[day]
  }

  next()
})

// TTL index: Auto-delete processed feedback after 1 year (for privacy)
quickClashInsightFeedbackSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 365 * 24 * 60 * 60, // 1 year
    partialFilterExpression: { 'processingStatus.usedForTraining': true },
  },
)

const QuickClashInsightFeedback = mongoose.model(
  'QUICK_CLASH_INSIGHT_FEEDBACK',
  quickClashInsightFeedbackSchema,
)

module.exports = QuickClashInsightFeedback
