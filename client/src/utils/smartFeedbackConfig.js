// utils/smartFeedbackConfig.js
/**
 * Smart Feedback System Configuration
 * Centralized configuration for smart feedback visibility and behavior
 */

export const SMART_FEEDBACK_CONFIG = {
  // Core visibility thresholds
  VISIBILITY_THRESHOLDS: {
    MIN_TIME_BETWEEN_FEEDBACK: 24 * 60 * 60 * 1000, // 24 hours
    MIN_SESSION_TIME: 30 * 1000, // 30 seconds
    OPTIMAL_SESSION_TIME: 2 * 60 * 1000, // 2 minutes
    MIN_SCROLL_DEPTH: 40, // 40%
    MIN_INTERACTION_COUNT: 3,
    HIGH_ENGAGEMENT_SCROLL: 70, // 70%
    HIGH_ENGAGEMENT_TIME: 3 * 60 * 1000, // 3 minutes
    FLOATING_BUTTON_DELAY: 45 * 1000, // 45 seconds
    WIDGET_DELAY: 60 * 1000, // 1 minute
  },

  // Sampling rates for different scenarios
  SAMPLING_RATES: {
    GENERAL: 0.25, // 25% of users
    HIGH_ENGAGEMENT: 0.5, // 50% of highly engaged users
    PRIORITY_ANALYSIS: 0.4, // 40% for important battles
    NEW_USER_BOOST_MULTIPLIER: 1.5, // 150% of base rate for new users
    LOW_SATISFACTION_MULTIPLIER: 0.6, // 60% for users with low ratings
    MOBILE_BOOST_MULTIPLIER: 1.2, // 120% for mobile users
  },

  // User behavior limits
  USER_LIMITS: {
    MAX_FEEDBACK_PER_WEEK: 3,
    NEW_USER_BOOST_DAYS: 7,
    LOW_SATISFACTION_THRESHOLD: 2.5, // Below this rating = low satisfaction
  },

  // Engagement scoring weights
  ENGAGEMENT_WEIGHTS: {
    TIME_WEIGHT: 0.3, // 30% from time spent
    SCROLL_WEIGHT: 0.25, // 25% from scrolling
    INTERACTION_WEIGHT: 0.25, // 25% from interactions
    CONTENT_WEIGHT: 0.2, // 20% from content engagement
  },

  // Priority analysis detection
  PRIORITY_TRIGGERS: {
    SIGNIFICANT_TROPHY_CHANGE: 20, // Trophy change > 20
    MVP_ROLES: ['mvp', 'top_performer'],
    HIGH_SCORE_THRESHOLD: 800, // Score > 800
    CLOSE_BATTLE_MARGIN: 100, // Score difference < 100
  },

  // Device-specific configurations
  DEVICE_CONFIG: {
    MOBILE: {
      SAMPLING_BOOST: 1.2,
      MIN_SESSION_TIME: 25 * 1000, // 25 seconds (shorter for mobile)
      WIDGET_DELAY: 45 * 1000, // 45 seconds (faster for mobile)
      PRIORITY_CATEGORIES: ['mobile_experience', 'touch_interface'],
    },
    DESKTOP: {
      SAMPLING_BOOST: 1.0,
      MIN_SESSION_TIME: 30 * 1000,
      WIDGET_DELAY: 60 * 1000,
      PRIORITY_CATEGORIES: ['ui_design', 'information_density'],
    },
  },

  // Feedback quality scoring
  QUALITY_INDICATORS: {
    MIN_COMMENT_LENGTH: 10, // Minimum characters for quality feedback
    HELPFUL_RATING_THRESHOLD: 3, // Rating >= 3 considered helpful
    EXCELLENT_RATING_THRESHOLD: 4, // Rating >= 4 considered excellent
    DETAILED_ASPECTS_THRESHOLD: 2, // At least 2 aspects rated
  },

  // Analytics and tracking
  ANALYTICS: {
    TRACK_INTERVALS: 30 * 1000, // Track every 30 seconds
    BATCH_SIZE: 10, // Batch size for analytics
    RETENTION_DAYS: 90, // Keep data for 90 days
  },
}

/**
 * Smart Feedback Reason Messages
 * Localized messages for different visibility reasons
 */
