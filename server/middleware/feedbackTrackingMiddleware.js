// middleware/feedbackTrackingMiddleware.js
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const QuickClashTeamBattleAnalysis = require('../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')

/**
 * Middleware for automatic feedback collection based on user interactions
 */

// Enhanced cache to prevent duplicate feedback creation
const creationCache = new Map()
const CACHE_DURATION = 60000 // Increased to 60 seconds
const activeCreations = new Set() // Track ongoing creation processes

/**
 * Track page/analysis view time and interactions with improved debouncing
 */
const trackAnalysisInteraction = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send

  // Override send to track response time
  res.send = function (data) {
    // Calculate response time
    const responseTime = Date.now() - req.startTime

    // Track if this is an analysis request
    if (req.route?.path?.includes('analysis') && req.user) {
      // Use setImmediate with enhanced debouncing
      const cacheKey = `${req.user._id}_${req.route.path}_${req.method}_${
        req.params?.battleId || 'no-battle'
      }`
      const now = Date.now()

      if (
        !creationCache.has(cacheKey) ||
        now - creationCache.get(cacheKey) > CACHE_DURATION
      ) {
        creationCache.set(cacheKey, now)

        setImmediate(async () => {
          try {
            await recordInteractionData(req, res, responseTime, data)
          } catch (error) {
            console.error('Error tracking analysis interaction:', error)
          }
        })
      }
    }

    // Call original send
    originalSend.call(this, data)
  }

  // Track request start time
  req.startTime = Date.now()
  next()
}

/**
 * Record interaction data for analysis with enhanced duplicate prevention
 */
const recordInteractionData = async (req, res, responseTime, responseData) => {
  try {
    const userId = req.user._id
    const method = req.method
    const path = req.route.path
    const statusCode = res.statusCode

    // Only track successful analysis requests
    if (statusCode !== 200 || !path.includes('analysis')) {
      return
    }

    let parsedResponse = null
    try {
      parsedResponse =
        typeof responseData === 'string'
          ? JSON.parse(responseData)
          : responseData
    } catch (e) {
      return // Skip if can't parse response
    }

    // Extract analysis information
    const analysisId =
      parsedResponse?.analysis?.analysisId ||
      req.params?.battleId ||
      req.body?.analysisId

    if (!analysisId) return

    // Create interaction data
    const interactionData = {
      user: userId,
      analysisId,
      interactionType: getInteractionType(path, method),
      timestamp: new Date(req.startTime),
      responseTime,
      deviceInfo: extractDeviceInfo(req),
      contextData: extractContextData(req, parsedResponse),
    }

    // Queue for background processing with enhanced debouncing
    setImmediate(() => processInteractionData(interactionData))
  } catch (error) {
    console.error('Error recording interaction data:', error)
  }
}

/**
 * Determine interaction type from path and method
 */
const getInteractionType = (path, method) => {
  if (path.includes('/battle/') && method === 'GET') {
    return 'analysis_view'
  } else if (path.includes('/answer-question') && method === 'POST') {
    return 'question_answer'
  } else if (path.includes('/history') && method === 'GET') {
    return 'history_view'
  } else if (path.includes('/insight-feedback') && method === 'POST') {
    return 'explicit_feedback'
  }
  return 'unknown'
}

/**
 * Extract device and browser information
 */
const extractDeviceInfo = req => {
  const userAgent = req.headers['user-agent'] || ''

  return {
    userAgent,
    deviceType: userAgent.includes('Mobile')
      ? 'mobile'
      : userAgent.includes('Tablet')
      ? 'tablet'
      : 'desktop',
    browser: extractBrowser(userAgent),
    ip: req.ip || req.connection.remoteAddress,
    referrer: req.headers.referer || null,
  }
}

/**
 * Extract browser information from user agent
 */
const extractBrowser = userAgent => {
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Edge')) return 'edge'
  return 'unknown'
}

/**
 * Extract context data from request and response
 */
