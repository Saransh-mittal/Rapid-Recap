// model/quickClashSchemas/quickClashAnalysisSchema.js
const mongoose = require('mongoose')

const quickClashAnalysisSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUICK_CLASH_CHALLENGE',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // General battle metrics
  battleMetrics: {
    category: String,
    difficulty: String, // easy, medium, hard
    engagementScore: Number, // 0-100 scale
    questionDifficultyDistribution: Object,
    // Added trophy exchange information
    trophyExchange: {
      isTie: Boolean,
      protectionApplied: {
        challengerProtected: Boolean,
        challengerProtectionType: String,
        opponentProtected: Boolean,
        opponentProtectionType: String,
      },
    },
  },
  // Challenger analysis
  challenger: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
    },
    // Trophy data from challenge
    trophyData: {
      previousTrophies: Number,
      newTrophies: Number,
      change: Number,
      protectionApplied: Boolean,
      protectionType: String,
    },
    performance: {
      readingTime: Number, // in seconds
      readingSpeedPercentile: Number, // top X%
      hiddenWordTime: Number, // in seconds
      quizSpeed: Number, // average seconds per question
      quizSpeedTrend: String, // "consistent", "improving", "declining"
      finalScore: Number,
      trophyAnalysis: String, // Added analysis of trophy performance
    },
    analysis: {
      strengths: [String],
      weaknesses: [String],
      knowledgePatterns: {
        factualRecall: Number, // Percentage 0-100
        technicalTerms: Number, // Percentage 0-100
        strategicAnalysis: Number, // Percentage 0-100
      },
      recommendations: [String],
    },
    statistics: {
      currentStreak: Number,
      winRate: Number, // Percentage 0-100
      bestCategory: String,
      peakPerformanceTime: String, // "Morning", "Afternoon", "Evening"
    },
    learningPath: {
      focusAreas: [String],
      topicSuggestions: [String],
      nextSteps: [String],
    },
    // Trophy insights
    trophyInsights: {
      currentLevel: String,
      progressTrend: String,
      nextMilestone: String,
    },
  },
  // Opponent analysis (same structure as challenger)
  opponent: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
    },
    // Trophy data from challenge
    trophyData: {
      previousTrophies: Number,
      newTrophies: Number,
      change: Number,
      protectionApplied: Boolean,
      protectionType: String,
    },
    performance: {
      readingTime: Number,
      readingSpeedPercentile: Number,
      hiddenWordTime: Number,
      quizSpeed: Number,
      quizSpeedTrend: String,
      finalScore: Number,
      trophyAnalysis: String, // Added analysis of trophy performance
    },
    analysis: {
      strengths: [String],
      weaknesses: [String],
      knowledgePatterns: {
        factualRecall: Number,
        technicalTerms: Number,
        strategicAnalysis: Number,
      },
      recommendations: [String],
    },
    statistics: {
      currentStreak: Number,
      winRate: Number,
      bestCategory: String,
      peakPerformanceTime: String,
    },
    learningPath: {
      focusAreas: [String],
      topicSuggestions: [String],
      nextSteps: [String],
    },
    // Trophy insights
    trophyInsights: {
      currentLevel: String,
      progressTrend: String,
      nextMilestone: String,
    },
  },
  // Engagement content
  engagement: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
    },
    victoryMeme: String,
    competitiveTaunt: String,
    wittyAnalysis: String,
    difficultySpecificComment: String,
    trophyComment: String, // Added trophy-specific commentary
    topicSuggestions: [String],
    interestMetrics: {
      victorMemeInterest: Number, // Percentage 0-100
      competitiveTauntPreference: Number, // Percentage 0-100
      wittyAnalysisPreference: Number, // Percentage 0-100
      topicSuggestionsInterest: Number, // Percentage 0-100
      trophyCommentInterest: Number, // Interest in trophy commentary
    },
  },
  // Hindi translation of the analysis
  hindiTranslation: {
    challenger: {
      performance: {
        difficultyInsight: String,
        trophyAnalysis: String, // Added Hindi trophy analysis
      },
      analysis: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
      },
      learningPath: {
        focusAreas: [String],
        topicSuggestions: [String],
        nextSteps: [String],
      },
      trophyInsights: {
        // Added Hindi trophy insights
        currentLevel: String,
        progressTrend: String,
        nextMilestone: String,
      },
    },
    opponent: {
      performance: {
        difficultyInsight: String,
        trophyAnalysis: String, // Added Hindi trophy analysis
      },
      analysis: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
      },
      learningPath: {
        focusAreas: [String],
        topicSuggestions: [String],
        nextSteps: [String],
      },
      trophyInsights: {
        // Added Hindi trophy insights
        currentLevel: String,
        progressTrend: String,
        nextMilestone: String,
      },
    },
    engagement: {
      victoryMeme: String,
      competitiveTaunt: String,
      wittyAnalysis: String,
      trophyComment: String, // Added Hindi trophy commentary
      topicSuggestions: [String],
    },
  },
  // Translation status
  translationStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
})

// Create a unique compound index on challenge ID
quickClashAnalysisSchema.index({ challenge: 1 }, { unique: true })

const QuickClashAnalysis = mongoose.model(
  'QUICK_CLASH_ANALYSIS',
  quickClashAnalysisSchema,
)

module.exports = QuickClashAnalysis