export const SMART_FEEDBACK_MESSAGES = {
  high_engagement: {
    title: 'High Engagement Detected',
    mobile: 'You seem very engaged! Your mobile feedback is valuable.',
    desktop:
      'You seem very engaged with this analysis! Your thoughts would be valuable.',
    color: 'green',
    icon: 'Zap',
    priority: 'high',
  },
  priority_analysis: {
    title: 'Important Battle Analysis',
    mobile: 'This was an important battle - mobile feedback helps!',
    desktop: "This was an important battle - we'd love your detailed thoughts!",
    color: 'yellow',
    icon: 'Target',
    priority: 'high',
  },
  new_user_boost: {
    title: 'New User Perspective',
    mobile: 'Your fresh mobile perspective is highly valued!',
    desktop: 'Your fresh perspective as a new user is incredibly valuable!',
    color: 'blue',
    icon: 'Users',
    priority: 'medium',
  },
  general_sampling: {
    title: 'Feedback Request',
    mobile: 'Quick mobile feedback helps improve our AI!',
    desktop: 'Your feedback helps us provide better analysis!',
    color: 'purple',
    icon: 'Brain',
    priority: 'low',
  },
  low_satisfaction_user: {
    title: 'Help Us Improve',
    mobile: 'Help us improve your mobile experience!',
    desktop: 'Help us improve your analysis experience!',
    color: 'orange',
    icon: 'AlertCircle',
    priority: 'high',
  },
}

/**
 * Calculate engagement score based on user behavior
 */
export const calculateEngagementScore = engagementData => {
  const {
    scrollDepth = 0,
    timeSpent = 0,
    interactionCount = 0,
    questionsViewed = 0,
    sectionsExpanded = 0,
  } = engagementData

  const weights = SMART_FEEDBACK_CONFIG.ENGAGEMENT_WEIGHTS
  const thresholds = SMART_FEEDBACK_CONFIG.VISIBILITY_THRESHOLDS

  // Time score (0-100)
  const timeScore = Math.min(
    100,
    (timeSpent / thresholds.OPTIMAL_SESSION_TIME) * 100,
  )

  // Scroll score (0-100)
  const scrollScore = Math.min(100, scrollDepth)

  // Interaction score (0-100)
  const interactionScore = Math.min(100, (interactionCount / 10) * 100)

  // Content engagement score (0-100)
  const contentScore = Math.min(
    100,
    ((questionsViewed + sectionsExpanded) / 5) * 100,
  )

  // Weighted total
  const totalScore =
    timeScore * weights.TIME_WEIGHT +
    scrollScore * weights.SCROLL_WEIGHT +
    interactionScore * weights.INTERACTION_WEIGHT +
    contentScore * weights.CONTENT_WEIGHT

  return Math.min(100, Math.round(totalScore))
}

/**
 * Determine if analysis is high priority
 */
export const isHighPriorityAnalysis = userEngagement => {
  const triggers = SMART_FEEDBACK_CONFIG.PRIORITY_TRIGGERS
  const {
    trophyChange = 0,
    teamRole = 'average',
    userScore = 0,
    battleMargin = 999,
  } = userEngagement

  return (
    Math.abs(trophyChange) > triggers.SIGNIFICANT_TROPHY_CHANGE ||
    triggers.MVP_ROLES.includes(teamRole) ||
    userScore > triggers.HIGH_SCORE_THRESHOLD ||
    battleMargin < triggers.CLOSE_BATTLE_MARGIN
  )
}

/**
 * Get device-specific configuration
 */
export const getDeviceConfig = isMobile => {
  return isMobile
    ? SMART_FEEDBACK_CONFIG.DEVICE_CONFIG.MOBILE
    : SMART_FEEDBACK_CONFIG.DEVICE_CONFIG.DESKTOP
}

/**
 * Calculate sampling probability for user
 */