const extractContextData = (req, response) => {
  const context = {
    sessionId: req.sessionID || req.headers['x-session-id'],
    timestamp: new Date(),
    method: req.method,
    path: req.route?.path,
  }

  // Add response-specific context
  if (response?.analysis) {
    context.battleId = response.analysis.battle?._id
    context.userTeam = response.analysis.userTeam
    context.hasRecap = !!response.analysis.battleRecap
    context.questionCount = response.analysis.followUpQuestions?.length || 0
    context.personalizationLevel = response.analysis.personalization?.level
  }

  return context
}

/**
 * Process interaction data in background with enhanced error handling and duplicate prevention
 */
const processInteractionData = async interactionData => {
  try {
    const {
      user,
      analysisId,
      interactionType,
      timestamp,
      responseTime,
      deviceInfo,
      contextData,
    } = interactionData

    // Create a unique key for this specific interaction
    const interactionKey = `${user}_${analysisId}_${interactionType}_${Math.floor(
      timestamp.getTime() / 60000,
    )}` // Group by minute

    // Skip if we're already processing this interaction
    if (activeCreations.has(interactionKey)) {
      console.log('Skipping duplicate interaction processing:', interactionKey)
      return
    }

    activeCreations.add(interactionKey)

    try {
      // Find or create analysis record
      let analysis = null
      if (contextData.battleId) {
        analysis = await QuickClashTeamBattleAnalysis.findOne({
          battle: contextData.battleId,
          user: user,
        })
      }

      if (!analysis && analysisId) {
        analysis = await QuickClashTeamBattleAnalysis.findById(analysisId)
      }

      if (!analysis) {
        console.log('No analysis found for interaction tracking')
        return
      }

      // Generate a guaranteed non-null insight title
      const safeInsightTitle = generateSafeInsightTitle(
        interactionType,
        contextData,
        user,
        analysis._id,
      )

      // Use findOneAndUpdate with upsert to prevent duplicates
      const existingFeedback = await QuickClashInsightFeedback.findOneAndUpdate(
        {
          battleAnalysis: analysis._id,
          user: user,
          'insightData.title': safeInsightTitle,
        },
        {
          $inc: {
            'implicitFeedback.timeSpent.totalViewTime': responseTime,
            'implicitFeedback.timeSpent.revisitCount': 1,
          },
          $set: {
            updatedAt: new Date(),
            'contextData.deviceType': deviceInfo.deviceType,
            'contextData.sessionLength': responseTime,
          },
        },
        {
          new: true,
          upsert: false, // Don't create, just update if exists
        },
      )

      if (!existingFeedback) {
        // Only create new feedback for meaningful interactions and if none exists
        if (interactionType === 'analysis_view' && responseTime > 5000) {
          await createImplicitFeedbackSafely(
            analysis,
            user,
            interactionType,
            responseTime,
            deviceInfo,
            contextData,
            safeInsightTitle,
          )
        }
      } else {
        console.log(`Updated existing implicit feedback for user ${user}`)
      }
    } finally {
      // Always remove from active creations
      activeCreations.delete(interactionKey)
    }
  } catch (error) {
    // Enhanced error handling for duplicate key errors
    if (error.code === 11000) {
      console.log('Duplicate feedback prevented (this is expected):', {
        userId: interactionData.user,
        interactionType: interactionData.interactionType,
        error: error.keyValue,
      })
    } else {
      console.error('Error processing interaction data:', error)
    }
  }
}

/**
 * Create new implicit feedback entry with enhanced duplicate prevention using upsert
 */
