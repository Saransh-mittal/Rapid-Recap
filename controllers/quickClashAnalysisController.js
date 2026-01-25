// controllers/quickClashAnalysisController.js (Updated for Simplified Feedback)
const asyncHandler = require('express-async-handler')
const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashTeamTrophyHistory = require('../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashTeamBattleAnalysis = require('../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const QuickClashFeedbackAnalyticsService = require('../services/quickClashServices/quickClashFeedbackAnalyticsService')
const QuickClashPersonalizationService = require('../services/quickClashServices/quickClashPersonalizationService')

const {
  calculateMVPAwards,
  getSimplifiedTrophyData,
  getEnhancedPerformanceLevel,
} = require('../services/quickClashServices/quickClashMVPService')

/**
 * @desc    Get team battle analysis with enhanced MVP recognition
 * @route   GET /api/quickClash/analysis/battle/:battleId
 * @access  Private
 */
const getTeamBattleAnalysis = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  try {
    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA', 'name avgTrophies')
      .populate('teamB', 'name avgTrophies')
      .populate(
        'teamAMembers.user',
        '_id name inGameName pic quickClashTrophies',
      )
      .populate(
        'teamBMembers.user',
        '_id name inGameName pic quickClashTrophies',
      )
      .populate({
        path: 'challenges.challenge',
        select:
          'category article status challenger opponent challengerScore opponentScore challengerAttempted opponentAttempted',
      })

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle analysis not found',
      })
    }

    const isTeamAMember = battle.teamAMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )
    const isTeamBMember = battle.teamBMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )

    if (!isTeamAMember && !isTeamBMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this battle analysis',
      })
    }

    // Get personalization config for this user
    const personalizationConfig =
      await QuickClashPersonalizationService.getPersonalizedPromptConfig({
        userId,
        insightType: 'battle_analysis',
        battleContext: { battleId, battleResult: battle.winner },
      })

    const existingAnalysis = await QuickClashTeamBattleAnalysis.findOne({
      battle: battleId,
      user: userId,
    })



    if (existingAnalysis) {
      console.log(
        `Found existing analysis for battle ${battleId}, user ${userId}.`,
      )
    }

    const trophyHistory = await QuickClashTeamTrophyHistory.find({
      teamBattle: battleId,
      user: userId,
    })

    // Enhanced MVP awards calculation with correct criteria
    const userTeam = isTeamAMember ? 'teamA' : 'teamB'
    const mvpAwards = calculateMVPAwards(battle, userTeam)

    // Add debug logging for MVP calculation in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`MVP Awards for battle ${battleId}, user team ${userTeam}:`, {
        matchMVP: mvpAwards.matchMVP
          ? {
              name: mvpAwards.matchMVP.user.name,
              team: mvpAwards.matchMVP.team,
              score: mvpAwards.matchMVP.score,
              category: mvpAwards.matchMVP.category,
              wonCategory: mvpAwards.matchMVP.wonCategory,
            }
          : 'None',
        teamMVP: mvpAwards.teamMVP
          ? {
              name: mvpAwards.teamMVP.user.name,
              team: mvpAwards.teamMVP.team,
              score: mvpAwards.teamMVP.score,
              category: mvpAwards.teamMVP.category,
              wonCategory: mvpAwards.teamMVP.wonCategory,
            }
          : 'None',
        pivotalPlayer: mvpAwards.pivotalPlayer
          ? {
              name: mvpAwards.pivotalPlayer.user.name,
              team: mvpAwards.pivotalPlayer.team,
              category: mvpAwards.pivotalPlayer.category,
              difference: mvpAwards.pivotalPlayer.difference,
            }
          : 'None',
        performanceRecognitions: mvpAwards.performanceRecognitions.length,
      })
    }

    const userMemberData = (
      isTeamAMember ? battle.teamAMembers : battle.teamBMembers
    ).find(member => member.user._id.toString() === userId.toString())

    const simplifiedTrophyData = getSimplifiedTrophyData(battle, userMemberData)

    const enhanceTeamMembers = members => {
      return members.map(member => {
        const memberObj = member.toObject ? member.toObject() : member

        return {
          ...memberObj,
          enhancedPerformance: getEnhancedPerformanceLevel(
            memberObj.score || 0,
          ),
          isMatchMVP:
            mvpAwards.matchMVP?.user._id.toString() ===
            memberObj.user._id.toString(),
          isTeamMVP:
            mvpAwards.teamMVP?.user._id.toString() ===
            memberObj.user._id.toString(),
          isPivotalPlayer:
            mvpAwards.pivotalPlayer?.user._id.toString() ===
            memberObj.user._id.toString(),
          // Add category win status
          wonCategory:
            mvpAwards.performanceRecognitions?.find(
              p => p.user._id.toString() === memberObj.user._id.toString(),
            )?.wonCategory || false,
        }
      })
    }

    const battleObj = battle.toObject()
    const enhancedBattle = {
      ...battleObj,
      teamAMembers: enhanceTeamMembers(battleObj.teamAMembers),
      teamBMembers: enhanceTeamMembers(battleObj.teamBMembers),
    }

    res.status(200).json({
      success: true,
      analysis: {
        battle: enhancedBattle,
        userTeam,
        trophyHistory,
        mvpAwards,
        simplifiedTrophyData,
        enhancedMemberPerformance: true,
        personalization: {
          level: personalizationConfig.personalizationLevel,
          config: personalizationConfig.config,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching team battle analysis:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve battle analysis',
    })
  }
})


