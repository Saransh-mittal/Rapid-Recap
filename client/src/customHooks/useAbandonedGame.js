// customHooks/useAbandonedGame.js - Handle abandoned game logic
import { useState, useCallback } from 'react'
import axios from 'axios'

export const useAbandonedGame = () => {
  const [submittingAbandoned, setSubmittingAbandoned] = useState(false)
  const [abandonedInfo, setAbandonedInfo] = useState(null)
  const [error, setError] = useState(null)

  /**
   * Submit an abandoned game attempt
   * @param {string} sessionId - Game session ID
   * @param {string} reason - Reason for abandonment
   * @returns {Object} Result of abandonment submission
   */
  const submitAbandonedGame = useCallback(
    async (sessionId, reason = 'unknown') => {
      if (!sessionId) {
        throw new Error('Session ID is required for abandoned game submission')
      }

      setSubmittingAbandoned(true)
      setError(null)

      try {
        const response = await axios.post('/api/gamehub/abandon', {
          sessionId,
          reason,
        })

        setAbandonedInfo(response.data.abandonmentInfo)

        console.log('Abandoned game submitted successfully:', {
          sessionId,
          reason,
          gameType: response.data.abandonmentInfo?.gameType,
        })

        return {
          success: true,
          abandonmentInfo: response.data.abandonmentInfo,
          alreadyAbandoned: response.data.alreadyAbandoned,
          message: response.data.message,
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || 'Failed to submit abandoned game'
        setError(errorMessage)

        console.error('Error submitting abandoned game:', error)

        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setSubmittingAbandoned(false)
      }
    },
    [],
  )

  /**
   * Check game session status and determine if it should be abandoned
   * @param {string} sessionId - Game session ID
   * @returns {Object} Session status information
   */
  const checkSessionStatus = useCallback(async sessionId => {
    if (!sessionId) {
      return {
        shouldAbandon: false,
        status: 'invalid',
        error: 'No session ID provided',
      }
    }

    try {
      const response = await axios.get(
        `/api/gamehub/session/status/${sessionId}`,
      )

      return {
        shouldAbandon: response.data.shouldAbandon,
        status: response.data.status,
        abandonmentReason: response.data.abandonmentReason,
        gameType: response.data.gameType,
        existingAttempt: response.data.existingAttempt,
        sessionInfo: response.data,
      }
    } catch (error) {
      console.error('Error checking session status:', error)

      return {
        shouldAbandon: true, // Default to abandoning if we can't check status
        status: 'error',
        abandonmentReason: 'connection_lost',
        error: error.response?.data?.error || 'Failed to check session status',
      }
    }
  }, [])

  /**
   * Check for abandoned attempts for a specific article
   * @param {string} articleId - Article ID
   * @returns {Object} Information about abandoned attempts
   */
  const checkAbandonedAttempts = useCallback(async articleId => {
    if (!articleId) {
      return {
        hasAbandonedAttempts: false,
        recentAbandonedAttempts: [],
        totalAbandonedCount: 0,
      }
    }

    try {
      const response = await axios.get(`/api/gamehub/abandoned/${articleId}`)

      return {
        hasAbandonedAttempts: response.data.hasAbandonedAttempts,
        recentAbandonedAttempts: response.data.recentAbandonedAttempts,
        totalAbandonedCount: response.data.totalAbandonedCount,
        lastAbandonedAt: response.data.lastAbandonedAt,
        lastAbandonedReason: response.data.lastAbandonedReason,
      }
    } catch (error) {
      console.error('Error checking abandoned attempts:', error)

      return {
        hasAbandonedAttempts: false,
        recentAbandonedAttempts: [],
        totalAbandonedCount: 0,
        error:
          error.response?.data?.error || 'Failed to check abandoned attempts',
      }
    }
  }, [])

  /**
   * Handle automatic abandonment with proper reason detection
   * @param {string} sessionId - Game session ID
   * @param {string} autoReason - Automatically detected reason
   * @returns {Object} Result of automatic abandonment
   */
  const handleAutoAbandon = useCallback(
    async (sessionId, autoReason = 'session_expired') => {
      console.log('Auto-abandoning game session:', {
        sessionId,
        reason: autoReason,
      })

      // First check the session status to see if it should be abandoned
      const statusCheck = await checkSessionStatus(sessionId)

      if (statusCheck.shouldAbandon) {
        const reason = statusCheck.abandonmentReason || autoReason
        return await submitAbandonedGame(sessionId, reason)
      }

      // If session doesn't need to be abandoned, still submit with the provided reason
      return await submitAbandonedGame(sessionId, autoReason)
    },
    [checkSessionStatus, submitAbandonedGame],
  )

  /**
   * Reset abandoned game state
   */
  const resetAbandonedState = useCallback(() => {
    setAbandonedInfo(null)
    setError(null)
    setSubmittingAbandoned(false)
  }, [])

  return {
    // State
    submittingAbandoned,
    abandonedInfo,
    error,

    // Actions
    submitAbandonedGame,
    checkSessionStatus,
    checkAbandonedAttempts,
    handleAutoAbandon,
    resetAbandonedState,
  }
}