export const calculateSamplingProbability = ({
  baseRate,
  isHighEngagement = false,
  isPriorityAnalysis = false,
  isNewUser = false,
  avgRating = 0,
  isMobile = false,
}) => {
  let probability = baseRate

  // Apply multipliers
  if (isHighEngagement) {
    probability = Math.max(
      probability,
      SMART_FEEDBACK_CONFIG.SAMPLING_RATES.HIGH_ENGAGEMENT,
    )
  }

  if (isPriorityAnalysis) {
    probability = Math.max(
      probability,
      SMART_FEEDBACK_CONFIG.SAMPLING_RATES.PRIORITY_ANALYSIS,
    )
  }

  if (isNewUser) {
    probability = Math.min(
      0.8,
      probability *
        SMART_FEEDBACK_CONFIG.SAMPLING_RATES.NEW_USER_BOOST_MULTIPLIER,
    )
  }

  if (
    avgRating > 0 &&
    avgRating < SMART_FEEDBACK_CONFIG.USER_LIMITS.LOW_SATISFACTION_THRESHOLD
  ) {
    probability *=
      SMART_FEEDBACK_CONFIG.SAMPLING_RATES.LOW_SATISFACTION_MULTIPLIER
  }

  if (isMobile) {
    probability *= SMART_FEEDBACK_CONFIG.SAMPLING_RATES.MOBILE_BOOST_MULTIPLIER
  }

  return Math.min(1.0, Math.max(0.0, probability))
}

/**
 * Generate deterministic but pseudo-random decision
 */
export const generatePseudoRandom = seed => {
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff
  }, 0)
  return Math.abs(hash) / 0xffffffff
}

/**
 * Get smart feedback message for visibility reason
 */
export const getSmartFeedbackMessage = (reason, isMobile = false) => {
  const message =
    SMART_FEEDBACK_MESSAGES[reason] || SMART_FEEDBACK_MESSAGES.general_sampling
  return {
    ...message,
    message: isMobile ? message.mobile : message.desktop,
  }
}

/**
 * Validate feedback quality
 */
export const validateFeedbackQuality = feedbackData => {
  const quality = SMART_FEEDBACK_CONFIG.QUALITY_INDICATORS
  const {
    rating = 0,
    comment = '',
    specificAspects = {},
    type = '',
  } = feedbackData

  const hasQualityComment = comment.length >= quality.MIN_COMMENT_LENGTH
  const hasGoodRating = rating >= quality.HELPFUL_RATING_THRESHOLD
  const hasDetailedAspects =
    Object.keys(specificAspects).length >= quality.DETAILED_ASPECTS_THRESHOLD
  const isPositiveFeedback = ['helpful', 'excellent'].includes(type)

  return {
    isHighQuality:
      hasQualityComment &&
      hasGoodRating &&
      (hasDetailedAspects || isPositiveFeedback),
    isHelpful: hasGoodRating || isPositiveFeedback,
    hasComment: hasQualityComment,
    hasAspects: hasDetailedAspects,
    score: Math.round(
      (hasQualityComment ? 25 : 0) +
        (hasGoodRating ? 35 : 0) +
        (hasDetailedAspects ? 25 : 0) +
        (isPositiveFeedback ? 15 : 0),
    ),
  }
}

/**
 * Generate analytics event for smart feedback
 */
export const generateAnalyticsEvent = ({
  eventType,
  userId,
  analysisId,
  visibilityReason,
  confidence,
  engagementScore,
  deviceType,
  additionalData = {},
}) => {
  return {
    eventType,
    userId,
    analysisId,
    timestamp: Date.now(),
    smartFeedback: {
      reason: visibilityReason,
      confidence,
      engagementScore,
      deviceType,
    },
    sessionData: {
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      touchSupport: 'ontouchstart' in window,
      language: navigator.language,
    },
    ...additionalData,
  }
}

/**
 * Smart feedback system health check
 */
export const performHealthCheck = () => {
  const checks = {
    configLoaded: !!SMART_FEEDBACK_CONFIG,
    messagesLoaded: !!SMART_FEEDBACK_MESSAGES,
    localStorageAvailable: (() => {
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    })(),
    userAgentAvailable: !!navigator.userAgent,
    timestampAccurate: Date.now() > 1640000000000, // After 2022
  }

  const isHealthy = Object.values(checks).every(Boolean)

  return {
    isHealthy,
    checks,
    timestamp: Date.now(),
    version: '1.0.0',
  }
}

export default SMART_FEEDBACK_CONFIG