/**
 * @desc    Submit simplified insight feedback with auto-scroll prevention
 * @route   POST /api/quickClash/analysis/insight-feedback
 * @access  Private
 */
const submitInsightFeedback = asyncHandler(async (req, res) => {
  const {
    analysisId,
    insightTitle,
    insightDescription,
    insightType,
    insightCategory,
    feedbackType,
    rating,
    comment,
    specificAspects,
    improvementSuggestions,
    implicitFeedback,
    contextData,
    preventAutoScroll, // NEW: Flag to prevent auto-scroll behavior
  } = req.body
  const userId = req.user._id

  // SIMPLIFIED: Only validate core required fields
  if (!analysisId || !insightTitle || !feedbackType || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Missing required feedback fields.',
      requiredFields: ['analysisId', 'insightTitle', 'feedbackType', 'rating'],
    })
  }

  // SIMPLIFIED: Validate feedback type against simplified options
  const validFeedbackTypes = ['helpful', 'not_helpful', 'excellent']
  if (!validFeedbackTypes.includes(feedbackType)) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid feedback type. Must be: helpful, not_helpful, or excellent.',
      validTypes: validFeedbackTypes,
    })
  }

  try {
    const analysis = await QuickClashTeamBattleAnalysis.findById(
      analysisId,
    ).populate('battle')

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.',
      })
    }

    // Determine battle result for context
    let battleResult = 'unknown'
    if (analysis.battle) {
      if (analysis.userTeam === analysis.battle.winner) {
        battleResult = 'win'
      } else if (analysis.battle.winner === 'tie') {
        battleResult = 'tie'
      } else {
        battleResult = 'loss'
      }
    }

    // Ensure the insight title is unique and never null
    const safeInsightTitle =
      insightTitle && insightTitle.trim()
        ? insightTitle.trim()
        : `Feedback-${userId.toString().slice(-8)}-${Date.now()}`

    // Enhanced mobile detection and context data processing
    const userAgent = req.headers['user-agent'] || ''
    const isMobileDevice =
      userAgent.includes('Mobile') ||
      userAgent.includes('Android') ||
      userAgent.includes('iPhone')
    const isTabletDevice =
      userAgent.includes('Tablet') || userAgent.includes('iPad')

    // Process device type with better detection
    let deviceType = 'desktop'
    if (contextData?.deviceType) {
      deviceType = contextData.deviceType
    } else if (isMobileDevice) {
      deviceType = 'mobile'
    } else if (isTabletDevice) {
      deviceType = 'tablet'
    }

    // SIMPLIFIED: Clean specific aspects - only keep essential ones
    const cleanedSpecificAspects = {}
    if (specificAspects) {
      const allowedAspects = ['accuracy', 'relevance', 'mobile_experience']
      Object.entries(specificAspects).forEach(([key, value]) => {
        if (
          allowedAspects.includes(key) &&
          value !== undefined &&
          value !== null
        ) {
          cleanedSpecificAspects[key] = value
        }
      })
    }

    // Use findOneAndUpdate with upsert to prevent duplicates
    const feedbackData = {
      battleAnalysis: analysisId,
      user: userId,
      battle: analysis.battle._id,

      // Enhanced insight data
      insightData: {
        title: safeInsightTitle,
        description: insightDescription || 'User feedback submission',
        type: insightType || 'general',
        category: insightCategory || 'general',
        generationContext: {
          userExperienceLevel:
            req.user.level >= 10 ? 'intermediate' : 'beginner',
          battleCount: analysis.meta?.battleCount || 0,
          promptVersion: analysis.meta?.version || '3.2.0',
          temperature: 0.7,
        },
      },

      // SIMPLIFIED: Explicit feedback with core types only
      explicitFeedback: {
        type: feedbackType,
        rating: Math.max(1, Math.min(5, rating)), // Ensure rating is between 1-5
        comment: comment || '',
        specificAspects: cleanedSpecificAspects,
        improvement_suggestions: improvementSuggestions || '',
      },

      // Implicit feedback (behavioral data)
      implicitFeedback: implicitFeedback || {
        timeSpent: { readingTime: 0, totalViewTime: 0, revisitCount: 0 },
        interactions: {
          expanded: false,
          scrollDepth: 0,
          clickedFollowUp: false,
          sharedInsight: false,
          screenshotTaken: false,
        },
        followUpBehavior: {
          askedFollowUp: false,
          followUpEngagementTime: 0,
        },
      },

      // Enhanced context data with mobile support and auto-scroll prevention
      contextData: {
        userTrophies: req.user.quickClashTrophies || 1000,
        userLevel: req.user.level || 0,
        deviceType: deviceType,
        battleResult: battleResult,
        userScore: contextData?.userScore || 0,
        trophyChange: contextData?.trophyChange || 0,
        teamRole: contextData?.teamRole || 'average',
        // Mobile-specific enhancements
        screenSize:
          contextData?.screenSize ||
          `${req.headers['screen-width'] || 'unknown'}x${
            req.headers['screen-height'] || 'unknown'
          }`,
        touchSupport: contextData?.touchSupport || isMobileDevice,
        mobileOptimized: contextData?.mobileOptimized || false,
        priorityFeedback: contextData?.priorityFeedback || false,
        // NEW: Auto-scroll prevention tracking
        preventAutoScroll: preventAutoScroll || false,
        sectionId: contextData?.sectionId || null,
        ...contextData,
      },

      // AI metadata
      aiMetadata: {
        modelVersion: analysis.meta?.openAIModel || 'gpt-4o-mini',
        promptHash: analysis.meta?.version || '3.2.0',
        generationLatency: analysis.meta?.generationTimeMs || 0,
      },
    }

    // Try to update existing feedback first, then create if none exists
    const existingFeedback = await QuickClashInsightFeedback.findOneAndUpdate(
      {
        battleAnalysis: analysisId,
        user: userId,
        'insightData.title': safeInsightTitle,
      },
      {
        $set: {
          ...feedbackData,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    )

    let newFeedback = existingFeedback

    if (!existingFeedback) {
      // Create new feedback if none exists
      try {
        newFeedback = new QuickClashInsightFeedback(feedbackData)
        await newFeedback.save()
      } catch (createError) {
        if (createError.code === 11000) {
          // Duplicate key error - try to find and return existing feedback
          newFeedback = await QuickClashInsightFeedback.findOne({
            battleAnalysis: analysisId,
            user: userId,
            'insightData.title': safeInsightTitle,
          })

          if (!newFeedback) {
            throw createError // Re-throw if we still can't find it
          }
        } else {
          throw createError
        }
      }
    }

    // Update user preferences based on feedback (if personalization service available)
    try {
      await QuickClashPersonalizationService.updateUserPreferences({
        userId,
        feedbackData: newFeedback,
      })
    } catch (personalizationError) {
      // Don't fail the entire request if personalization fails
      console.warn(
        'Personalization update failed:',
        personalizationError.message,
      )
    }

    // SIMPLIFIED: Enhanced response with mobile-specific messaging and auto-scroll prevention
    const responseMessage =
      deviceType === 'mobile'
        ? 'Mobile feedback submitted successfully - thank you for helping improve the mobile experience!'
        : 'Feedback submitted successfully.'

    res.status(201).json({
      success: true,
      message: responseMessage,
      feedback: {
        id: newFeedback._id,
        type: feedbackType,
        rating: rating,
        processingStatus: newFeedback.processingStatus,
        deviceType: deviceType,
        isMobileFeedback: deviceType === 'mobile',
        preventAutoScroll: preventAutoScroll || false, // NEW: Include auto-scroll prevention flag
        simplified: true, // NEW: Flag indicating simplified feedback system
      },
      // NEW: Auto-scroll prevention guidance
      guidance: {
        preventAutoScroll: preventAutoScroll,
        message: preventAutoScroll
          ? 'Feedback submitted without triggering additional widgets.'
          : 'Standard feedback submission completed.',
      },
    })
  } catch (error) {
    console.error('Error submitting simplified insight feedback:', error)

    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Feedback already exists for this insight.',
        isDuplicate: true,
        simplified: true,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      simplified: true,
    })
  }
})

