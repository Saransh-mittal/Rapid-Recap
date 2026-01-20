// hooks/usePlayer.js
// Unified player context hook for both authenticated users and session players
// Now fetches live session player data from API for accurate info
import { useSelector } from 'react-redux'
import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

// Get session ID from localStorage (safe for SSR)
const getSessionId = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('playSessionId')
}

// Get initial session from localStorage (for initial render before API call)
const getInitialSession = () => {
  if (typeof window === 'undefined') return null
  const sessionId = localStorage.getItem('playSessionId')
  const inGameName = localStorage.getItem('playSessionName')
  // Try to recover tutorial progress to prevent flash of tutorial
  let tutorialProgress = null
  try {
      tutorialProgress = JSON.parse(localStorage.getItem('playSessionTutorialProgress'))
  } catch (e) {
      console.warn('Failed to parse tutorial progress', e)
  }

  if (sessionId) {
    return {
      sessionId,
      inGameName: inGameName || 'Player',
      trophies: null, // Will be fetched from API
      tutorialProgress: tutorialProgress || null
    }
  }
  return null
}

/**
 * usePlayer Hook
 *
 * Provides a unified player interface that works with:
 * 1. Authenticated users (from Redux store)
 * 2. Session players (from localStorage + API)
 *
 * Returns a player object with normalized properties
 */
export const usePlayer = () => {
  const { user } = useSelector(state => state.auth || {})
  // Get streak data from quickClash slice for authenticated users
  const { userStreak } = useSelector(state => state.quickClash || {})

  // Initialize with localStorage data for immediate render
  const [sessionPlayer, setSessionPlayer] = useState(getInitialSession)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Track if we've already fetched to avoid duplicate calls
  const fetchedRef = useRef(false)

  // Module-level cache for the active request to prevent duplicates across components
  // (Moving this inside the hook logic but using a global outside would be better,
  // but for now we rely on the component using the data to cache it or we make a global variable)

  // Fetch session player info from API
  const fetchSessionInfo = useCallback(async () => {
    const sessionId = getSessionId()
    if (!sessionId) {
      setSessionPlayer(null)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Check if we already have a request in flight globally
      if (!window.sessionRequestPromise) {
          window.sessionRequestPromise = axios.get('/api/play/me', {
            headers: { 'X-Session-Id': sessionId },
          })
      }

      const response = await window.sessionRequestPromise
      // Clear promise after success so future manual refreshes can work (if logic permits)
      // keeping it cached for short term to prevent duplicate mounts from re-fetching

      if (response.data.success && response.data.session) {
        const session = response.data.session
        const playerData = {
          sessionId: session.sessionId,
          inGameName: session.inGameName,
          trophies: session.trophies || 0,
          stats: session.stats || {},
          currentTeamId: session.currentTeamId,
          streak: session.streak, // Streak data from backend
          coins: session.coins || 0, // Coins from backend
          tutorialProgress: session.tutorialProgress,
        }
        setSessionPlayer(playerData)

        // Also update localStorage with latest name and tutorial progress
        localStorage.setItem('playSessionName', session.inGameName)
        if (session.tutorialProgress) {
             localStorage.setItem('playSessionTutorialProgress', JSON.stringify(session.tutorialProgress))
        }

        return playerData
      }
    } catch (err) {
      // Clear promise on error so we can retry
      window.sessionRequestPromise = null
      console.error('[usePlayer] Failed to fetch session info:', err)
      setError(err.response?.data?.message || 'Failed to fetch session info')

      // If session not found (expired), clear all session data from localStorage
      if (err.response?.status === 404) {
        localStorage.removeItem('playSessionId')
        localStorage.removeItem('playSessionName')
        localStorage.removeItem('sparkUpgraded')
        setSessionPlayer(null)
      }
    } finally {
      setLoading(false)
    }

    return null
  }, [])

  // Fetch session info on mount (only if session player)
  useEffect(() => {
    // Skip if we have an authenticated user
    if (user) {
      if (sessionPlayer) {
        setSessionPlayer(null)
      }
      fetchedRef.current = false
      return
    }

    // Fetch once on mount for session players
    const sessionId = getSessionId()
    if (sessionId && !fetchedRef.current) {
      fetchedRef.current = true
      fetchSessionInfo()
    }
  }, [user, fetchSessionInfo])

  // If authenticated user exists, prefer that
  if (user) {
    return {
      isAuthenticated: true,
      isSession: false,
      player: {
        _id: user._id,
        name: user.name,
        inGameName: user.inGameName || user.name,
        pic: user.pic,
        trophies: user.quickClashTrophies,
        // Include streak data from Redux quickClash slice
        streak: userStreak ? {
          dayStreak: userStreak.dayStreak || 0,
          longestStreak: userStreak.longestStreak || 0,
          isActive: userStreak.isActive || false,
          needsPlayToday: userStreak.needsPlayToday || true,
        } : null,
        tutorialProgress: user.tutorialProgress,
      },
      playerId: user._id,
      type: 'user',
      loading: false,
      error: null,
      refresh: () => Promise.resolve(), // No-op for authenticated users
    }
  }

  // Fall back to session player
  if (sessionPlayer) {
    return {
      isAuthenticated: false,
      isSession: true,
      player: {
        sessionId: sessionPlayer.sessionId,
        name: sessionPlayer.inGameName,
        inGameName: sessionPlayer.inGameName,
        pic: null,
        trophies: sessionPlayer.trophies,
        stats: sessionPlayer.stats,
        currentTeamId: sessionPlayer.currentTeamId,
        streak: sessionPlayer.streak, // Streak data
        coins: sessionPlayer.coins ?? 0, // Coins data
        tutorialProgress: sessionPlayer.tutorialProgress,
      },
      playerId: sessionPlayer.sessionId,
      type: 'session',
      loading,
      error,
      refresh: fetchSessionInfo, // Allow manual refresh
    }
  }

  // No player context available
  return {
    isAuthenticated: false,
    isSession: false,
    player: null,
    playerId: null,
    type: null,
    loading,
    error,
    refresh: fetchSessionInfo,
  }
}

export default usePlayer