const createImplicitFeedbackSafely = async (
  analysis,
  userId,
  interactionType,
  responseTime,
  deviceInfo,
  contextData,
  safeInsightTitle,
) => {
  try {
    const implicitData = {
      timeSpent: {
        readingTime: 0,
        totalViewTime: responseTime,
        revisitCount: 1,
      },
      interactions: {
        expanded: false,
        scrollDepth: 0,
        clickedFollowUp: interactionType === 'question_answer',
        sharedInsight: false,
        screenshotTaken: false,
      },
      followUpBehavior: {
        askedFollowUp: interactionType === 'question_answer',
        followUpEngagementTime:
          interactionType === 'question_answer' ? responseTime : 0,
      },
    }

    // Use findOneAndUpdate with upsert for atomic operation
    const feedback = await QuickClashInsightFeedback.findOneAndUpdate(
      {
        battleAnalysis: analysis._id,
        user: userId,
        'insightData.title': safeInsightTitle,
      },
      {
        $setOnInsert: {
          // Only set these on insert, not update
          battleAnalysis: analysis._id,
          user: userId,
          battle: analysis.battle,
          insightData: {
            title: safeInsightTitle,
            description: generateSafeDescription(interactionType),
            type: mapInteractionTypeToInsightType(interactionType),
            category: 'general',
            generationContext: {
              userExperienceLevel: 'unknown',
              battleCount: 0,
              promptVersion: 'implicit_tracking_v3',
              temperature: 0,
            },
          },
          explicitFeedback: {
            type: 'not_provided',
            rating: 3,
            comment: 'Implicit feedback - no explicit rating provided',
          },
          aiMetadata: {
            modelVersion: 'implicit_tracking_v3',
            generationLatency: 0,
          },
          processingStatus: {
            analyzed: false,
            usedForTraining: false,
            includedInMetrics: true,
            contributedToImprovement: false,
          },
        },
        $set: {
          // Always update these fields
          implicitFeedback: implicitData,
          contextData: {
            deviceType: deviceInfo.deviceType,
            sessionLength: responseTime,
            battlesAnalyzedInSession: 1,
            ...contextData,
          },
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )

    console.log(
      `Safely created/updated implicit feedback for user ${userId}, interaction: ${interactionType}, title: ${safeInsightTitle}`,
    )

    return feedback
  } catch (error) {
    // Even with upsert, handle any remaining duplicate key errors gracefully
    if (error.code === 11000) {
      console.log('Upsert prevented duplicate for:', {
        userId,
        interactionType,
        battleAnalysis: analysis._id,
        title: safeInsightTitle,
      })
      return null
    } else {
      throw error // Re-throw non-duplicate errors
    }
  }
}

/**
 * Generate a guaranteed non-null, unique insight title
 */
const generateSafeInsightTitle = (
  interactionType,
  contextData,
  userId,
  analysisId,
) => {
  const timestamp = Date.now()
  const userShort = userId.toString().slice(-8) // Last 8 chars of user ID
  const analysisShort = analysisId.toString().slice(-8) // Last 8 chars of analysis ID

  switch (interactionType) {
    case 'analysis_view':
      return `Battle Analysis View - ${userShort}-${analysisShort}-${timestamp}`
    case 'question_answer':
      return `Q&A Interaction - ${userShort}-${analysisShort}-${timestamp}`
    case 'history_view':
      return `Battle History View - ${userShort}-${analysisShort}-${timestamp}`
    case 'explicit_feedback':
      return `Feedback Submission - ${userShort}-${analysisShort}-${timestamp}`
    default:
      return `User Interaction - ${interactionType} - ${userShort}-${analysisShort}-${timestamp}`
  }
}

/**
 * Generate safe description for interaction type
 */
const generateSafeDescription = interactionType => {
  switch (interactionType) {
    case 'analysis_view':
      return 'User viewed battle analysis page'
    case 'question_answer':
      return 'User interacted with Q&A system'
    case 'history_view':
      return 'User viewed battle history'
    case 'explicit_feedback':
      return 'User provided explicit feedback'
    default:
      return `User performed ${interactionType} action`
  }
}

/**
 * Map interaction type to insight type
 */
const mapInteractionTypeToInsightType = interactionType => {
  switch (interactionType) {
    case 'analysis_view':
      return 'battle_recap'
    case 'question_answer':
      return 'follow_up_question'
    case 'history_view':
      return 'general'
    case 'explicit_feedback':
      return 'general'
    default:
      return 'general'
  }
}

/**
 * Middleware to track specific user actions with better caching
 */
const trackUserAction = actionType => {
  return async (req, res, next) => {
    // Store action type for later processing
    req.userAction = actionType
    req.actionTimestamp = Date.now()

    next()
  }
}

/**
 * Track reading time and engagement for specific routes with improved handling
 */
const trackEngagement = async (req, res, next) => {
  if (req.method === 'POST' && req.body.engagementData && req.user) {
    const { readingTime, scrollDepth, expanded, timeSpent, analysisId } =
      req.body.engagementData

    // Validate required data
    if (!analysisId || !timeSpent || timeSpent < 1000) {
      return next() // Skip tracking for invalid or very short interactions
    }

    setImmediate(async () => {
      try {
        await updateEngagementDataSafely(req.user._id, analysisId, {
          readingTime,
          scrollDepth,
          expanded,
          timeSpent,
        })
      } catch (error) {
        console.error('Error updating engagement data:', error)
      }
    })
  }

  next()
}

/**
 * Update engagement data for existing feedback with enhanced error handling and upsert
 */
const updateEngagementDataSafely = async (
  userId,
  analysisId,
  engagementData,
) => {
  try {
    // Generate a safe title for finding/creating engagement feedback
    const safeTitle = `Engagement Tracking - ${userId
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
          'insightData.title': safeTitle,
          'insightData.description': 'User engagement tracking data',
          'insightData.type': 'battle_recap',
          'insightData.category': 'general',
          'explicitFeedback.type': 'not_provided',
          'explicitFeedback.rating': 3,
          'explicitFeedback.comment': 'Engagement tracking only',
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )

    if (result) {
      console.log(`Safely updated engagement data for user ${userId}`)
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log('Engagement tracking duplicate prevented for user:', userId)
    } else {
      console.error('Error updating engagement data:', error)
    }
  }
}

/**
 * Initialize automatic feedback tracking system with enhanced cleanup
 */
const initializeFeedbackTracking = () => {
  console.log(
    'Enhanced feedback tracking middleware initialized with duplicate prevention',
  )

  // Clear cache periodically to prevent memory leaks
  const cacheCleanup = setInterval(() => {
    const now = Date.now()

    // Clean creation cache
    for (const [key, timestamp] of creationCache.entries()) {
      if (now - timestamp > CACHE_DURATION * 2) {
        creationCache.delete(key)
      }
    }

    // Clean active creations that might be stuck
    activeCreations.clear()

    console.log(`Cache cleanup: ${creationCache.size} entries remaining`)
  }, CACHE_DURATION)

  // Start automatic cleanup of problematic implicit feedback
  const feedbackCleanup = setInterval(async () => {
    try {
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)

      // Clean up records with null titles (they shouldn't exist, but just in case)
      const nullTitleCleanup = await QuickClashInsightFeedback.deleteMany({
        'insightData.title': { $in: [null, undefined, ''] },
        createdAt: { $lt: oneHourAgo },
      })

      if (nullTitleCleanup.deletedCount > 0) {
        console.log(
          `Cleaned up ${nullTitleCleanup.deletedCount} records with null titles`,
        )
      }

      // Clean up very short interactions
      const shortInteractionCleanup =
        await QuickClashInsightFeedback.deleteMany({
          'implicitFeedback.timeSpent.totalViewTime': { $lt: 2000 },
          'explicitFeedback.type': 'not_provided',
          createdAt: { $lt: oneHourAgo },
        })

      if (shortInteractionCleanup.deletedCount > 0) {
        console.log(
          `Cleaned up ${shortInteractionCleanup.deletedCount} short interaction records`,
        )
      }
    } catch (error) {
      console.error('Error during feedback cleanup:', error)
    }
  }, 60 * 60 * 1000) // Every hour

  // Return cleanup function
  return () => {
    clearInterval(cacheCleanup)
    clearInterval(feedbackCleanup)
    creationCache.clear()
    activeCreations.clear()
  }
}

module.exports = {
  trackAnalysisInteraction,
  trackUserAction,
  trackEngagement,
  initializeFeedbackTracking,
}