/**
 * @desc    Track engagement data (for implicit feedback) with enhanced duplicate prevention
 * @route   POST /api/quickClash/analysis/track-engagement
 * @access  Private
 */
const trackEngagement = asyncHandler(async (req, res) => {
  const { analysisId, engagementData } = req.body
  const userId = req.user._id

  if (!analysisId || !engagementData) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    })
  }

  try {
    // Validate engagement data
    if (!engagementData.timeSpent || engagementData.timeSpent < 1000) {
      return res.status(200).json({
        success: true,
        message: 'Engagement too short to track',
      })
    }

    // Generate a safe, unique title for engagement tracking
    const engagementTitle = `Engagement-${userId
      .toString()
      .slice(-8)}-${analysisId.toString().slice(-8)}-${Date.now()}`

    // Use findOneAndUpdate with upsert to safely handle engagement data
    const result = await QuickClashInsightFeedback.findOneAndUpdate(
      {
        battleAnalysis: analysisId,
        user: userId,
        'insightData.type': 'battle_recap',
        'explicitFeedback.type': 'not_provided',
      },
      {
        $set: {
          'implicitFeedback.timeSpent.readingTime': Math.max(
            engagementData.readingTime || 0,
            0,
          ),
          'implicitFeedback.timeSpent.totalViewTime': Math.max(
            engagementData.timeSpent || 0,
            0,
          ),
          'implicitFeedback.interactions.scrollDepth': Math.min(
            Math.max(engagementData.scrollDepth || 0, 0),
            100,
          ),
          'implicitFeedback.interactions.expanded': Boolean(
            engagementData.expanded,
          ),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          // Only set these fields if creating a new document
          battleAnalysis: analysisId,
          user: userId,
          'insightData.title': engagementTitle,
          'insightData.description': 'User engagement tracking data',
          'insightData.type': 'battle_recap',
          'insightData.category': 'general',
          'insightData.generationContext': {
            userExperienceLevel:
              req.user.level >= 10 ? 'intermediate' : 'beginner',
            battleCount: 0,
            promptVersion: 'engagement_tracking_v1',
            temperature: 0,
          },
          'explicitFeedback.type': 'not_provided',
          'explicitFeedback.rating': 3,
          'explicitFeedback.comment': 'Engagement tracking only',
          'contextData.userTrophies': req.user.quickClashTrophies || 1000,
          'contextData.userLevel': req.user.level || 0,
          'contextData.deviceType': req.headers['user-agent']?.includes(
            'Mobile',
          )
            ? 'mobile'
            : 'desktop',
          'contextData.sessionLength': engagementData.timeSpent || 0,
          'processingStatus.analyzed': false,
          'processingStatus.includedInMetrics': true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )

    if (result) {
      console.log(`Successfully tracked engagement for user ${userId}`)
    }

    res.status(200).json({
      success: true,
      message: 'Engagement data tracked successfully',
    })
  } catch (error) {
    console.error('Error tracking engagement:', error)

    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      console.log('Engagement tracking duplicate prevented for user:', userId)
      return res.status(200).json({
        success: true,
        message: 'Engagement data already tracked',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to track engagement data',
    })
  }
})

