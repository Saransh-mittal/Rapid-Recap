// services/quickClashServices/quickClashPersonalizationService.js
const QuickClashFeedbackAnalyticsService = require('./quickClashFeedbackAnalyticsService')
const { makeGPTRequest } = require('../../utils/openai')
const User = require('../../model/userSchema')

/**
 * Service for personalizing AI responses based on user feedback and behavior patterns
 */
class QuickClashPersonalizationService {
  /**
   * Get personalized AI prompt configuration for a user
   */
  static async getPersonalizedPromptConfig({
    userId,
    insightType,
    battleContext,
  }) {
    try {
      const [userPreferences, userProfile] = await Promise.all([
        QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights({
          userId,
        }),
        User.findById(userId).select('quickClashTrophies level name'),
      ])

      const config = {
        temperature: 0.7,
        tone: 'supportive',
        depth: 'moderate',
        focus: 'improvement',
        avoidTopics: [],
        emphasizeTopics: [],
        contentStyle: 'balanced',
        questionStyle: 'engaging',
      }

      if (userPreferences.hasData) {
        // Customize based on user preferences
        const recommendations = userPreferences.recommendations

        config.tone = recommendations.contentStrategy?.tone || 'supportive'
        config.depth = recommendations.contentStrategy?.depth || 'moderate'
        config.focus = recommendations.contentStrategy?.focus || 'improvement'

        // Adjust temperature based on user engagement patterns
        if (userPreferences.preferences.engagement.expandRate > 70) {
          config.temperature = 0.8 // More creative for engaged users
        } else if (userPreferences.preferences.engagement.expandRate < 30) {
          config.temperature = 0.5 // More consistent for less engaged users
        }

        // Customize content based on preferred insight types
        const preferredTypes = recommendations.preferredInsightTypes || []
        const avoidTypes = recommendations.avoidInsightTypes || []

        config.emphasizeTopics = preferredTypes
        config.avoidTopics = avoidTypes
      }

      // Adjust for user experience level
      const trophies = userProfile?.quickClashTrophies || 1000
      if (trophies < 800) {
        config.tone = 'encouraging'
        config.depth = 'concise'
        config.focus = 'learning'
      } else if (trophies > 2000) {
        config.tone = 'analytical'
        config.depth = 'detailed'
        config.focus = 'strategy'
      }

      return {
        success: true,
        config,
        personalizationLevel: userPreferences.hasData
          ? 'personalized'
          : 'default',
        userInsights: userPreferences,
      }
    } catch (error) {
      console.error('Error getting personalized prompt config:', error)
      return {
        success: false,
        config: {
          temperature: 0.7,
          tone: 'supportive',
          depth: 'moderate',
          focus: 'improvement',
          avoidTopics: [],
          emphasizeTopics: [],
          contentStyle: 'balanced',
          questionStyle: 'engaging',
        },
        personalizationLevel: 'default',
      }
    }
  }

  /**
   * Generate personalized system prompt based on user preferences
   */
  static async generatePersonalizedSystemPrompt({
    userId,
    promptType,
    battleContext,
    defaultPrompt,
  }) {
    try {
      const promptConfig = await this.getPersonalizedPromptConfig({
        userId,
        insightType: promptType,
        battleContext,
      })

      if (promptConfig.personalizationLevel === 'default') {
        return defaultPrompt
      }

      const { config } = promptConfig

      // Build personalized prompt sections
      const toneInstructions = await this.getToneInstructions(config.tone)
      const depthInstructions = await this.getDepthInstructions(config.depth)
      const focusInstructions = await this.getFocusInstructions(config.focus)
      const topicGuidance = await this.getTopicGuidance(
        config.emphasizeTopics,
        config.avoidTopics,
      )

      // Combine with base prompt
      const personalizedPrompt = `${defaultPrompt}

PERSONALIZATION SETTINGS:
${toneInstructions}
${depthInstructions}
${focusInstructions}
${topicGuidance}

Remember: This user has shown preferences for this style of analysis. Adapt accordingly while maintaining accuracy.`

      return personalizedPrompt
    } catch (error) {
      console.error('Error generating personalized prompt:', error)
      return defaultPrompt
    }
  }

