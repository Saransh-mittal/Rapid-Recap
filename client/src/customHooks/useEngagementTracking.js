// customHooks/useEngagementTracking.js
// Optimized engagement tracking hook with batching and debouncing
import { useCallback, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { debounce } from 'lodash'

const useEngagementTracking = ({ analysisId, enabled = true }) => {
  const { user } = useSelector(state => state.auth)
  const engagementDataRef = useRef({
    startTime: Date.now(),
    interactions: [],
    scrollDepth: 0,
    expandedSections: new Set(),
    questionsViewed: new Set(),
    totalReadingTime: 0,
    lastScrollTime: Date.now(),
    feedbackGiven: false,
    deviceType: /Mobile|Tablet/.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop',
  })

  // Batch engagement data to reduce API calls
  const engagementBatch = useRef([])
  const batchTimeout = useRef(null)

  // Debounced scroll tracking
  const trackScroll = useCallback(
    debounce(() => {
      if (!enabled || !analysisId) return

      const scrollPercentage = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100,
      )

      if (scrollPercentage > engagementDataRef.current.scrollDepth) {
        engagementDataRef.current.scrollDepth = Math.min(scrollPercentage, 100)
        engagementDataRef.current.lastScrollTime = Date.now()

        // Add to batch if significant scroll change (every 25%)
        if (scrollPercentage % 25 === 0) {
          addToBatch('scroll_milestone', { depth: scrollPercentage })
        }
      }
    }, 500),
    [enabled, analysisId],
  )

  // Add engagement event to batch
  const addToBatch = useCallback(
    (type, data = {}) => {
      if (!enabled || !analysisId) return

      engagementBatch.current.push({
        type,
        data,
        timestamp: Date.now(),
      })

      // Clear existing timeout
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current)
      }

      // Set new timeout to send batch
      batchTimeout.current = setTimeout(sendBatch, 5000) // Send every 5 seconds
    },
    [enabled, analysisId],
  )

  // Send batched engagement data
  const sendBatch = useCallback(async () => {
    if (
      !enabled ||
      !analysisId ||
      !user ||
      engagementBatch.current.length === 0
    )
      return

    const currentTime = Date.now()
    const batchData = [...engagementBatch.current]
    engagementBatch.current = [] // Clear batch

    const engagementSummary = {
      analysisId,
      userId: user._id,
      sessionData: {
        totalTime: currentTime - engagementDataRef.current.startTime,
        scrollDepth: engagementDataRef.current.scrollDepth,
        interactionCount: batchData.length,
        expandedSections: Array.from(
          engagementDataRef.current.expandedSections,
        ),
        questionsViewed: Array.from(engagementDataRef.current.questionsViewed),
        feedbackGiven: engagementDataRef.current.feedbackGiven,
        deviceType: engagementDataRef.current.deviceType,
      },
      interactions: batchData,
      timestamp: currentTime,
    }

    try {
      await axios.post('/api/quickClash/analysis/track-engagement', {
        engagementData: engagementSummary,
      })

      console.log(
        'Engagement batch sent successfully:',
        batchData.length,
        'interactions',
      )
    } catch (error) {
      console.error('Failed to send engagement batch:', error)
      // Re-add failed batch to retry later
      engagementBatch.current.unshift(...batchData)
    }
  }, [enabled, analysisId, user])

  // Track section expansion
  const trackSectionExpansion = useCallback(
    sectionId => {
      engagementDataRef.current.expandedSections.add(sectionId)
      addToBatch('section_expanded', { sectionId })
    },
    [addToBatch],
  )

  // Track question viewing
  const trackQuestionView = useCallback(
    questionId => {
      engagementDataRef.current.questionsViewed.add(questionId)
      addToBatch('question_viewed', { questionId })
    },
    [addToBatch],
  )

  // Track feedback submission
  const trackFeedbackSubmission = useCallback(
    (feedbackType, rating) => {
      engagementDataRef.current.feedbackGiven = true
      addToBatch('feedback_submitted', { feedbackType, rating })
    },
    [addToBatch],
  )

  // Track reading time for specific content
  const trackReadingTime = useCallback(
    (contentId, timeSpent) => {
      engagementDataRef.current.totalReadingTime += timeSpent
      addToBatch('reading_time', { contentId, timeSpent })
    },
    [addToBatch],
  )

  // Setup scroll listener
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('scroll', trackScroll, { passive: true })
    return () => window.removeEventListener('scroll', trackScroll)
  }, [trackScroll, enabled])

  // Send final batch on unmount
  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current)
      }
      sendBatch()
    }
  }, [sendBatch])

  // Auto-send batch every 30 seconds for long sessions
  useEffect(() => {
    if (!enabled) return

    const autoSendInterval = setInterval(sendBatch, 30000)
    return () => clearInterval(autoSendInterval)
  }, [sendBatch, enabled])

  return {
    trackSectionExpansion,
    trackQuestionView,
    trackFeedbackSubmission,
    trackReadingTime,
    addToBatch,
    sendBatch,
    getCurrentEngagementData: () => ({
      ...engagementDataRef.current,
      currentSessionTime: Date.now() - engagementDataRef.current.startTime,
    }),
  }
}

export default useEngagementTracking
