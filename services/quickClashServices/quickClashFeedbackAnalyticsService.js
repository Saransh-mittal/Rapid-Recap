// services/quickClashServices/quickClashFeedbackAnalyticsService.js
const QuickClashInsightFeedback = require('../../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const User = require('../../model/userSchema')
const { makeGPTRequest } = require('../../utils/openai')

/**
 * Service for analyzing feedback patterns and generating AI improvement insights
 */
class QuickClashFeedbackAnalyticsService {
  /**
   * Analyze feedback patterns to generate improvement insights
   */
  static async analyzeFeedbackPatterns({
    timeframe = 30, // days
    minFeedbackCount = 10,
    includeImplicit = true,
  } = {}) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeframe)

      const feedbackData = await QuickClashInsightFeedback.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            'processingStatus.analyzed': false,
          },
        },
        {
          $group: {
            _id: {
              insightType: '$insightData.type',
              category: '$insightData.category',
              userLevel: '$insightData.generationContext.userExperienceLevel',
              battleResult: '$contextData.battleResult',
            },
            totalFeedback: { $sum: 1 },
            avgRating: { $avg: '$explicitFeedback.rating' },
            helpfulCount: {
              $sum: {
                $cond: [{ $eq: ['$explicitFeedback.type', 'helpful'] }, 1, 0],
              },
            },
            notHelpfulCount: {
              $sum: {
                $cond: [
                  { $eq: ['$explicitFeedback.type', 'not_helpful'] },
                  1,
                  0,
                ],
              },
            },
            avgEngagementTime: {
              $avg: '$implicitFeedback.timeSpent.totalViewTime',
            },
            avgReadingTime: { $avg: '$implicitFeedback.timeSpent.readingTime' },
            expandedRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.expanded', 1, 0],
              },
            },
            followUpRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.clickedFollowUp', 1, 0],
              },
            },
            shareRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.sharedInsight', 1, 0],
              },
            },
            samples: {
              $push: {
                title: '$insightData.title',
                rating: '$explicitFeedback.rating',
                comment: '$explicitFeedback.comment',
                promptVersion: '$insightData.generationContext.promptVersion',
              },
            },
          },
        },
        {
          $match: {
            totalFeedback: { $gte: minFeedbackCount },
          },
        },
        {
          $sort: { avgRating: -1 },
        },
      ])

      const insights = await this.generateImprovementInsights(feedbackData)

      // Mark feedback as analyzed
      await QuickClashInsightFeedback.updateMany(
        {
          createdAt: { $gte: startDate },
          'processingStatus.analyzed': false,
        },
        {
          $set: {
            'processingStatus.analyzed': true,
            'processingStatus.includedInMetrics': true,
          },
        },
      )

      return {
        success: true,
        analysisDate: new Date(),
        timeframe,
        totalFeedbackAnalyzed: feedbackData.length,
        insights,
        rawData: feedbackData,
      }
    } catch (error) {
      console.error('Error analyzing feedback patterns:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate AI improvement insights from feedback patterns
   */
  static async generateImprovementInsights(feedbackData) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an AI system analyst. Analyze user feedback patterns for Quick Clash battle analysis AI to generate improvement recommendations.

CONTEXT: Quick Clash is a 4v4 team quiz game where AI provides personalized battle analysis.

Your task: Identify patterns in user feedback and generate specific improvement recommendations.

Focus on:
1. Which insight types perform best/worst
2. What user experience levels respond to what content
3. Engagement pattern insights
4. Prompt/generation improvements needed

Output JSON:
{
  "insights": [
    {
      "category": "insight_effectiveness | user_segmentation | engagement_optimization | prompt_improvement",
      "finding": "Specific pattern discovered",
      "recommendation": "Actionable improvement suggestion",
      "priority": "high | medium | low",
      "impact": "Expected impact description",
      "implementation": "How to implement this change"
    }
  ],
  "overall_recommendations": {
    "top_3_improvements": ["improvement1", "improvement2", "improvement3"],
    "user_segment_strategies": {
      "new_users": "Strategy for new users",
      "experienced_users": "Strategy for experienced users"
    }
  }
}`,
        },
        {
          role: 'user',
          content: `Analyze this feedback data and generate improvement insights:

${JSON.stringify(feedbackData, null, 2)}

Generate specific, actionable recommendations for improving the AI analysis system.`,
        },
      ]

      const response = await makeGPTRequest({
        messages,
        temperature: 0.3,
      })

      return (
        response || {
          insights: [],
          overall_recommendations: {
            top_3_improvements: ['Insufficient data for analysis'],
            user_segment_strategies: {
              new_users: 'Continue monitoring',
              experienced_users: 'Continue monitoring',
            },
          },
        }
      )
    } catch (error) {
      console.error('Error generating improvement insights:', error)
      return {
        insights: [
          {
            category: 'system_error',
            finding: 'Analysis generation failed',
            recommendation: 'Review system logs and retry analysis',
            priority: 'high',
            impact: 'Cannot improve AI without analysis',
            implementation: 'Debug AI analysis pipeline',
          },
        ],
        overall_recommendations: {
          top_3_improvements: ['Fix analysis generation system'],
          user_segment_strategies: {
            new_users: 'Use fallback analysis',
            experienced_users: 'Use fallback analysis',
          },
        },
      }
    }
  }

  /**
   * Get personalization insights for a specific user
   */
  static async getUserPersonalizationInsights({ userId, lookbackDays = 90 }) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - lookbackDays)

      const userFeedback = await QuickClashInsightFeedback.find({
        user: userId,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: -1 })

      if (userFeedback.length === 0) {
        return {
          hasData: false,
          recommendations: {
            preferredInsightTypes: ['general'],
            optimalTiming: 'any',
            engagementPredictors: {},
            personalizationLevel: 'generic',
          },
        }
      }

      // Analyze user preferences
      const preferences = this.analyzeUserPreferences(userFeedback)

      return {
        hasData: true,
        totalFeedback: userFeedback.length,
        preferences,
        recommendations: await this.generateUserRecommendations(
          userId,
          preferences,
        ),
      }
    } catch (error) {
      console.error('Error getting user personalization insights:', error)
      return {
        hasData: false,
        error: error.message,
        recommendations: {
          preferredInsightTypes: ['general'],
          optimalTiming: 'any',
          engagementPredictors: {},
          personalizationLevel: 'generic',
        },
      }
    }
  }

  /**
   * Analyze individual user preferences from their feedback history
   */
  static analyzeUserPreferences(userFeedback) {
    const preferences = {
      insightTypes: {},
      categories: {},
      timing: {},
      engagement: {
        avgReadingTime: 0,
        avgEngagementTime: 0,
        expandRate: 0,
        followUpRate: 0,
      },
      satisfaction: {
        avgRating: 0,
        helpfulRate: 0,
      },
    }

    let totalReadingTime = 0
    let totalEngagementTime = 0
    let expandCount = 0
    let followUpCount = 0
    let totalRating = 0
    let helpfulCount = 0

    userFeedback.forEach(feedback => {
      // Insight type preferences
      const insightType = feedback.insightData.type
      if (!preferences.insightTypes[insightType]) {
        preferences.insightTypes[insightType] = {
          count: 0,
          avgRating: 0,
          ratings: [],
        }
      }
      preferences.insightTypes[insightType].count++
      preferences.insightTypes[insightType].ratings.push(
        feedback.explicitFeedback.rating,
      )

      // Category preferences
      const category = feedback.insightData.category
      if (!preferences.categories[category]) {
        preferences.categories[category] = {
          count: 0,
          avgRating: 0,
          ratings: [],
        }
      }
      preferences.categories[category].count++
      preferences.categories[category].ratings.push(
        feedback.explicitFeedback.rating,
      )

      // Timing preferences
      const timeOfDay = feedback.contextData.timeOfDay
      if (!preferences.timing[timeOfDay]) {
        preferences.timing[timeOfDay] = { count: 0, avgRating: 0 }
      }
      preferences.timing[timeOfDay].count++

      // Engagement metrics
      totalReadingTime += feedback.implicitFeedback.timeSpent.readingTime || 0
      totalEngagementTime +=
        feedback.implicitFeedback.timeSpent.totalViewTime || 0
      if (feedback.implicitFeedback.interactions.expanded) expandCount++
      if (feedback.implicitFeedback.interactions.clickedFollowUp)
        followUpCount++

      // Satisfaction metrics
      totalRating += feedback.explicitFeedback.rating
      if (feedback.explicitFeedback.type === 'helpful') helpfulCount++
    })

    // Calculate averages
    const feedbackCount = userFeedback.length
    preferences.engagement.avgReadingTime = Math.round(
      totalReadingTime / feedbackCount,
    )
    preferences.engagement.avgEngagementTime = Math.round(
      totalEngagementTime / feedbackCount,
    )
    preferences.engagement.expandRate = (expandCount / feedbackCount) * 100
    preferences.engagement.followUpRate = (followUpCount / feedbackCount) * 100
    preferences.satisfaction.avgRating = totalRating / feedbackCount
    preferences.satisfaction.helpfulRate = (helpfulCount / feedbackCount) * 100

    // Calculate average ratings for each insight type and category
    Object.keys(preferences.insightTypes).forEach(type => {
      const ratings = preferences.insightTypes[type].ratings
      preferences.insightTypes[type].avgRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    })

    Object.keys(preferences.categories).forEach(category => {
      const ratings = preferences.categories[category].ratings
      preferences.categories[category].avgRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    })

    return preferences
  }

  /**
   * Generate personalized recommendations for a user
   */
  static async generateUserRecommendations(userId, preferences) {
    try {
      // Get user data for context
      const user = await User.findById(userId).select(
        'quickClashTrophies level',
      )

      const messages = [
        {
          role: 'system',
          content: `Generate personalized AI analysis recommendations based on user feedback patterns.

Output JSON:
{
  "preferredInsightTypes": ["array of insight types user responds best to"],
  "avoidInsightTypes": ["types to minimize"],
  "optimalTiming": "best time to show analysis",
  "engagementPredictors": {
    "high_engagement_indicators": ["factors that predict high engagement"],
    "low_engagement_indicators": ["factors that predict low engagement"]
  },
  "personalizationLevel": "generic | moderate | high",
  "contentStrategy": {
    "tone": "supportive | direct | analytical",
    "depth": "concise | moderate | detailed",
    "focus": "improvement | validation | strategy"
  },
  "recommendedFeatures": ["features to prioritize for this user"]
}`,
        },
        {
          role: 'user',
          content: `User Preferences:
${JSON.stringify(preferences, null, 2)}

User Context:
- Trophies: ${user.quickClashTrophies || 1000}
- Level: ${user.level || 0}
- Feedback History: ${Object.values(preferences.insightTypes).reduce(
            (sum, type) => sum + type.count,
            0,
          )} interactions

Generate personalized recommendations.`,
        },
      ]

      const response = await makeGPTRequest({
        messages,
        temperature: 0.4,
      })

      return (
        response || {
          preferredInsightTypes: ['general'],
          avoidInsightTypes: [],
          optimalTiming: 'any',
          engagementPredictors: {
            high_engagement_indicators: ['none identified'],
            low_engagement_indicators: ['none identified'],
          },
          personalizationLevel: 'generic',
          contentStrategy: {
            tone: 'supportive',
            depth: 'moderate',
            focus: 'improvement',
          },
          recommendedFeatures: ['standard_analysis'],
        }
      )
    } catch (error) {
      console.error('Error generating user recommendations:', error)
      return {
        preferredInsightTypes: ['general'],
        avoidInsightTypes: [],
        optimalTiming: 'any',
        engagementPredictors: {},
        personalizationLevel: 'generic',
        contentStrategy: {
          tone: 'supportive',
          depth: 'moderate',
          focus: 'improvement',
        },
        recommendedFeatures: ['standard_analysis'],
      }
    }
  }

  /**
   * Get real-time feedback metrics for monitoring
   */
  static async getFeedbackMetrics({ days = 7 } = {}) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const metrics = await QuickClashInsightFeedback.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            avgRating: { $avg: '$explicitFeedback.rating' },
            helpfulRate: {
              $avg: {
                $cond: [{ $eq: ['$explicitFeedback.type', 'helpful'] }, 1, 0],
              },
            },
            avgEngagementTime: {
              $avg: '$implicitFeedback.timeSpent.totalViewTime',
            },
            avgReadingTime: { $avg: '$implicitFeedback.timeSpent.readingTime' },
            expandRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.expanded', 1, 0],
              },
            },
            followUpRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.clickedFollowUp', 1, 0],
              },
            },
            shareRate: {
              $avg: {
                $cond: ['$implicitFeedback.interactions.sharedInsight', 1, 0],
              },
            },
          },
        },
      ])

      return {
        success: true,
        period: `Last ${days} days`,
        metrics: metrics[0] || {
          totalFeedback: 0,
          avgRating: 0,
          helpfulRate: 0,
          avgEngagementTime: 0,
          avgReadingTime: 0,
          expandRate: 0,
          followUpRate: 0,
          shareRate: 0,
        },
      }
    } catch (error) {
      console.error('Error getting feedback metrics:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Schedule automatic feedback analysis
   */
  static async scheduleAutomaticAnalysis() {
    const cronJob = require('node-cron')

    // Run analysis daily at 2 AM
    cronJob.schedule('0 2 * * *', async () => {
      console.log('Running automated feedback analysis...')

      try {
        const analysis = await this.analyzeFeedbackPatterns({
          timeframe: 7, // Last 7 days
          minFeedbackCount: 5,
        })

        if (analysis.success) {
          console.log(
            `Feedback analysis completed: ${analysis.totalFeedbackAnalyzed} items analyzed`,
          )

          // Store insights for AI improvement
          await this.storeAnalysisResults(analysis)
        } else {
          console.error('Feedback analysis failed:', analysis.error)
        }
      } catch (error) {
        console.error('Scheduled feedback analysis error:', error)
      }
    })

    console.log('Automated feedback analysis scheduled')
  }

  /**
   * Store analysis results for AI improvement
   */
  static async storeAnalysisResults(analysis) {
    // This could store results in a separate collection or file
    // for later use in prompt optimization
    console.log('Analysis insights generated:', analysis.insights.length)
  }
}

module.exports = QuickClashFeedbackAnalyticsService