  /**
   * Get tone-specific instructions
   */
  static async getToneInstructions(tone) {
    const toneMap = {
      supportive:
        'Use an encouraging, positive tone. Celebrate successes and frame challenges as opportunities.',
      direct:
        'Be straightforward and concise. Focus on facts and actionable insights.',
      analytical:
        'Use a data-driven, objective approach. Include specific metrics and detailed analysis.',
      encouraging:
        'Be motivational and confidence-building. Emphasize potential and growth.',
      friendly:
        'Use a casual, approachable tone while maintaining professionalism.',
    }

    return `TONE: ${toneMap[tone] || toneMap['supportive']}`
  }

  /**
   * Get depth-specific instructions
   */
  static async getDepthInstructions(depth) {
    const depthMap = {
      concise:
        'Keep responses brief and to the point. Maximum 40 words per insight.',
      moderate: 'Provide balanced detail. Around 50-70 words per insight.',
      detailed:
        'Give comprehensive analysis with examples. 80-100 words per insight.',
      comprehensive:
        'Provide thorough, multi-faceted analysis with context and examples.',
    }

    return `DEPTH: ${depthMap[depth] || depthMap['moderate']}`
  }

  /**
   * Get focus-specific instructions
   */
  static async getFocusInstructions(focus) {
    const focusMap = {
      improvement: 'Focus on actionable steps for better performance.',
      validation: 'Acknowledge good decisions and build on strengths.',
      strategy: 'Emphasize tactical and strategic considerations.',
      learning: 'Explain concepts and help user understand the game better.',
      achievement: 'Highlight accomplishments and milestone progress.',
    }

    return `FOCUS: ${focusMap[focus] || focusMap['improvement']}`
  }

  /**
   * Get topic guidance based on user preferences
   */
  static async getTopicGuidance(emphasizeTopics, avoidTopics) {
    let guidance = ''

    if (emphasizeTopics.length > 0) {
      guidance += `EMPHASIZE: Focus more on ${emphasizeTopics.join(
        ', ',
      )} insights as user responds well to these.\n`
    }

    if (avoidTopics.length > 0) {
      guidance += `MINIMIZE: Reduce focus on ${avoidTopics.join(
        ', ',
      )} as user shows less engagement with these.\n`
    }

    return guidance
  }

  /**
   * Select optimal questions based on user preferences
   */
  static async selectPersonalizedQuestions({
    userId,
    availableQuestions,
    battleContext,
    maxQuestions = 3,
  }) {
    try {
      const userPreferences =
        await QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights(
          { userId },
        )

      if (!userPreferences.hasData) {
        // Return first N questions for new users
        return availableQuestions.slice(0, maxQuestions)
      }

      const preferences = userPreferences.preferences
      const recommendations = userPreferences.recommendations

      // Score questions based on user preferences
      const scoredQuestions = availableQuestions.map(question => {
        let score = 0

        // Prefer question categories user likes
        const categoryPreference = preferences.categories[question.category]
        if (categoryPreference) {
          score += categoryPreference.avgRating * 10
        }

        // Prefer question types user engages with
        const typePreference = preferences.insightTypes[question.type]
        if (typePreference) {
          score += typePreference.avgRating * 15
        }

        // Bonus for recommended types
        if (recommendations.preferredInsightTypes?.includes(question.type)) {
          score += 25
        }

        // Penalty for avoided types
        if (recommendations.avoidInsightTypes?.includes(question.type)) {
          score -= 50
        }

        // Contextual bonuses
        if (
          battleContext.battleResult === 'win' &&
          question.category === 'achievement'
        ) {
          score += 20
        }
        if (
          battleContext.battleResult === 'loss' &&
          question.category === 'improvement'
        ) {
          score += 15
        }

        return { ...question, score }
      })

      // Sort by score and return top questions
      return scoredQuestions
        .sort((a, b) => b.score - a.score)
        .slice(0, maxQuestions)
    } catch (error) {
      console.error('Error selecting personalized questions:', error)
      return availableQuestions.slice(0, maxQuestions)
    }
  }