/**
 * @desc    Get user's battle history analysis with personalization insights
 * @route   GET /api/quickClash/analysis/history
 * @access  Private
 */
const getUserBattleAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { limit = 10 } = req.query

  try {
    const [trophyHistory, userPersonalization, feedbackMetrics] =
      await Promise.all([
        QuickClashTeamTrophyHistory.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .populate('team', 'name')
          .populate('opponentTeam', 'name')
          .populate('teamBattle'),

        QuickClashFeedbackAnalyticsService.getUserPersonalizationInsights({
          userId,
        }),

        QuickClashFeedbackAnalyticsService.getFeedbackMetrics({ days: 30 }),
      ])

    const stats = await calculateUserBattleStats(userId)

    res.status(200).json({
      success: true,
      trophyHistory,
      stats,
      personalization: userPersonalization,
      systemMetrics: feedbackMetrics,
      insights: {
        hasPersonalizedData: userPersonalization.hasData,
        totalFeedbackGiven: userPersonalization.totalFeedback || 0,
        recommendedImprovements:
          userPersonalization.recommendations?.top_3_improvements || [],
      },
    })
  } catch (error) {
    console.error('Error fetching user battle analysis:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve battle history',
    })
  }
})

/**
 * @desc    Get feedback analytics dashboard data
 * @route   GET /api/quickClash/analysis/feedback-analytics
 * @access  Private (Admin only - add admin middleware)
 */
const getFeedbackAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 30, detailed = false } = req.query

  try {
    const [metrics, patterns] = await Promise.all([
      QuickClashFeedbackAnalyticsService.getFeedbackMetrics({
        days: parseInt(timeframe),
      }),
      detailed
        ? QuickClashFeedbackAnalyticsService.analyzeFeedbackPatterns({
            timeframe: parseInt(timeframe),
          })
        : Promise.resolve({ insights: [] }),
    ])

    res.status(200).json({
      success: true,
      timeframe: `Last ${timeframe} days`,
      metrics: metrics.metrics,
      patterns: patterns.insights || [],
      recommendations: patterns.overall_recommendations || {},
      generated: new Date(),
      simplified: true, // NEW: Flag indicating simplified system
    })
  } catch (error) {
    console.error('Error fetching feedback analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback analytics',
    })
  }
})

/**
 * @desc    Trigger manual feedback analysis
 * @route   POST /api/quickClash/analysis/analyze-feedback
 * @access  Private (Admin only)
 */
const triggerFeedbackAnalysis = asyncHandler(async (req, res) => {
  const { timeframe = 7, minFeedbackCount = 5 } = req.body

  try {
    const analysis =
      await QuickClashFeedbackAnalyticsService.analyzeFeedbackPatterns({
        timeframe: parseInt(timeframe),
        minFeedbackCount: parseInt(minFeedbackCount),
      })

    res.status(200).json({
      success: true,
      message: 'Feedback analysis completed',
      analysis: {
        totalAnalyzed: analysis.totalFeedbackAnalyzed,
        insights: analysis.insights,
        recommendations: analysis.overall_recommendations,
      },
      simplified: true, // NEW: Flag indicating simplified system
    })
  } catch (error) {
    console.error('Error triggering feedback analysis:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to analyze feedback',
    })
  }
})

// Helper function (unchanged)
const calculateUserBattleStats = async userId => {
  const history = await QuickClashTeamTrophyHistory.find({ user: userId })

  const totalBattles = history.length
  const wins = history.filter(h => h.result === 'win').length
  const losses = history.filter(h => h.result === 'loss').length
  const ties = history.filter(h => h.result === 'tie').length

  const totalTrophiesGained = history
    .filter(h => h.trophiesChange > 0)
    .reduce((sum, h) => sum + h.trophiesChange, 0)

  const totalTrophiesLost = history
    .filter(h => h.trophiesChange < 0)
    .reduce((sum, h) => sum + Math.abs(h.trophiesChange), 0)

  const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0

  return {
    totalBattles,
    wins,
    losses,
    ties,
    totalTrophiesGained,
    totalTrophiesLost,
    netTrophies: totalTrophiesGained - totalTrophiesLost,
    winRate: Math.round(winRate * 10) / 10,
    averageTrophiesPerWin:
      wins > 0 ? Math.round(totalTrophiesGained / wins) : 0,
    averageTrophiesPerLoss:
      losses > 0 ? Math.round(totalTrophiesLost / losses) : 0,
  }
}

module.exports = {
  getTeamBattleAnalysis,
  getUserBattleAnalysis,
  submitInsightFeedback,
  trackEngagement,
  getFeedbackAnalytics,
  triggerFeedbackAnalysis,
}
