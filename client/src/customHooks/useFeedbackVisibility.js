// customHooks/useFeedbackVisibility.js
import { useMemo } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

// Simple debounce function since lodash might not be available
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Smart hook to determine when feedback widgets should be shown
 * Uses multiple criteria to avoid overwhelming users while collecting valuable feedback
 */
const useFeedbackVisibility = ({
  analysisId,
  battleId,
  userEngagement = {},
  enabled = true,
}) => {
  // Emergency disable option
  const emergencyDisabled = window.DISABLE_SMART_FEEDBACK || false

  const { user } = useSelector(state => state.auth)
  const [visibilityState, setVisibilityState] = useState({
    shouldShowWidget: false,
    shouldShowFloatingButton: false,
    reason: null,
    confidence: 0,
    lastChecked: null,
  })

  const sessionDataRef = useRef({
    analysisStartTime: Date.now(),
    interactionCount: 0,
    scrollEvents: 0,
    timeSpent: 0,
    hasEngaged: false,
  })

  // Configuration for feedback visibility rules
  const FEEDBACK_CONFIG = {
    // Time-based rules
    MIN_TIME_BETWEEN_FEEDBACK: 24 * 60 * 60 * 1000, // 24 hours
    MIN_SESSION_TIME: 30 * 1000, // 30 seconds minimum
    OPTIMAL_SESSION_TIME: 2 * 60 * 1000, // 2 minutes optimal

    // Engagement thresholds
    MIN_SCROLL_DEPTH: 40, // 40% scroll
    MIN_INTERACTION_COUNT: 3,
    HIGH_ENGAGEMENT_SCROLL: 70, // 70% scroll
    HIGH_ENGAGEMENT_TIME: 3 * 60 * 1000, // 3 minutes

    // Sampling rates (0-1)
    GENERAL_SAMPLING_RATE: 0.25, // Show to 25% of users
    HIGH_ENGAGEMENT_SAMPLING_RATE: 0.5, // Show to 50% of highly engaged users
    PRIORITY_ANALYSIS_SAMPLING_RATE: 0.4, // Show to 40% for priority analyses

    // User patterns
    MAX_FEEDBACK_PER_WEEK: 3,
    NEW_USER_BOOST_DAYS: 7, // Show more to users in first 7 days

    // Widget-specific rules
    FLOATING_BUTTON_DELAY: 45 * 1000, // Show floating button after 45 seconds
    WIDGET_DELAY: 60 * 1000, // Show widget after 1 minute
  }
  const stableUserId = useMemo(() => user?._id, [user?._id])
  // Get user's feedback history from localStorage (fallback storage) - memoized
  const getUserFeedbackHistory = useCallback(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem(`feedback_history_${stableUserId}`) || '{}',
      )
      return {
        lastFeedbackTime: history.lastFeedbackTime || 0,
        feedbackCount: history.feedbackCount || 0,
        weeklyCount: history.weeklyCount || 0,
        weekStart: history.weekStart || Date.now(),
        totalFeedback: history.totalFeedback || 0,
        avgRating: history.avgRating || 0,
        ...history,
      }
    } catch {
      return {
        lastFeedbackTime: 0,
        feedbackCount: 0,
        weeklyCount: 0,
        weekStart: Date.now(),
        totalFeedback: 0,
        avgRating: 0,
      }
    }
  }, [stableUserId])

  // Update user feedback history - memoized
  const updateFeedbackHistory = useCallback(
    updates => {
      if (!stableUserId) return

      try {
        const current = getUserFeedbackHistory()
        const updated = { ...current, ...updates }
        localStorage.setItem(
          `feedback_history_${stableUserId}`,
          JSON.stringify(updated),
        )
      } catch (error) {
        console.warn('Failed to update feedback history:', error)
      }
    },
    [stableUserId, getUserFeedbackHistory],
  )

  // Check if user is new (within NEW_USER_BOOST_DAYS) - memoized
  const isNewUser = useCallback(() => {
    if (!user?.createdAt) return false
    const userAge = Date.now() - new Date(user.createdAt).getTime()
    return userAge < FEEDBACK_CONFIG.NEW_USER_BOOST_DAYS * 24 * 60 * 60 * 1000
  }, [user?.createdAt])

  // Determine if analysis is high priority - memoized
  const isHighPriorityAnalysis = useCallback(() => {
    const trophyChange = Math.abs(userEngagement.trophyChange || 0)
    const isSignificantTrophy = trophyChange > 20
    const isMVP =
      userEngagement.teamRole === 'mvp' ||
      userEngagement.teamRole === 'top_performer'

    return isSignificantTrophy || isMVP
  }, [userEngagement.trophyChange, userEngagement.teamRole])

  // Calculate user engagement score - memoized
  const calculateEngagementScore = useCallback(() => {
    const {
      scrollDepth = 0,
      readingTime = 0,
      interactionCount = 0,
      questionsViewed = 0,
      sectionsExpanded = 0,
    } = userEngagement

    const currentTime = Date.now() - sessionDataRef.current.analysisStartTime

    let score = 0

    // Time-based scoring (0-30 points)
    if (currentTime > FEEDBACK_CONFIG.MIN_SESSION_TIME) {
      score += Math.min(
        30,
        (currentTime / FEEDBACK_CONFIG.OPTIMAL_SESSION_TIME) * 30,
      )
    }

    // Scroll-based scoring (0-25 points)
    score += Math.min(25, (scrollDepth / 100) * 25)

    // Interaction-based scoring (0-25 points)
    score += Math.min(25, (interactionCount / 10) * 25)

    // Content engagement scoring (0-20 points)
    score += Math.min(20, ((questionsViewed + sectionsExpanded) / 5) * 20)

    return Math.min(100, score)
  }, [
    userEngagement.scrollDepth,
    userEngagement.readingTime,
    userEngagement.interactionCount,
    userEngagement.questionsViewed,
    userEngagement.sectionsExpanded,
  ])

  // Memoized stability helpers
  const stableAnalysisId = useMemo(() => analysisId, [analysisId])

  // Determine visibility based on multiple factors - memoized and stable
  const determineVisibility = useCallback(() => {
    // Emergency disable check
    if (emergencyDisabled) {
      return {
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'emergency_disabled',
        confidence: 0,
      }
    }

    if (!enabled || !user || !stableAnalysisId) {
      return {
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'disabled_or_missing_data',
        confidence: 0,
      }
    }

    const history = getUserFeedbackHistory()
    const engagementScore = calculateEngagementScore()
    const currentTime = Date.now()
    const sessionTime = currentTime - sessionDataRef.current.analysisStartTime

    // Check if user has provided feedback recently
    const timeSinceLastFeedback = currentTime - history.lastFeedbackTime
    if (timeSinceLastFeedback < FEEDBACK_CONFIG.MIN_TIME_BETWEEN_FEEDBACK) {
      return {
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'recent_feedback',
        confidence: 100,
        nextEligibleTime:
          history.lastFeedbackTime + FEEDBACK_CONFIG.MIN_TIME_BETWEEN_FEEDBACK,
      }
    }

    // Check weekly feedback limit
    const weekAge = currentTime - history.weekStart
    const isNewWeek = weekAge > 7 * 24 * 60 * 60 * 1000

    if (isNewWeek) {
      // Reset weekly counter
      updateFeedbackHistory({
        weekStart: currentTime,
        weeklyCount: 0,
      })
      history.weeklyCount = 0
    }

    if (history.weeklyCount >= FEEDBACK_CONFIG.MAX_FEEDBACK_PER_WEEK) {
      return {
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'weekly_limit_reached',
        confidence: 100,
      }
    }

    // Calculate base probability
    let probability = FEEDBACK_CONFIG.GENERAL_SAMPLING_RATE
    let reason = 'general_sampling'

    // Boost probability for high engagement
    if (engagementScore > 70) {
      probability = FEEDBACK_CONFIG.HIGH_ENGAGEMENT_SAMPLING_RATE
      reason = 'high_engagement'
    }

    // Boost for high priority analyses
    if (isHighPriorityAnalysis()) {
      probability = Math.max(
        probability,
        FEEDBACK_CONFIG.PRIORITY_ANALYSIS_SAMPLING_RATE,
      )
      reason = 'priority_analysis'
    }

    // Boost for new users
    if (isNewUser()) {
      probability = Math.min(0.8, probability * 1.5)
      reason = 'new_user_boost'
    }

    // Reduce probability if user has low historical ratings
    if (history.avgRating > 0 && history.avgRating < 2.5) {
      probability *= 0.6
      reason = 'low_satisfaction_user'
    }

    // Generate deterministic but pseudo-random decision based on analysisId
    const hash = stableAnalysisId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff
    }, 0)
    const pseudoRandom = Math.abs(hash) / 0xffffffff

    const shouldShow = pseudoRandom < probability

    // Determine what to show based on session time and engagement
    let shouldShowWidget = false
    let shouldShowFloatingButton = false

    if (shouldShow) {
      // Show floating button first (less intrusive)
      if (sessionTime > FEEDBACK_CONFIG.FLOATING_BUTTON_DELAY) {
        shouldShowFloatingButton = true
      }

      // Show widget for highly engaged users or after longer session
      if (
        sessionTime > FEEDBACK_CONFIG.WIDGET_DELAY &&
        (engagementScore > 60 ||
          sessionTime > FEEDBACK_CONFIG.OPTIMAL_SESSION_TIME)
      ) {
        shouldShowWidget = true
        shouldShowFloatingButton = false // Widget replaces floating button
      }
    }

    return {
      shouldShowWidget,
      shouldShowFloatingButton,
      reason,
      confidence: Math.round(probability * 100),
      engagementScore: Math.round(engagementScore),
      sessionTime,
      timeSinceLastFeedback,
      weeklyFeedbackCount: history.weeklyCount,
    }
  }, [
    enabled,
    user,
    stableAnalysisId,
    stableUserId,
    emergencyDisabled,
    // Keep dependencies minimal to prevent loops
  ])

  // Track user interactions
  const trackInteraction = useCallback((type, data = {}) => {
    sessionDataRef.current.interactionCount++
    sessionDataRef.current.hasEngaged = true

    if (type === 'scroll') {
      sessionDataRef.current.scrollEvents++
    }

    sessionDataRef.current.timeSpent =
      Date.now() - sessionDataRef.current.analysisStartTime
  }, [])

  // Mark feedback as provided
  const markFeedbackProvided = useCallback(
    (feedbackType, rating = 3) => {
      const history = getUserFeedbackHistory()

      updateFeedbackHistory({
        lastFeedbackTime: Date.now(),
        feedbackCount: history.feedbackCount + 1,
        weeklyCount: history.weeklyCount + 1,
        totalFeedback: history.totalFeedback + 1,
        avgRating:
          history.totalFeedback > 0
            ? (history.avgRating * history.totalFeedback + rating) /
              (history.totalFeedback + 1)
            : rating,
        lastFeedbackType: feedbackType,
        lastAnalysisId: stableAnalysisId,
      })

      // Update visibility state
      setVisibilityState(prev => ({
        ...prev,
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'feedback_provided',
      }))
    },
    [stableAnalysisId, getUserFeedbackHistory, updateFeedbackHistory],
  )

  // Check visibility periodically - fixed to prevent infinite loops
  useEffect(() => {
    let mounted = true

    const checkVisibility = () => {
      if (!mounted) return

      const newState = determineVisibility()

      // Only update state if something actually changed
      setVisibilityState(prev => {
        const hasChanged =
          prev.shouldShowWidget !== newState.shouldShowWidget ||
          prev.shouldShowFloatingButton !== newState.shouldShowFloatingButton ||
          prev.reason !== newState.reason ||
          Math.abs(prev.confidence - newState.confidence) > 5 // Only update if confidence changed by more than 5%

        if (!hasChanged) {
          return prev // Don't update if nothing significant changed
        }

        return {
          ...prev,
          ...newState,
          lastChecked: Date.now(),
        }
      })
    }

    // Initial check with a slight delay to prevent immediate firing
    const initialTimeout = setTimeout(checkVisibility, 1000)

    // Periodic checks every 60 seconds (increased from 30 to reduce load)
    const interval = setInterval(() => {
      if (!mounted) return
      checkVisibility()
    }, 60000)

    return () => {
      mounted = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [stableAnalysisId, stableUserId, enabled]) // Reduced dependencies

  // Track scroll events
  useEffect(() => {
    const handleScroll = () => {
      trackInteraction('scroll', {
        scrollY: window.scrollY,
        scrollPercent: Math.round(
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
            100,
        ),
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackInteraction])

  return {
    // Main visibility flags
    shouldShowWidget: visibilityState.shouldShowWidget,
    shouldShowFloatingButton: visibilityState.shouldShowFloatingButton,

    // Detailed information
    visibilityReason: visibilityState.reason,
    confidence: visibilityState.confidence,
    engagementScore: visibilityState.engagementScore,

    // Control functions
    trackInteraction,
    markFeedbackProvided,

    // Force show/hide (for testing or special cases)
    forceShow: () =>
      setVisibilityState(prev => ({
        ...prev,
        shouldShowWidget: true,
        shouldShowFloatingButton: true,
        reason: 'forced',
      })),

    forceHide: () =>
      setVisibilityState(prev => ({
        ...prev,
        shouldShowWidget: false,
        shouldShowFloatingButton: false,
        reason: 'forced_hidden',
      })),

    // Debug information
    debugInfo:
      process.env.NODE_ENV === 'development'
        ? {
            ...visibilityState,
            sessionData: sessionDataRef.current,
            userHistory: getUserFeedbackHistory(),
            isNewUser: isNewUser(),
            isHighPriority: isHighPriorityAnalysis(),
          }
        : null,
  }
}

export default useFeedbackVisibility