  /**
   * Generate adaptive follow-up questions based on user engagement
   */
  static async generateAdaptiveFollowUp({
    userId,
    previousAnswers,
    currentEngagement,
    battleContext,
  }) {
    try {
      const userPreferences =
        await QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights(
          { userId },
        )

      const messages = [
        {
          role: 'system',
          content: `Generate adaptive follow-up questions based on user engagement and preferences.

CONTEXT: Quick Clash team battle analysis system with personalized AI insights.

USER ENGAGEMENT DATA:
- Previous answers engagement: ${JSON.stringify(currentEngagement)}
- User preferences: ${JSON.stringify(userPreferences.preferences || {})}

Generate questions that match the user's demonstrated preferences and engagement patterns.

Output JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "category": "tactical | strategic | psychological | improvement",
      "emoji": "appropriate emoji",
      "preview": "Preview text",
      "reasoning": "Why this question for this user"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Previous Answers: ${JSON.stringify(previousAnswers)}
Battle Context: ${JSON.stringify(battleContext)}
Current Engagement: ${JSON.stringify(currentEngagement)}

Generate 1-2 adaptive follow-up questions.`,
        },
      ]

      const response = await makeGPTRequest({
        messages,
        temperature: 0.6,
      })

      return response?.questions || []
    } catch (error) {
      console.error('Error generating adaptive follow-up:', error)
      return []
    }
  }

  /**
   * Track user interaction patterns for continuous learning
   */
  static async trackInteractionPattern({
    userId,
    interactionType,
    content,
    engagement,
    outcome,
  }) {
    try {
      // This could be implemented as a separate tracking system
      // For now, we'll log the interaction for analysis
      console.log(`User ${userId} interaction:`, {
        type: interactionType,
        engagement,
        outcome,
        timestamp: new Date(),
      })

      // In a full implementation, this would:
      // 1. Store interaction data
      // 2. Update user preference model
      // 3. Trigger re-analysis if needed
      // 4. Update recommendation weights

      return { success: true, tracked: true }
    } catch (error) {
      console.error('Error tracking interaction pattern:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get A/B testing configuration for AI improvements
   */
  static async getABTestingConfig({ userId, feature }) {
    try {
      // Simple A/B testing based on user ID hash
      const userHash = userId
        .toString()
        .split('')
        .reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0)

      const testGroup = Math.abs(userHash) % 100

      const configs = {
        question_depth: {
          control: { depth: 'moderate', temperature: 0.7 },
          test: { depth: 'detailed', temperature: 0.8 },
        },
        tone_experiment: {
          control: { tone: 'supportive' },
          test: { tone: 'analytical' },
        },
        personalization_level: {
          control: { personalization: 'basic' },
          test: { personalization: 'advanced' },
        },
      }

      const config = configs[feature]
      if (!config) {
        return { group: 'control', config: {} }
      }

      return {
        group: testGroup < 50 ? 'control' : 'test',
        config: testGroup < 50 ? config.control : config.test,
        testGroup,
      }
    } catch (error) {
      console.error('Error getting A/B testing config:', error)
      return { group: 'control', config: {} }
    }
  }

  /**
   * Update user preferences based on feedback
   */
  static async updateUserPreferences({ userId, feedbackData }) {
    try {
      // This would update the user's preference model
      // based on new feedback data

      const insights =
        await QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights(
          { userId },
        )

      // Analyze if preferences have shifted
      // Update recommendation weights
      // Trigger model updates if needed

      console.log(`Updated preferences for user ${userId}`)

      return { success: true, updated: true }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = QuickClashPersonalizationService
